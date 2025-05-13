export class GoogleCalendar {
  gCalendarAPI: any;
  constructor(gCalendarAPI: any) {
    this.gCalendarAPI = gCalendarAPI;
  }
  async createGoogleCalendarEvent(eventDataObject) {
    const createdEvent = await this.gCalendarAPI.createEvent(eventDataObject);
    return createdEvent;
  }

  async getCalendarByName(name: string) {
    const calendars = await this.gCalendarAPI.getCalendars();
    const calendar = calendars.find((cal) => cal.summary === name);
    return calendar;
  }

  async getEventById(id: string) {
    const eventArr = await this.gCalendarAPI.getEvents({ include: [id] });
    const event = eventArr[0];
    return event;
  }

  async deleteEvent(id: string, deleteAllOccurences: boolean) {
    const eventArr = await this.gCalendarAPI.getEvents({ include: [id] });
    const event = eventArr[0];
    alert(event);
    const deleteResponse = await this.gCalendarAPI.deleteEvent(
      event,
      deleteAllOccurences,
    );

    return deleteResponse;
  }
  async modifyEvent(id: string) {
    const eventArr = await this.gCalendarAPI.getEvents({ include: [id] });
    const event = eventArr[0];
    return event;
  }
}
