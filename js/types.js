/**
  * @typedef {'Fixed' | 'To Do' | 'Backlog' | 'Deprecated'} ItemStatus
  */

 /**
  * @typedef {'Must' | 'Should' | 'Could' | null} ItemPriority
  */

 /**
  * @typedef {'Emp' | 'DM' | 'PM' | 'PO' | 'GM' | null} UserRole
  */

 /**
  * @typedef {'Anton' | 'Adonis' | null} OnDutyUser
  */

 /**
  * @typedef {Object} CommentMessage
  * @property {string} author
  * @property {string} time
  * @property {string} text
  */

 /**
  * @typedef {Object} IssueItem
  * @property {string} category
  * @property {string|null} subcategory
  * @property {ItemStatus} status
  * @property {ItemPriority} priority
  * @property {UserRole} role
  * @property {OnDutyUser} ball
  * @property {string} issue
  * @property {string|null} response
  * @property {CommentMessage[]} [comments]
  */

 export {};
