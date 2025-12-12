export type MessageSourceType = "announcement" | "event" | "schedule";

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateHe(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatTimeHe(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function buildWhatsAppText(type: MessageSourceType, item: any) {
  if (!item) return "";

  if (type === "announcement") {
    return `📢 הודעה מהקהילה

*${item.title ?? ""}*

${item.content ?? ""}`.trim();
  }

  if (type === "event") {
    const dt = item.start_time ? new Date(item.start_time) : null;
    const date = dt ? formatDateHe(dt) : "";
    const time = dt ? formatTimeHe(dt) : "";
    const location = item.location ? `📍 ${item.location}\n` : "";
    const desc = item.description ? `\n${item.description}` : "";

    return `📅 אירוע קהילתי

*${item.title ?? ""}*
🗓 ${date}
⏰ ${time}
${location}${desc}`.trim();
  }

  if (type === "schedule") {
    const dayLabel =
      item.day_of_week === null || item.day_of_week === undefined
        ? "כל יום"
        : days[item.day_of_week] ?? "יום לא ידוע";

    const time = (item.time_of_day ?? "").toString().slice(0, 5);

    const kind =
      item.type === "class" ? "שיעור" : item.type === "other" ? "עדכון" : "תפילה";

    return `🕍 ${kind}

📌 ${item.title ?? ""}
🗓 ${dayLabel}
⏰ ${time}

נשמח לראותכם 🙏`.trim();
  }

  return "";
}
