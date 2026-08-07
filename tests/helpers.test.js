import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  tag,
  td,
  badge,
  getBallClass,
  getStatusClass,
  getPrioClass,
  getRoleClass,
  renderResponseBtn
} from '../js/components.js';

import { sortDataset } from '../js/views/table.js';



describe('EDSL HTML Builder Helpers', () => {
  it('should construct valid HTML tag with attributes', () => {
    const html = tag('div', 'my-class', 'Hello World', 'id="box"');
    assert.equal(html, '<div class="my-class" id="box">Hello World</div>');
  });

  it('should construct td element', () => {
    const html = td('cell-class', 'Cell Data');
    assert.equal(html, '<td class="cell-class">Cell Data</td>');
  });

  it('should construct badge element', () => {
    const html = badge('status-fixed', 'Fixed');
    assert.equal(html, '<span class="badge status-fixed">Fixed</span>');
  });
});

// --- SUITE 7: CSS CLASS MAPPER HELPERS & FALLBACKS ---
describe('CSS Class Mapper Fallbacks', () => {
  it('should return ball-anton for Anton and ball-adonis for Adonis', () => {
    assert.equal(getBallClass('Anton'), 'ball-anton');
    assert.equal(getBallClass('Adonis'), 'ball-adonis');
    assert.equal(getBallClass(null), 'ball-none');
    assert.equal(getBallClass(''), 'ball-none');
  });

  it('should return status classes for valid and fallback statuses', () => {
    assert.equal(getStatusClass('Fixed'), 'status-fixed');
    assert.equal(getStatusClass('To Do'), 'status-todo');
    assert.equal(getStatusClass('Backlog'), 'status-backlog');
    assert.equal(getStatusClass('Deprecated'), 'status-deprecated');
    assert.equal(getStatusClass(null), 'status-deprecated');
  });

  it('should return priority classes for valid and fallback priorities', () => {
    assert.equal(getPrioClass('Must'), 'prio-must');
    assert.equal(getPrioClass('Should'), 'prio-should');
    assert.equal(getPrioClass('Could'), 'prio-could');
    assert.equal(getPrioClass(null), 'prio-none');
  });

  it('should return role class only when role is provided', () => {
    assert.equal(getRoleClass('PM'), 'role-badge');
    assert.equal(getRoleClass(null), 'role-none');
    assert.equal(getRoleClass(''), 'role-none');
  });
});

// --- SUITE 8: RESPONSE BUTTON RENDERING ---
describe('Response Button Rendering', () => {
  it('should render empty response button class when no responses exist', () => {
    const html = renderResponseBtn({ issue: 'Sample issue' });
    assert.ok(html.includes('empty-response'));
    assert.ok(html.includes('+ Add Response'));
  });

  it('should render active response button when comments exist', () => {
    const html = renderResponseBtn({
      issue: 'Sample issue',
      comments: [{ author: 'Anton', time: '10:00', text: 'Working on it' }]
    });
    assert.ok(!html.includes('empty-response'));
    assert.ok(html.includes('💬 (1) Working on it'));
  });
});

// --- SUITE 9: DATASET SORTING LOGIC ---
describe('Dataset Sorting Logic', () => {
  const sampleItems = [
    { issue: 'Alpha', priority: 'Could', status: 'Deprecated' },
    { issue: 'Beta', priority: 'Must', status: 'To Do' },
    { issue: 'Gamma', priority: 'Should', status: 'Fixed' }
  ];

  it('should sort items by priority (Must > Should > Could)', () => {
    const sorted = sortDataset(sampleItems, 'priority', 'desc');
    assert.equal(sorted[0].priority, 'Must');
    assert.equal(sorted[1].priority, 'Should');
    assert.equal(sorted[2].priority, 'Could');
  });

  it('should sort items alphabetically by issue text', () => {
    const sorted = sortDataset(sampleItems, 'issue', 'asc');
    assert.equal(sorted[0].issue, 'Alpha');
    assert.equal(sorted[2].issue, 'Gamma');
  });
});
