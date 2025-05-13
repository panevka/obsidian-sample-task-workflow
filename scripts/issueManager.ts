import {
  ALL_PRIORITIES,
  DeleteEventFormValues,
  FormValues,
  Status,
} from "./issue.types.ts";
import { IssueUtils } from "./utils.ts";
import {
  SCRIPTS_PATH,
  ISSUE_FORM_NAME,
  DATE_FORMAT,
  TIME_FORMAT,
  DATE_TIME_FORMAT,
  ISSUES_PATH,
  GCALENDAR_NAME,
  DELETE_EVENT_FORM_NAME,
} from "./constants.ts";
import { GoogleCalendar } from "./googleCalendar.ts";
import { ValueValidation } from "./validation.ts";

export class IssueManager {
  app: any;
  dv: any;
  modalForms: any;
  container: any;
  obsidianRef: any;
  utils: IssueUtils;
  // GCalendar: GoogleCalendar;
  // issuesPath: string;
  // scriptPath: string;
  // issueFormName: string;
  // dateFormat: string;
  // timeFormat: string;
  // dateTimeFormat: string;

  constructor(appRef: any) {
    this.app = appRef;
    this.dv = this.app.plugins.plugins.dataview.api;
    this.container = appRef.container;
    this.modalForms = this.app.plugins.plugins.modalforms.api;
    this.obsidianRef = appRef;
    this.utils = new IssueUtils();
    // this.GCalendar = new GoogleCalendar(
    //   this.app.plugins.plugins["google-calendar"].api,
    // );
  }

  public async createIssue() {
    // Different Luxon date time format is required by Obsidian Modal Forms plugin to set default data values
    const defaultFormValues: FormValues = {
      id: this.utils.generateUniqueId(),
      "event-id": "",
      eventUrl: "",
      creationDate: this.dv.func.dateformat(
        this.dv.date("now"),
        DATE_TIME_FORMAT,
      ),
      title: "",
      description: "",
      type: "task",
      status: "backlog",
      priority: "medium",
      points: 0,
      addToCalendar: false,
      dueDate: this.dv.func.dateformat(this.dv.date("today"), DATE_TIME_FORMAT),
      scheduledDateStart: this.dv.func.dateformat(
        this.dv.date("today"),
        DATE_TIME_FORMAT,
      ),
      scheduledDateEnd: this.dv.func.dateformat(
        this.dv.date("today"),
        DATE_TIME_FORMAT,
      ),
    };

    const result = await this.modalForms.openForm(ISSUE_FORM_NAME, {
      values: defaultFormValues,
    });

    if (result.status !== "ok")
      throw new Error(
        "Form didn't finish successfully (might've been canceled).",
      );

    const d: FormValues = result.data;

    const filePath = this.utils.establishFilePath(ISSUES_PATH, d.id, d.title);

    const existingFile = this.app.vault.getAbstractFileByPath(filePath);
    if (existingFile)
      throw new Error(`File with exactly the same name exists: ${filePath}`);

    if (d.addToCalendar === true) {
      const calendarData =
        await this.GCalendar.getCalendarByName(GCALENDAR_NAME);
      const eventData = {
        parent: calendarData,
        summary: d.title,
        start: {
          dateTime: d.scheduledDateStart,
        },
        end: {
          dateTime: d.scheduledDateEnd,
        },
      };

      if (d.isRecurring) {
        eventData.recurrence = [
          this.utils.createRecurrenceFormula(
            d.recurringConfigFrequency,
            d.recurringConfigInterval,
            d.recurringConfigWeekdays,
          ),
        ];
      }
      const createdEventData =
        await this.GCalendar.createGoogleCalendarEvent(eventData);
      d["event-id"] = createdEventData.id;
      d.eventUrl = createdEventData.htmlLink;
    }
    let fileContent = "";

    const frontmatter = this.parseFormValuesToFrontmatterString(d);
    fileContent += frontmatter;

    const noteContent = this.createDataviewBlock([
      {
        fn: this.createModifyButton,
        isAsync: false,
        requiredParams: ["dv", "fpath"],
      },
      {
        fn: this.createNoteContent,
        isAsync: false,
        requiredParams: ["dv", "fpath"],
      },
    ]);
    fileContent += `${noteContent}\n`;

    fileContent += "# Content\n";

    this.app.vault.create(filePath, fileContent);
  }

