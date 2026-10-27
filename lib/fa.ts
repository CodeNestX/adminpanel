export function toFa(input: number | string): string {
  return Number(input).toLocaleString("fa-IR");
}

export function toFaDigit(str: string): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (d) => fa[Number(d)]);
}
