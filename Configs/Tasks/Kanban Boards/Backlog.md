```dataviewjs
let issueManager
let script;
await requireAsyncWrapper((require) => {
  const script = require("/scripts/issueManager.ts")
	const issueManager = new script.IssueManager(this.app)
	try{
		issueManager.createKanbanBoard(dv, "backlog")
	} catch (error) {
		new Notice(error.message, 5000)
	}
});
```