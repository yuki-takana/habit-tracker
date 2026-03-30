export function getTodayEndIST() {
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    ).setHours(23, 59, 59, 999);
}