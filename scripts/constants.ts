// All paths are Paths are relative to Obsidian root vault folder
export const SCRIPTS_PATH = "scripts/issueManager.ts";
export const ISSUES_PATH = "Projects/Tasks";
export const ISSUE_FORM_NAME = "issueForm";
export const DELETE_EVENT_FORM_NAME = "issueFormEventDeleteOptions";
// this is one of most used date formats in obsidian environment
// therefore it will used to avoid need for convertion
export const DATE_FORMAT = "yyyy-MM-dd";
export const TIME_FORMAT = "HH:mm";
export const DATE_TIME_FORMAT = `${DATE_FORMAT}'T'${TIME_FORMAT}`;
export const GCALENDAR_NAME = "Zadania";
// ↓ this is a path to a mapping of YAML props for Google Calendar plugin
// to synchronize data within a note with calendar event while using custom property names
export const GCALENDAR_MAPPING_PATH =
  "Configs/Tasks/GoogleCalendarFrontmatterMapping.md";
