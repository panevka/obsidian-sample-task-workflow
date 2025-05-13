class CreateIssueUtils {
  // Utils

  listifyValue(val) {
    return `- ${val}`;
  }

  linkifyIssueNote(parentDirectoryPath, filename) {
    return `[[${parentDirectoryPath}${filename}|${filename}]]`;
  }

  getAliasFromNoteLink(noteLink) {
    const re = /(?<=\[\[.*\|).*(?=\]\])/g;
    const matchResult = noteLink.match(re);
    if (matchResult.length > 0) return matchResult[0];

    return null;
  }

  // Deprecated function
  getIdFromFilename(filename) {
    const re = /(?<=^\[)(\w|\d){8}(?=\].*$)/;

    const id = filename.match(re);

    if (id === null || id[0] === "")
      throw TypeError("Couldn't find an ID in given filename.");

    return id[0];
  }

  wrapInCodeBlock(s, codeBlockType = "") {
    return `\`\`\`${codeBlockType}\n${s}\n\`\`\``;
  }

  isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  capitalizeFirstLetter(val) {
    if (val.length < 1)
      throw TypeError(
        "String cannot be capitalized due to number of characters smaller than 1.",
      );
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  isObjectEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  }

  stringToArray = (s) => {
    try {
      return JSON.parse(s);
    } catch (e) {
      throw new TypeError("Couldn't transform string to array: " + e);
    }
  };

  isValidWeekdayName(name) {
    const weekdays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    return weekdays.includes(name.toLowerCase());
  }

  weekdayNameToRruleStandard = (dayName) => {
    if (isValidWeekdayName(dayName)) {
      let standarizedName = dayName.toLowerCase().slice(0, 2);
      standarizedName = capitalizeFirstLetter(standarizedName);
      return standarizedName;
    } else {
      throw new TypeError("Passed variable is not a valid weekday name.");
    }
  };

  isValidRRuleFrequency = (s) => {
    const availableFrequencies = ["DAILY", "WEEKLY", "MONTHLY"];

    return availableFrequencies.includes(s);
  };

  // Utils end

  createRecurrenceFormula = (frequency, interval, recurrenceWeekdays) => {
    const frequencyUpper = frequency.toUpperCase();

    const areWeekDaysValid =
      recurrenceWeekdays.length === 0
        ? true
        : recurrenceWeekdays.every((weekday) => {
            return isValidWeekdayName(weekday) === true;
          });
    const isFrequencyValid = isValidRRuleFrequency(frequencyUpper);
    const isIntervalValid = isNumber(interval);

    if (!isIntervalValid || !isFrequencyValid || !areWeekDaysValid) {
      throw new TypeError(
        "Some of the params aren't valid, frequency, interval or reccurenceWeekdays",
      );
    }

    const standarizedRecurrenceWeekdays = recurrenceWeekdays
      .map((weekday) => weekdayNameToRruleStandard(weekday))
      .join();

    const frequencyFormula = `FREQ=${frequency};`;
    const intervalFormula =
      interval === undefined || interval === null
        ? ""
        : `INTERVAL=${interval};`;
    const weekStartFormula = `WKST=MO;`;
    const byDayFormula =
      standarizedRecurrenceWeekdays.length > 0
        ? `BYDAY=${standarizedRecurrenceWeekdays};`
        : "";

    return `RRULE:${frequencyFormula}${intervalFormula}${weekStartFormula}${byDayFormula}`;
  };

  generateUniqueId = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 6);
    const id = (timestamp + randomPart).slice(-8);
    return id;
  };

  createGoogleCalendarEvent = async (eventDataObject) => {
    const { createEvent } = APP.plugins.plugins["google-calendar"].api;
    const createdEvent = await createEvent(eventDataObject);
    return createdEvent;
  };

  getCalendars = async () => {
    const { getCalendars } = APP.plugins.plugins["google-calendar"].api;

    const calendars = await getCalendars();

    return calendars;
  };

  getCalendarByName = async (name) => {
    try {
      const calendars = await getCalendars();
      const calendar = calendars.find((cal) => cal.summary === name);
      return calendar;
    } catch (error) {
      return error;
    }
  };
}

// const CreateIssueUtils = (app) => {
//   APP = app;
//   return {
//     generateUniqueId,
//     createGoogleCalendarEvent,
//     getCalendars,
//     getCalendarByName,
//     createRecurrenceFormula,
//     stringToArray,
//     getIdFromFilename,
//     linkifyIssueNote,
//     listifyValue,
//     wrapInCodeBlock,
//     getAliasFromNoteLink,
//   };
// };
//
// module.exports = CreateIssueUtils;
