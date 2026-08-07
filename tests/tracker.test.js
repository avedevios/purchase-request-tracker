import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getItemCategoryInfo,
  getPrioClass,
  getStatusClass,
  getBallClass,
  getRoleClass,
  getResponseButtonLabel,
  renderPrioSwitcher,
  renderStatusSelect,
  renderBallSelect,
  renderRoleSelect
} from '../js/components.js';

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

function postChatMessage(item, currentUser, messageText) {
  if (!messageText || !messageText.trim()) return item;
  if (!item.comments) item.comments = [];
  item.comments.push({ author: currentUser, time: 'Aug 7, 10:23 AM', text: messageText.trim() });
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

// --- SUITE 2: REUSABLE BADGE BUTTON TRIGGER GENERATORS ---
describe('Reusable Badge Button Trigger Generators', () => {
  it('should generate status badge trigger button string', () => {
    const html = renderStatusSelect('Fixed');
    assert.ok(html.includes('status-cloud-btn'));
    assert.ok(html.includes('status-fixed'));
    assert.ok(html.includes('Fixed'));
  });

  it('should generate ball badge trigger button string', () => {
    const html = renderBallSelect('Anton');
    assert.ok(html.includes('ball-cloud-btn'));
    assert.ok(html.includes('ball-anton'));
    assert.ok(html.includes('Anton'));
  });

  it('should generate role badge trigger button string', () => {
    const html = renderRoleSelect('PM');
    assert.ok(html.includes('role-cloud-btn'));
    assert.ok(html.includes('role-badge'));
    assert.ok(html.includes('PM'));
  });
});

// --- SUITE 3: PRIORITY SWITCHER LOGIC ---
describe('Priority Switcher Logic [ M | S | C ]', () => {
  it('should set priority to clicked priority when unassigned', () => {
    assert.equal(togglePriority(null, 'Must'), 'Must');
  });

  it('should switch priority to a new level when different letter clicked', () => {
    assert.equal(togglePriority('Must', 'Should'), 'Should');
  });

  it('should toggle off priority to null when same active priority clicked', () => {
    assert.equal(togglePriority('Must', 'Must'), null);
  });

  it('should render HTML for priority switcher pill', () => {
    const html = renderPrioSwitcher({ priority: 'Must' });
    assert.ok(html.includes('active prio-must'));
  });
});

// --- SUITE 4: RESPONSE DISCUSSION THREAD LOGIC ---
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
    assert.equal(item.response, 'Verified fix in staging environment');
    assert.equal(item.ball, 'Adonis');
  });
});

// --- SUITE 5: DATA HIERARCHY & GROUPING ---
describe('2-Level Data Hierarchy Grouping', () => {
  const sampleData = [
    { category: 'WorkFlow', subcategory: 'DM Stage', issue: 'Issue A' },
    { category: 'WorkFlow', subcategory: 'DM Stage', issue: 'Issue B' },
    { category: 'WorkFlow', subcategory: 'PM Stage', issue: 'Issue C' },
    { category: 'Main menu', subcategory: null, issue: 'Issue D' }
  ];

  it('should group items under main level 1 category and level 2 subcategory', () => {
    const hierarchy = groupDataHierarchy(sampleData);
    assert.equal(hierarchy.size, 2);
    const workflowMap = hierarchy.get('WorkFlow');
    assert.equal(workflowMap.size, 2);
    assert.equal(workflowMap.get('DM Stage').length, 2);
  });
});
