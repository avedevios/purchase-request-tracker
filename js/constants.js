/** @module constants — Shared string arrays for status, ball, and role option lists. */

/** @type {string[]} All valid item status values */
export const STATUSES = ['Fixed', 'To Do', 'Backlog', 'Deprecated'];

/** @type {string[]} All valid "ball in court" assignment values (empty = unassigned) */
export const BALLS = ['', 'Anton', 'Adonis'];

/** @type {string[]} All valid role tag values (empty = untagged) */
export const ROLES = ['', 'Emp', 'DM', 'PM', 'PO', 'GM'];
