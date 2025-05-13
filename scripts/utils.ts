import { ValueValidation } from "./validation";
import {
  ALL_ISSUE_TYPES,
  ALL_PRIORITIES,
  ALL_RECURRING_FREQUENCIES,
  ALL_STATUSES,
  ALL_WEEKDAYS,
  FormValues,
  RecurringFrequency,
  Weekday,
} from "./issue.types";

export class IssueUtils {
  generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 6);
    const id = (timestamp + randomPart).slice(-8).toUpperCase();
    return id;
  }

  linkifyFile(
    parentDirectoryPath: string,
    filename: string,
    extension: string,
    alias?: string,
  ) {
    return `[[${parentDirectoryPath}/${filename}.${extension}|${filename}]]`;
  }

  extractNoteFileNameFromLink(filepath: string) {
    const re = /(?<=\[\[.*\/)[^\/]*(?=\.md)|(?=\]\])/;
    const filenameArr = filepath.match(re);

    new ValueValidation(filenameArr, "filename").isStringArray();

    if (filenameArr && filenameArr?.length > 0) {
      const filename = filenameArr[0];
      return filename;
    } else
      throw Error(
        "There was a problem related to extraction of a file name from link",
      );
  }

  validateFormValues(v: any) {
    new ValueValidation(v, "FormValues").isObject();
    new ValueValidation(v.id, "id").isDefined().isString().isEmpty();
    new ValueValidation(v.creationDate, "creationDate")
      .isDefined()
      .isStringWithValidDate();
    new ValueValidation(v.title, "title").isDefined().isString().isEmpty();
    new ValueValidation(v.description, "description")
      .isDefined()
      .isString()
      .isEmpty();
    new ValueValidation(v.type, "type")
      .isDefined()
      .isString()
      .isInUnion(ALL_ISSUE_TYPES);
    new ValueValidation(v.status, "status")
      .isDefined()
      .isString()
      .isInUnion(ALL_STATUSES);
    new ValueValidation(v.priority, "priority")
      .isDefined()
      .isString()
      .isInUnion(ALL_PRIORITIES);
    new ValueValidation(v.points, "points").isDefined().isInteger();
    new ValueValidation(v.scheduledDateStart, "scheduledDateStart")
      .isDefined()
      .isStringWithValidDate();
    new ValueValidation(v.scheduledDateEnd, "scheduledDateEnd")
      .isDefined()
      .isStringWithValidDate();
    new ValueValidation(v.dueDate, "dueDate")
      .isDefined()
      .isStringWithValidDate();
    new ValueValidation(v.childrenIssues, "childrenIssues")
      .optional()
      .isDefined()
      .isStringArray()
      .minElements(1);
    new ValueValidation(v.addToCalendar, "addToCalendar")
      .isDefined()
      .isBoolean();
    if (v.addToCalendar) {
      new ValueValidation(v["event-id"], "event-id")
        .isDefined()
        .isString()
        .isEmpty();
      new ValueValidation(v.eventUrl, "eventUrl")
        .isDefined()
        .isString()
        .isEmpty();
    }
    new ValueValidation(v.isRecurring, "isReccuring").isDefined().isBoolean();
    if (v.isRecurring) {
      new ValueValidation(
        v.recurringConfigFrequency,
        "recurringConfigFrequency",
      )
        .isDefined()
        .isInUnion(ALL_RECURRING_FREQUENCIES);
      new ValueValidation(
        v.recurringConfigInterval,
        "recurringConfigInterval",
      ).isInteger();
      new ValueValidation(v.recurringConfigWeekdays, "recurringConfigWeekdays")
        .optional()
        .isStringArray()
        .isUnionArray(ALL_WEEKDAYS)
        .minElements(1);
    }
  }

  establishFilePath(path: string, id: string, title: string): string {
    const filePath = `${path}/TS-${id} ${title}.md`;
    return filePath;
  }

  arrayToFrontmatterList(arr: string[]): string[] {
    let frontmatterList: string[] = [];

    arr.map((el) => frontmatterList.push(`- "${el}"`));

    return frontmatterList;
  }

  capitalizeFirstLetter(val: string): string {
    new ValueValidation(val, "stringParamInCapitalizaFirstLetter").isEmpty();
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  weekdayNameToRruleStandard = (dayName: Weekday) => {
    let standarizedName = dayName.slice(0, 2);
    standarizedName = this.capitalizeFirstLetter(standarizedName);
    return standarizedName;
  };

  createRecurrenceFormula(
    frequency: any,
    interval: any,
    recurrenceWeekdays?: any,
  ) {
    new ValueValidation(frequency, "frequency")
      .isDefined()
      .isInUnion(ALL_RECURRING_FREQUENCIES);
    new ValueValidation(interval, "interval").isDefined().isInteger();
    new ValueValidation(recurrenceWeekdays, "recurrenceWeekdays")
      .optional()
      .isDefined()
      .minElements(1)
      .isUnionArray(ALL_WEEKDAYS);

    let uniqufiedWeekdayArr = [...new Set(recurrenceWeekdays)];

    const weekdays: string = uniqufiedWeekdayArr
      .map((weekday) => this.weekdayNameToRruleStandard(weekday))
      .join();

    const frequencyFormula = `FREQ=${frequency};`;
    const intervalFormula = `INTERVAL=${interval};`;
    const weekStartFormula = `WKST=MO;`;
    const byDayFormula = weekdays?.length > 0 ? `BYDAY=${weekdays};` : "";

    return `RRULE:${frequencyFormula}${intervalFormula}${weekStartFormula}${byDayFormula}`;
  }

  getNoteFrontmatter(noteContent: string) {
    const re = /---\n((.+: .+\n)|(.+:\n(.*\n)+))+---/g;

    noteContent.match(re);
  }
}
