import { IssueManager } from "../issueManager.ts";

export async function invoke(app): Promise<void> {
  try {
    const a = new IssueManager(app);
    await a.createIssue();
  } catch (error) {
    new Notice(error.message, 15000);
  }
}
