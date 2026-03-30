export function toIST(dateString: Date | string | null): Date | string | null {
    if (!dateString) return null;

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;

    return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}