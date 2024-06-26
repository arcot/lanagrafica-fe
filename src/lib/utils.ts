import { Member, MemberDTO } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createDateString(day: string, month: string, year: string) {
  if (!year) return "year cannot be empty";

  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  const paddedYear = year.padStart(2, "0");

  const currWholeYear = new Date().getFullYear();
  const currCentury = Number(String(currWholeYear).slice(0, 2));
  const currYear = Number(String(currWholeYear).slice(2));
  let newYear: string;
  if (0 <= Number(year) && Number(year) <= currYear) {
    newYear = `${currCentury}${paddedYear}`;
  } else {
    newYear = `${currCentury - 1}${paddedYear}`;
  }

  return `${newYear}-${paddedMonth}-${paddedDay}`;
}

export function parseDay(dateISO: string) {
  return dateISO.split("-")[2];
}
export function parseMonth(dateISO: string) {
  return dateISO.split("-")[1];
}
export function parseYear(dateISO: string) {
  return dateISO.split("-")[0].slice(2);
}

export function isValidISODate(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

export function isAdult(value: string) {
  const today = new Date();
  const birthDate = new Date(value);

  const ageDiff = today.getFullYear() - birthDate.getFullYear();
  if (ageDiff > 18) return true;
  if (ageDiff < 18) return false;

  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff > 0) return true;
  if (monthDiff < 0) return false;

  const dayDiff = today.getDate() - birthDate.getDate();
  if (dayDiff > 0) return true;
  if (dayDiff <= 0) return false;
}

export function getCustomDate(value: string | void) {
  if (!value) return "";

  const date = new Date(value);
  const day = date.getDate().toString().padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function fromSnakeToCamelCase(arr: object[]) {
  return arr.map((row: object) => {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        const newKey = key.replace(/_[a-z]/g, (group) =>
          group.toUpperCase().replace("_", ""),
        );
        return [newKey, value];
      }),
    );
  });
}

export function fromCamelToSnakeCase(obj: Member) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const newKey = key
        .split(/(?=[A-Z])/)
        .map((word) => word.toLocaleLowerCase())
        .join("_");
      return [newKey, value];
    }),
  ) as MemberDTO;
}

export function extendWithStatus(data: Member[]) {
  return data.map((row) => {
    let status = "inactive";
    if (row.isActive) status = "active";
    if (hasExpired(new Date(row.expirationDate))) status = "expired";
    if (isSuspended(new Date(row.suspendedTill))) status = "suspended";
    if (row.isDeleted) status = "deleted";
    return { ...row, status };
  });
}

export function hasExpired(date: Date) {
  return new Date() > date;
}

export function isSuspended(date: Date) {
  return date ? new Date() < date : false;
}

export function extendDate(date: Date) {
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

export function genCardNumber() {
  return String(Math.floor(Math.random() * 100_000_000)).padStart(8, "0");
}

export function getRegistrationDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getExpirationDate(): string {
  const expiration = new Date();
  expiration.setFullYear(expiration.getFullYear() + 1);
  return expiration.toISOString().split("T")[0];
}

export function getDateWeekLater() {
  const date = new Date();
  date.setDate(date.getDay() + 7);
  return date.toISOString().split("T")[0];
}

export function getDateMonthsLater(count: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + count);
  return date.toISOString().split("T")[0];
}

export function serializeForUpdate<T extends Member>(
  row: T,
  isActive: boolean,
): MemberDTO {
  const updatedRow: Record<string, unknown> = { isActive: isActive };

  for (let key in row) {
    updatedRow[key] = row[key] || null;
  }

  return fromCamelToSnakeCase(updatedRow as Member);
}
