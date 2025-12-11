import { HDate, HebrewCalendar, Locale } from '@hebcal/core';

// המרה למספר עברי (גימטריה) - הוספתי export!
export function toHebrewNumeral(n: number): string {
  if (n <= 0) return "";
  const letters: [number, string][] = [
    [400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"],
    [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"], [50, "נ"], [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"],
    [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"]
  ];
  
  if (n === 15) return 'ט"ו';
  if (n === 16) return 'ט"ז';

  let result = "";
  let tempN = n;
  for (const [val, char] of letters) {
    while (tempN >= val) {
      result += char;
      tempN -= val;
    }
  }
  
  if (result.length === 1) return result + "'";
  return result.slice(0, -1) + '"' + result.slice(-1);
}

// המרה לועזי -> עברי (יום בחודש)
export function toHebrewDateString(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hdate = new HDate(date);
  
  const day = toHebrewNumeral(hdate.getDate());
  const monthNameEng = hdate.getMonthName();
  const month = Locale.gettext(monthNameEng, 'he');
  
  return `${day} ב${month}`;
}

export function getHebrewDateParts(dateString: string) {
  const date = new Date(dateString);
  const hdate = new HDate(date);
  const monthNameEng = hdate.getMonthName();
  const monthNameHeb = Locale.gettext(monthNameEng, 'he');

  return {
    day: hdate.getDate(),
    month: monthNameHeb 
  };
}

// המרה לתצוגה בכרטיסים: 30/03/1979
export function formatGregorianDate(date: Date | string | null): string {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// המרה ל-Input בטופס (חייב להיות YYYY-MM-DD)
export function formatForInput(date: Date | string | null): string {
    if (!date) return "";
    const d = new Date(date);
    // המרה בטוחה ל-ISO בלי בעיות אזור זמן
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getCurrentHebrewInfo() {
  const now = new Date();
  const hdate = new HDate(now);
  const saturday = hdate.onOrAfter(6);
  const events = HebrewCalendar.calendar({ start: saturday, end: saturday, sedrot: true, il: true });
  const parashaName = events.find(e => e.getFlags() & 1024)?.render('he') || ""; 

  const day = toHebrewNumeral(hdate.getDate());
  const month = Locale.gettext(hdate.getMonthName(), 'he');
  
  const fullHebrew = `${day} ב${month}`;

  return {
    dateString: fullHebrew,
    gregorianDate: formatGregorianDate(now),
    parasha: parashaName,
  };
}
