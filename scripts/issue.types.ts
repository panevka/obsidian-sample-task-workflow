export const ALL_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type WeekdaysTuple = typeof ALL_WEEKDAYS;
export type Weekday = WeekdaysTuple[number];

export const ALL_ISSUE_TYPES = [
  "task",
  "impairment",
  "enhancement",
  "story",
  "epic",
  "initiative",
] as const;

type IssueTypesTuple = typeof ALL_ISSUE_TYPES;
export type IssueType = IssueTypesTuple[number];

export const ALL_PRIORITIES = [
  "lowest",
  "low",
  "medium",
  "high",
  "highest",
] as const;

type PrioritiesTuple = typeof ALL_PRIORITIES;
export type Priority = PrioritiesTuple[number];

export const ALL_STATUSES = ["backlog", "toDo", "inProgress", "done"] as const;
type StatusesTuple = typeof ALL_STATUSES;
export type Status = StatusesTuple[number];

export const ALL_RECURRING_FREQUENCIES = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
] as const;
type RecurringFrequenciesTuple = typeof ALL_RECURRING_FREQUENCIES;
export type RecurringFrequency = RecurringFrequenciesTuple[number];

export interface FormValues {
  id: string;
  "event-id"?: string; // different casing because of plugin requirements
  eventUrl?: string;
  creationDate: Date;
  title: string;
  description: string;
  type: IssueType;
  status: Status;
  priority: Priority;
  points: number;
  addToCalendar: boolean;
  isRecurring?: boolean;
  recurringConfigFrequency?: RecurringFrequency;
  recurringConfigInterval?: number;
  recurringConfigWeekdays?: Weekday[];
  dueDate: string;
  scheduledDateStart: string;
  scheduledDateEnd: string;
  childrenIssues?: string[];
  modificationMode?: boolean;
}

export interface DeleteEventFormValues {
  shouldDeleteAllOccurences: boolean;
}

interface FormResult {
  data: FormValues;
  status: "cancelled" | "ok";
}
