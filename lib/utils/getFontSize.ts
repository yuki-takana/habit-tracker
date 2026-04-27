export const getFontSize = (num: number) => {
  const len = String(num).length;

  if (len <= 3) return "200px";
  if (len <= 5) return "160px";
  if (len <= 7) return "120px";
  if (len <= 9) return "90px";
  return "70px";
};