  getMetaBindButtonBlock(
    style: string,
    label: string,
    id: string,
    command: string,
  ) {
    const block = `\`\`\`meta-bind-button
    style: ${style}
    label: ${label}
    id: ${id}
    action: 
      type: command 
      command: ${command}
  \`\`\``;

    return block;
  }

  createDataviewBlock(
    fns: {
      fn: (...args: any) => any;
      isAsync: boolean;
      requiredParams: string[];
    }[],
  ): string {
    return `\`\`\`dataviewjs
let script;
await requireAsyncWrapper((require) => {
  script = require("/${SCRIPTS_PATH}")
});
const issueManager = new script.IssueManager(this.app)
try {
const fpath = dv.current().file.path;
${this.stringifyFunctionsForDataview(fns).join("\n")}
}
catch (error){
new Notice(error.message, 5000)
}
\`\`\``;
  }
  stringifyFunctionsForDataview(
    fns: {
      fn: (...args: any) => any;
      isAsync: boolean;
      requiredParams: string[];
    }[],
  ) {
    const functionLines: string[] = [];
    for (let i = 0; i < fns.length; i++) {
      const fnObj = fns[i];
      const fnLine = `${fnObj.isAsync ? "await " : ""}issueManager.${fnObj.fn.name}(${fnObj.requiredParams.join(", ")})`;
      functionLines.push(fnLine);
    }

    return functionLines;
  }

  createNoteContent(dv) {
    const page = dv.current();
    const description = page.description;
    const title = page.title;
    dv.header(1, title);
    dv.span(description);

    const childrenIssuesTableHeaders = [
      "ID",
      "Title",
      "Status",
      "Priority",
      "Points",
      "Due Date",
    ];

    const childLinks = page.childrenIssues;

    const childPages = childLinks
      ?.map((link) => dv.page(link))
      .filter((p) => p); // Filter out undefined pages

    dv.header(1, "Subtasks");
    dv.table(
      childrenIssuesTableHeaders,
      childPages?.map((p) => [
        p.id,
        p.title,
        p.status,
        p.priority,
        p.points,
        p.dueDate,
      ]),
    );
  }

