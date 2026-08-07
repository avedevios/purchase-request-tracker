import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- HELPER LOGIC FROM INDEX.HTML & WORKER.JS ---

function getItemCategoryInfo(item) {
  let cat = item.category || 'Uncategorized';
  let subcat = item.subcategory || null;

  if (cat.includes('>')) {
    const parts = cat.split('>').map(s => s.trim());
    cat = parts[0];
    subcat = parts[1] || null;
  }
  return { category: cat, subcategory: subcat };
}

function calculateStats(dataset) {
  return {
    total: dataset.length,
    fixed: dataset.filter(d => d.status === 'Fixed').length,
    todo: dataset.filter(d => d.status === 'To Do').length,
    backlog: dataset.filter(d => d.status === 'Backlog').length,
    deprecated: dataset.filter(d => d.status === 'Deprecated').length
  };
}

function filterData(dataset, currentFilter) {
  if (currentFilter === 'ALL') return dataset;
  return dataset.filter(item => item.status === currentFilter);
}

function togglePriority(currentPrio, clickedPrio) {
  return currentPrio === clickedPrio ? null : clickedPrio;
}

function getResponseButtonLabel(item) {
  if (item.comments && item.comments.length > 0) {
    const lastMsg = item.comments[item.comments.length - 1];
    return `💬 (${item.comments.length}) ${lastMsg.text}`;
  }
  if (item.response) {
    return `💬 ${item.response}`;
  }
  return `+ Add Response`;
}

function postChatMessage(item, currentUser, messageText) {
  if (!messageText || !messageText.trim()) return item;

  if (!item.comments) item.comments = [];
  const nowStr = 'Aug 7, 10:23 AM';

  item.comments.push({
    author: currentUser,
    time: nowStr,
    text: messageText.trim()
  });

  item.response = messageText.trim();
  return item;
}

function groupDataHierarchy(dataset) {
  const hierarchy = new Map();
  dataset.forEach(item => {
    const { category: level1, subcategory: level2 } = getItemCategoryInfo(item);
    if (!hierarchy.has(level1)) hierarchy.set(level1, new Map());
    const level1Map = hierarchy.get(level1);
    if (!level1Map.has(level2)) level1Map.set(level2, []);
    level1Map.get(level2).push(item);
  });
  return hierarchy;
}

function handleWorkerRequest(method, pathName, bodyData, mockKvData) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (method === 'OPTIONS') {
    return { status: 204, headers: corsHeaders };
  }

  if (method === 'GET') {
    return { status: 200, headers: corsHeaders, body: mockKvData };
  }

  if (method === 'POST') {
    if (!bodyData || !bodyData.dataset || !Array.isArray(bodyData.dataset)) {
      return { status: 400, headers: corsHeaders, body: { error: 'Invalid payload: dataset array required' } };
    }
    return { status: 200, headers: corsHeaders, body: { success: true, count: bodyData.dataset.length } };
  }

  return { status: 405, headers: corsHeaders, body: { error: 'Method not allowed' } };
}

// --- SUITE 1: CATEGORY & SUBCATEGORY EXTRACTION LOGIC ---
describe('Category & Subcategory Parsing', () => {
  it('should parse separate category and subcategory properties', () => {
    const item = { category: 'Purchase Request Form', subcategory: 'Purchase Request Form Fields' };
    const result = getItemCategoryInfo(item);
    assert.equal(result.category, 'Purchase Request Form');
    assert.equal(result.subcategory, 'Purchase Request Form Fields');
  });

  it('should fallback to null subcategory if not present', () => {
    const item = { category: 'Notifications', subcategory: null };
    const result = getItemCategoryInfo(item);
    assert.equal(result.category, 'Notifications');
    assert.equal(result.subcategory, null);
  });

  it('should split legacy category string with arrow separator', () => {
    const item = { category: 'WorkFlow > DM Stage', subcategory: null };
    const result = getItemCategoryInfo(item);
    assert.equal(result.category, 'WorkFlow');
    assert.equal(result.subcategory, 'DM Stage');
  });
});

// --- SUITE 2: PRIORITY SWITCHER LOGIC ---
describe('Priority Switcher Logic [ M | S | C ]', () => {
  it('should set priority to clicked priority when unassigned', () => {
    const newPrio = togglePriority(null, 'Must');
    assert.equal(newPrio, 'Must');
  });

  it('should switch priority to a new level when different letter clicked', () => {
    const newPrio = togglePriority('Must', 'Should');
    assert.equal(newPrio, 'Should');
  });

  it('should toggle off priority to null when same active priority clicked', () => {
    const newPrio = togglePriority('Must', 'Must');
    assert.equal(newPrio, null);
  });
});

