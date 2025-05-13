---
id: "KH2YP7VT"
creationDate: "2025-05-13T16:18"
title: "ddd"
description: "ddd"
type: "task"
status: "backlog"
priority: "medium"
points: 0
addToCalendar: false
isRecurring: false
dueDate: "2025-05-13T00:00"
scheduledDateStart: "2025-05-13T00:00"
scheduledDateEnd: "2025-05-13T00:00"
---
```dataviewjs
let script;
await requireAsyncWrapper((require) => {
  script = require("/scripts/issueManager.ts")
});
const issueManager = new script.IssueManager(this.app)
try {
const fpath = dv.current().file.path;
issueManager.createModifyButton(dv, fpath)
issueManager.createNoteContent(dv, fpath)
}
catch (error){
new Notice(error.message, 5000)
}
```
# Content