  createModifyButton(dv: any, fpath: string) {
    const btn = dv.container.createEl("button", { text: "Modify" });
    btn.addEventListener("click", async (e) => {
      try {
        e.preventDefault();

        const dvPage = this.dv.page(fpath);
        const frontmatter = dvPage.file.frontmatter;
        const frontmatterAsFormValues =
          this.transformFrontmatterForFormValuesUse(frontmatter);

        const result = await this.modalForms.openForm(ISSUE_FORM_NAME, {
          values: frontmatterAsFormValues,
        });

        if (result.status !== "ok")
          throw new Error(
            "Form didn't finish successfully (might've been canceled).",
          );

        const data: FormValues = this.transformFormValuesForFrontmatterUse(
          result.getData(),
        );

        // alert(JSON.stringify(data));

        // if (
        //   frontmatter.addToCalendar &&
        //   !data.addToCalendar &&
        //   frontmatter.isRecurring
        // ) {
        //   const secondFormResult = await this.modalForms.openForm(
        //     DELETE_EVENT_FORM_NAME,
        //   );
        //   const secondFormData: DeleteEventFormValues =
        //     secondFormResult.getData();
        //
        //   if (secondFormResult.status !== "ok")
        //     throw Error("Confirmation form");
        //
        //   new ValueValidation(secondFormData, "secondFormData").isDefined();
        //   new ValueValidation(
        //     secondFormData.shouldDeleteAllOccurences,
        //     "shouldDeleteAllOccurences",
        //   )
        //     .isDefined()
        //     .isBoolean();
        //
        //   this.GCalendar.deleteEvent(
        //     data["event-id"],
        //     secondFormData.shouldDeleteAllOccurences,
        //   );
        // }
        const file = this.app.vault.getAbstractFileByPath(fpath);

        if (frontmatter.title !== data.title) {
          this.app.fileManager.renameFile(
            file,
            `${ISSUES_PATH}/TS-${data.id} ${data.title}.md`,
          );
        }

        this.app.fileManager.processFrontMatter(file, (frontmatter) => {
          // Deletes properties that did not appear in result of modal form
          for (const [key, value] of Object.entries(frontmatter)) {
            if (!data.hasOwnProperty(key)) {
              delete frontmatter[key];
              continue;
            }

            frontmatter[key] = data[key];
          }

          alert(JSON.stringify(data));
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === "string") {
              frontmatter[key] === `\"${value}\"`;
              continue;
            }
            frontmatter[key] = value;
          }
          frontmatter = "dupa";
        });
      } catch (error) {
        new Notice(error.message);
      }
    });
    return btn;
  }

  createKanbanBoard(dvRef: any, chosenStatus: Status) {
    // const kanbanFields = [
    //   "Type",
    //   "Priority",
    //   "Points",
    //   "Name",
    //   "Status",
    //   "Change",
    // ];
    const kanbanFields = ["Name", ""];
    const allIssueFiles = dvRef.pages(`"${ISSUES_PATH}"`);
    const statusSpecificFiles = allIssueFiles.filter(
      (p) => p.file.frontmatter.status === chosenStatus,
    );
    const values = statusSpecificFiles.map((p) => [
      p.file.frontmatter.priority,
      p.file.link,
    ]).values;

    const sortedValues = values.toSorted((firstElement, secondElement) => {
      const a = ALL_PRIORITIES.indexOf(firstElement[0]);
      const b = ALL_PRIORITIES.indexOf(secondElement[0]);

      if (a > b) return -1;
      else if (b > a) return 1;
      else return 0;
    });

    dvRef.table(kanbanFields, sortedValues);
  }

  transformFormValuesForFrontmatterUse(formValues: FormValues): FormValues {
    let fV: FormValues = Object.assign({}, formValues);

    if (fV.childrenIssues && fV.childrenIssues.length > 0) {
      fV.childrenIssues = fV.childrenIssues.map((issue) =>
        this.utils.linkifyFile(ISSUES_PATH, issue, "md"),
      );
    }
    // If childrenIssues is an empty array then delete the property
    // this prevents any issues related to obsidan-modal-form plugin sending
    // empty array after input click, instead of object without the property
    else if (fV?.childrenIssues?.length === 0) {
      delete fV.childrenIssues;
    }

    // If isRecurring isn't contained in form values then config variables
    // shouldn't appear either
    if (!fV.isRecurring) {
      delete fV?.recurringConfigInterval;
      delete fV?.recurringConfigWeekdays;
      delete fV?.recurringConfigFrequency;
    }

    if (!fV.addToCalendar) {
      delete fV["event-id"];
      delete fV.eventUrl;
    }

    this.utils.validateFormValues(fV);
    return fV;
  }

  parseFormValuesToFrontmatterString(formValues: FormValues) {
    const frontmatterObj: FormValues =
      this.transformFormValuesForFrontmatterUse(formValues);

    let frontmatterLines: string[] = [];

    for (const [key, value] of Object.entries(frontmatterObj)) {
      let line = `${key}: ${value}`;
      if (Array.isArray(value)) {
        const elementList = this.utils.arrayToFrontmatterList(value);
        frontmatterLines.push(`${key}:`);
        frontmatterLines = [...frontmatterLines, ...elementList];
        continue;
      } else if (typeof value === "string") {
        line = `${key}: "${value}"`;
      }
      frontmatterLines.push(line);
    }

    return `---\n${frontmatterLines.join("\n")}\n---\n`;
  }

  transformFrontmatterForFormValuesUse(frontmatter: FormValues) {
    this.utils.validateFormValues(frontmatter);

    const fR = Object.assign(frontmatter);
    if (fR.childrenIssues) {
      fR.childrenIssues = fR.childrenIssues.map((is: string) =>
        this.utils.extractNoteFileNameFromLink(is),
      );
    }

    return fR;
  }
}
