// export class Validation {
//   isValidDate(possibleDate: string): boolean {
//     const date = new Date(possibleDate);
//     return !isNaN(date.getTime());
//   }
//
//   isValidInteger(possibleNumber: string): boolean {
//     const regex = /^[0-9]+$/g;
//     return regex.test(possibleNumber);
//   }
//
//   isValidWeekdayName(
//     possibleWeekdayName: unknown,
//   ): possibleWeekdayName is Weekday {
//     return (
//       typeof possibleWeekdayName === "string" &&
//       ALL_WEEKDAYS.includes(possibleWeekdayName.toLowerCase() as Weekday)
//     );
//   }
//
//   isValidIssueType(possibleIssueType: unknown): possibleIssueType is IssueType {
//     return (
//       typeof possibleIssueType === "string" &&
//       ALL_ISSUE_TYPES.includes(possibleIssueType.toLowerCase() as IssueType)
//     );
//   }
//
//   isValidStatus(possibleStatus: unknown): possibleStatus is Status {
//     return (
//       typeof possibleStatus === "string" &&
//       ALL_STATUSES.includes(possibleStatus as Status)
//     );
//   }
//
//   isValidRecurringFrequency(
//     possibleRecurringFrequency: unknown,
//   ): possibleRecurringFrequency is RecurringFrequency {
//     return (
//       typeof possibleRecurringFrequency === "string" &&
//       ALL_RECURRING_FREQUENCIES.includes(
//         possibleRecurringFrequency as RecurringFrequency,
//       )
//     );
//   }
//
//   isValidPointsValue(possiblePointsValue: string): boolean {
//     if (!this.isValidInteger(possiblePointsValue)) return false;
//
//     const pointsInt = parseInt(possiblePointsValue);
//     if (pointsInt > 0 && pointsInt < 144) return true;
//     else return false;
//   }
//
//   // Check whether form value field of type String meet defined requirements (such as title, description etc.)
//   isValidFormValueString(possibleValidString: any): boolean {
//     if (
//       typeof possibleValidString === "string" &&
//       possibleValidString.length > 5
//     )
//       return true;
//     else return false;
//   }
//
//   // isValidFormValuesObject(possibleFormValues: {}): boolean {
//   //
//   //   if()
//   //
//   // }
//   //
//   isTSInterface = <T>(
//     value: any,
//     keys: (keyof T)[],
//     requiredKeys: (keyof T)[],
//   ): value is T => {
//     if (typeof value !== "object" || value === null) return false;
//
//     return (
//       requiredKeys.every((key) => key in value) && //  Ensure all required keys are present
//       (Object.keys(value) as (keyof T)[]).every((key) => keys.includes(key)) //  Ensure no undefined keys are present
//     );
//   };
// }

export class ValueValidation {
  private readonly _v: unknown;
  private readonly _name: unknown;

  constructor(v: unknown, name: string) {
    this._v = v;
    this._name = name;
  }

  get v(): unknown {
    return this._v;
  }

  get name(): unknown {
    return this._name;
  }

  optional(): this {
    const { v } = this;
    if (v === undefined) return this.createNoopProxy();
    return this;
  }

  isDefined(): this {
    const { v, name } = this;
    if (v === undefined || v === null)
      throw new Error(`Missing variable: ${name}`);
    return this;
  }

  isObject(): this {
    const { v, name } = this;
    if (typeof v !== "object" || Array.isArray(v)) {
      throw new Error(`${name} should be an object`);
    }

    return this;
  }

  isBoolean(): this {
    const { v, name } = this;
    if (typeof v !== "boolean") {
      throw new Error(`${name} should be a boolean`);
    }

    return this;
  }
  isString(): this {
    const { v, name } = this;
    if (typeof v !== "string") {
      throw new Error(`${name} should be a string`);
    }

    return this;
  }

  isStringWithValidInteger(): this {
    const { v, name } = this;
    const value = v as string;

    const regex = /^[0-9]+$/g;
    if (!regex.test(value))
      throw new Error(
        `Variable ${name} of type String doesn't contain an integer`,
      );

    return this;
  }

  isInteger(): this {
    const { v, name } = this;
    const value = v as number;

    if (!Number.isInteger(value)) throw new Error(`${name} isn't an integer`);

    return this;
  }

  isStringWithValidDate(): this {
    const { v, name } = this;
    const value = v as string;
    const date = new Date(value);

    if (isNaN(date.getTime()))
      throw new Error(`Variable ${name} isn't a valid date`);
    return this;
  }

  isStringArray(): this {
    const { v, name } = this;
    const value = v as string[];

    if (!Array.isArray(value)) throw new Error(`${name} should be array`);
    if (value.length === 0) return this;

    value.forEach((e) => {
      if (typeof e !== "string")
        throw new Error(`${name}' elements are not typeof string`);
    });

    return this;
  }

  isInUnion<T extends readonly unknown[]>(allowedValues: T): this {
    const { v, name } = this;

    if (!allowedValues.includes(v as T[number])) {
      throw new Error(
        `Variable ${name} must be one of: ${allowedValues.join(", ")}`,
      );
    }

    return this;
  }

  isUnionArray<T extends readonly unknown[]>(allowedValues: T): this {
    const { v, name } = this;
    const value = v as Array<T>;

    value.map((el) => {
      if (!allowedValues.includes(el))
        throw new Error(
          `Variable ${name} contains elements that are not defined in given union, it must be one of ${allowedValues.join(", ")}`,
        );
    });

    return this;
  }

  isEmpty(): this {
    const { v, name } = this;
    const value = v as string;

    if (value.length === 0) throw new Error(`${name} is empty string`);

    return this;
  }

  minElements(amount: number): this {
    const { v, name } = this;
    const value = v as string[];

    if (value.length < amount)
      throw new Error(
        `${name} doesn't meet requirement of containing minimum ${amount} elements`,
      );

    return this;
  }

  maxElements(amount: number): this {
    const { v, name } = this;
    const value = v as string[];

    if (value.length > amount)
      throw new Error(
        `${name} doesn't meet requirement of containing maximum ${amount} elements`,
      );

    return this;
  }

  private createNoopProxy(): any {
    const handler = {
      get: (target: any, prop: string) => {
        if (typeof prop === "string") {
          return (...args: any[]) => new Proxy({}, handler);
        }
      },
    };
    return new Proxy({}, handler);
  }
}
