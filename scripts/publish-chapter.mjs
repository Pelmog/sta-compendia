#!/usr/bin/env node
/**
 * Publish a chapter HTML file to Foundry VTT as a JournalEntry page.
 * Uses the same socket.io protocol as the MCP server.
 *
 * Usage: node publish-chapter.mjs <html-file> <journal-name> <page-name>
 */

import { readFileSync } from 'fs';
import { io } from 'socket.io-client';
import http from 'http';

const FOUNDRY_HOST = 'localhost';
const FOUNDRY_PORT = 30000;
const FOUNDRY_USER_ID = 'EIwN2Llo20zGVLJ8';
const FOUNDRY_PASSWORD = '';

const [,, htmlFile, journalName, pageName] = process.argv;

if (!htmlFile || !journalName || !pageName) {
  console.error('Usage: node publish-chapter.mjs <html-file> <journal-name> <page-name>');
  process.exit(1);
}

const htmlContent = readFileSync(htmlFile, 'utf-8');
const baseUrl = `http://${FOUNDRY_HOST}:${FOUNDRY_PORT}`;

function log(...args) { console.error('[publish]', ...args); }

async function fetchJSON(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({ hostname: FOUNDRY_HOST, port: FOUNDRY_PORT, path, method, headers }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        const sessionMatch = setCookie?.find(c => c.startsWith('session='))?.match(/session=([^;]+)/);
        try { resolve({ status: res.statusCode, body: JSON.parse(data), session: sessionMatch?.[1] }); }
        catch { resolve({ status: res.statusCode, body: data, session: sessionMatch?.[1] }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Step 1: GET /join to get session cookie
  const joinPage = await fetchJSON('GET', '/join');
  let session = joinPage.session;
  if (!session) {
    const gamePage = await fetchJSON('GET', '/game');
    session = gamePage.session;
  }
  if (!session) throw new Error('No session cookie');
  log('Got session cookie');

  // Step 2: POST /join to authenticate
  const joinRes = await fetchJSON('POST', '/join', {
    action: 'join',
    userid: FOUNDRY_USER_ID,
    password: FOUNDRY_PASSWORD
  }, `session=${session}`);
  if (joinRes.session) session = joinRes.session;
  log('Authenticated, status:', joinRes.body?.status || joinRes.status);

  // Step 3: Connect socket.io
  const socket = io(baseUrl, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    query: { session },
    reconnection: false
  });

  // Wait for session event
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('session event timeout')), 15000);
    socket.once('session', (data) => {
      clearTimeout(timeout);
      if (!data?.userId) reject(new Error('Not authenticated'));
      else { log('Session authenticated, userId:', data.userId); resolve(); }
    });
    socket.on('connect_error', (err) => { clearTimeout(timeout); reject(err); });
  });

  // Get world data
  const worldData = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('getJoinData timeout')), 15000);
    socket.emit('getJoinData', (data) => {
      clearTimeout(timeout);
      resolve(data);
    });
  });
  log('Connected to world:', worldData?.world?.title);

  // Helper for modifyDocument
  function modifyDocument(action, type, operation) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`${action} ${type} timeout`)), 30000);
      socket.emit('modifyDocument', { action, type, operation }, (response) => {
        clearTimeout(timeout);
        if (response?.error) reject(new Error(JSON.stringify(response.error)));
        else resolve(response?.result ?? response);
      });
    });
  }

  // Step 4: Search for existing journal
  log('Searching for journal:', journalName);
  const journals = await modifyDocument('get', 'JournalEntry', { query: {} });
  const existing = journals.find(j => j.name === journalName);

  let journalId;
  if (existing) {
    journalId = existing._id;
    log('Found existing journal:', journalId);
  } else {
    // Create the journal
    log('Creating journal:', journalName);
    const created = await modifyDocument('create', 'JournalEntry', {
      data: [{ name: journalName, ownership: { default: 1 } }]
    });
    journalId = created[0]?._id;
    log('Created journal:', journalId);
  }

  // Step 5: Add a page to the journal using modifyDocument with parent
  log('Adding page:', pageName);
  const pages = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('create page timeout')), 30000);
    socket.emit('modifyDocument', {
      action: 'create',
      type: 'JournalEntryPage',
      operation: {
        data: [{
          name: pageName,
          type: 'text',
          text: {
            format: 1,
            content: htmlContent
          },
          ownership: { default: 2 }
        }],
        parentUuid: `JournalEntry.${journalId}`
      }
    }, (response) => {
      clearTimeout(timeout);
      if (response?.error) reject(new Error(JSON.stringify(response.error)));
      else resolve(response?.result ?? response);
    });
  });

  const pageId = pages?.[0]?._id;
  log('Created page:', pageId);

  console.log(JSON.stringify({
    success: true,
    journalId,
    pageId,
    journalName,
    pageName
  }, null, 2));

  socket.disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