// --- SUITE 3: RESPONSE DISCUSSION THREAD LOGIC ---
describe('Response Discussion Thread & Labeling', () => {
  it('should display "+ Add Response" for items without responses', () => {
    const item = { issue: 'Test issue', comments: [], response: null };
    assert.equal(getResponseButtonLabel(item), '+ Add Response');
  });

  it('should display string response for legacy items', () => {
    const item = { issue: 'Test issue', comments: [], response: 'Legacy resolution notes' };
    assert.equal(getResponseButtonLabel(item), '💬 Legacy resolution notes');
  });

  it('should display message count and latest message text when comments exist', () => {
    const item = {
      issue: 'Test issue',
      comments: [
        { author: 'Adonis', time: 'Aug 1', text: 'First response' },
        { author: 'Anton', time: 'Aug 2', text: 'Second response update' }
      ]
    };
    assert.equal(getResponseButtonLabel(item), '💬 (2) Second response update');
  });

  it('should append new chat message and update response text without auto-mutating ball', () => {
    const item = { issue: 'Test issue', ball: 'Adonis', comments: [] };
    postChatMessage(item, 'Anton', 'Verified fix in staging environment');

    assert.equal(item.comments.length, 1);
    assert.equal(item.comments[0].author, 'Anton');
    assert.equal(item.comments[0].text, 'Verified fix in staging environment');
    assert.equal(item.response, 'Verified fix in staging environment');
    // Ball should remain untouched (manual control)
    assert.equal(item.ball, 'Adonis');
  });
});

// --- SUITE 4: DATA HIERARCHY & GROUPING ---
describe('2-Level Data Hierarchy Grouping', () => {
  const sampleData = [
    { category: 'WorkFlow', subcategory: 'DM Stage', issue: 'Issue A' },
    { category: 'WorkFlow', subcategory: 'DM Stage', issue: 'Issue B' },
    { category: 'WorkFlow', subcategory: 'PM Stage', issue: 'Issue C' },
    { category: 'Main menu', subcategory: null, issue: 'Issue D' }
  ];

  it('should group items under main level 1 category and level 2 subcategory', () => {
    const hierarchy = groupDataHierarchy(sampleData);
    assert.equal(hierarchy.size, 2); // WorkFlow and Main menu

    const workflowMap = hierarchy.get('WorkFlow');
    assert.equal(workflowMap.size, 2); // DM Stage and PM Stage
    assert.equal(workflowMap.get('DM Stage').length, 2);
    assert.equal(workflowMap.get('PM Stage').length, 1);

    const menuMap = hierarchy.get('Main menu');
    assert.equal(menuMap.size, 1);
    assert.equal(menuMap.get(null).length, 1);
  });
});

// --- SUITE 5: CLOUDFLARE WORKER BACKEND CONTRACT ---
describe('Cloudflare Worker KV & WebSocket API Contract', () => {
  it('should return CORS headers on preflight OPTIONS request', () => {
    const res = handleWorkerRequest('OPTIONS', '/', null, []);
    assert.equal(res.status, 204);
    assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
  });

  it('should return stored KV dataset on GET request', () => {
    const mockData = [{ issue: 'Worker test item', status: 'To Do' }];
    const res = handleWorkerRequest('GET', '/', null, mockData);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, mockData);
  });

  it('should reject POST request with invalid payload', () => {
    const res = handleWorkerRequest('POST', '/', { invalid: true }, []);
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('should accept POST request with valid dataset array', () => {
    const body = { dataset: [{ issue: 'Updated item', status: 'Fixed' }] };
    const res = handleWorkerRequest('POST', '/', body, []);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
  });
});

// --- SUITE 6: DATA FILTERING & STATS CALCULATIONS ---
describe('Data Filtering & Stats Calculation', () => {
  const sampleData = [
    { category: 'Cat1', status: 'Fixed', issue: 'Issue 1' },
    { category: 'Cat1', status: 'To Do', issue: 'Issue 2' },
    { category: 'Cat2', status: 'Backlog', issue: 'Issue 3' },
    { category: 'Cat2', status: 'Deprecated', issue: 'Issue 4' },
    { category: 'Cat2', status: 'Fixed', issue: 'Issue 5' }
  ];

  it('should return all items when filter is ALL', () => {
    const filtered = filterData(sampleData, 'ALL');
    assert.equal(filtered.length, 5);
  });

  it('should filter items strictly by status', () => {
    const fixedItems = filterData(sampleData, 'Fixed');
    assert.equal(fixedItems.length, 2);
    assert.ok(fixedItems.every(i => i.status === 'Fixed'));

    const todoItems = filterData(sampleData, 'To Do');
    assert.equal(todoItems.length, 1);

    const backlogItems = filterData(sampleData, 'Backlog');
    assert.equal(backlogItems.length, 1);
  });

  it('should correctly calculate dashboard stats totals', () => {
    const stats = calculateStats(sampleData);
    assert.equal(stats.total, 5);
    assert.equal(stats.fixed, 2);
    assert.equal(stats.todo, 1);
    assert.equal(stats.backlog, 1);
    assert.equal(stats.deprecated, 1);
  });
});

// --- SUITE 7: DATASET INTEGRITY (purchase_requests.json) ---
describe('JSON Dataset Schema & Integrity', () => {
  const jsonPath = path.resolve(process.cwd(), 'purchase_requests.json');

  it('should contain a valid purchase_requests.json file', () => {
    assert.ok(fs.existsSync(jsonPath), 'purchase_requests.json file exists');
  });

  it('should parse purchase_requests.json as a non-empty array', () => {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(content);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
  });

  it('every item should have category, status, and issue fields', () => {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(content);
    const validStatuses = ['Fixed', 'To Do', 'Backlog', 'Deprecated'];

    data.forEach((item, index) => {
      assert.ok(item.category, `Item #${index} missing category`);
      assert.ok(item.status, `Item #${index} missing status`);
      assert.ok(validStatuses.includes(item.status), `Item #${index} invalid status: ${item.status}`);
      assert.ok(typeof item.issue === 'string' && item.issue.length > 0, `Item #${index} invalid issue string`);
    });
  });
});
