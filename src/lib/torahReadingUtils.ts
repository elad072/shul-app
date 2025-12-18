import { HDate, HebrewCalendar, Event } from '@hebcal/core';

export interface TorahReading {
    gregorianDate: Date;
    hebrewDate: string;
    parashaName: string;
    parashaNameHebrew: string;
    year: number;
}

/**
 * Get all Torah readings (Shabbat parshiot) for the current Hebrew year
 * @param hebrewYear - Optional Hebrew year (defaults to current)
 * @returns Array of Torah readings with dates and parasha names
 */
export function getTorahReadingsForYear(hebrewYear?: number): TorahReading[] {
    const currentHDate = new HDate();
    const year = hebrewYear || currentHDate.getFullYear();

    // Get start and end of Hebrew year
    // Hebrew year starts on 1 Tishrei
    const startDate = new HDate(1, 'Tishrei', year);
    const endDate = new HDate(29, 'Elul', year); // Last day of year

    // Get all Shabbat Torah readings for the year
    const events = HebrewCalendar.calendar({
        start: startDate.greg(),
        end: endDate.greg(),
        sedrot: true, // Include Torah portions
        il: true, // Israel reading schedule
    });

    // Filter only Torah reading events (sedra flag = 1024)
    const torahReadings: TorahReading[] = events
        .filter((event: Event) => event.getFlags() & 1024)
        .map((event: Event) => {
            const gregDate = event.getDate().greg();
            const hDate = new HDate(gregDate);

            return {
                gregorianDate: gregDate,
                hebrewDate: hDate.toString(),
                parashaName: event.render('en'),
                parashaNameHebrew: event.render('he'),
                year: year,
            };
        });

    return torahReadings;
}

/**
 * Get upcoming Torah readings (from today onwards)
 * @param limit - Maximum number of readings to return
 */
export function getUpcomingTorahReadings(limit: number = 10): TorahReading[] {
    const allReadings = getTorahReadingsForYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allReadings
        .filter(reading => reading.gregorianDate >= today)
        .slice(0, limit);
}

/**
 * Get Torah reading for a specific date
 * @param date - Gregorian date
 */
export function getTorahReadingForDate(date: Date): TorahReading | null {
    const hDate = new HDate(date);

    // Find the Saturday on or after this date
    const saturday = hDate.onOrAfter(6); // 6 = Saturday

    const events = HebrewCalendar.calendar({
        start: saturday.greg(),
        end: saturday.greg(),
        sedrot: true,
        il: true,
    });

    const torahEvent = events.find((e: Event) => e.getFlags() & 1024);

    if (!torahEvent) return null;

    const gregDate = torahEvent.getDate().greg();
    const torahHDate = new HDate(gregDate);

    return {
        gregorianDate: gregDate,
        hebrewDate: torahHDate.toString(),
        parashaName: torahEvent.render('en'),
        parashaNameHebrew: torahEvent.render('he'),
        year: torahHDate.getFullYear(),
    };
}

/**
 * Format date for display in Hebrew
 */
export function formatHebrewDate(date: Date): string {
    const hDate = new HDate(date);
    return hDate.toString();
}

/**
 * Get current Hebrew year
 */
export function getCurrentHebrewYear(): number {
    return new HDate().getFullYear();
}
