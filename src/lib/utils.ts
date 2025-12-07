import { MemberExt, Member, MemberStatus } from "@/types/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import comuniData from "@/assets/comuni.json";
import countriesData from "@/assets/countries.json";

// Type definitions for imported JSON data
interface ComuneData {
  nome: string;
  sigla?: string;
  provincia?: {
    nome: string;
    codice: string;
  };
}

interface CountryData {
  en: string;
  it: string;
  code: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function createDateString(day: string, month: string, year: string) {
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
  return (
    !isNaN(date.getTime()) &&
    value.slice(0, 10) === date.toISOString().slice(0, 10)
  );
}

export function isAdult(value: string) {
  const today = new Date();
  const birthDate = new Date(value);
  const ageDiff = today.getFullYear() - birthDate.getFullYear();
  if (ageDiff > 18) {
    return true;
  } else if (ageDiff === 18) {
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff > 0) {
      return true;
    } else if (monthDiff === 0) {
      const dayDiff = today.getDate() - birthDate.getDate();
      if (dayDiff > 0) {
        return true;
      }
    }
  }
  return false;
}

export function getCustomDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  const day = date.getDate().toString().padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function extendWithStatus(data: Member[]): MemberExt[] {
  return data.map((member) => {
    let status: MemberStatus = "inactive";
    if (member.isActive) status = "active";
    if (member.expirationDate && hasExpired(new Date(member.expirationDate))) status = "expired";
    if (member.suspendedTill && hasBeenSuspended(new Date(member.suspendedTill)))
      status = "suspended";
    if (member.isDeleted) status = "deleted";

    return { ...member, status };
  });
}

export function hasExpired(date: Date) {
  return new Date() > date;
}

export function hasBeenSuspended(suspendsionDate: Date) {
  const today = new Date();
  return today < suspendsionDate;
}

export function extendDate(expirationStr: string) {
  const expirationDate = new Date(expirationStr);
  const today = new Date();
  const nextExpirationDate = expirationDate > today ? expirationDate : today;
  nextExpirationDate.setFullYear(nextExpirationDate.getFullYear() + 1);
  return nextExpirationDate.toISOString();
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
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  return nextWeek.toISOString().split("T")[0];
}

export function getDateMonthsLater(count: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + count);
  return date.toISOString().split("T")[0];
}

/**
 * Get province code from Italian city name
 * Returns the province sigla (2-letter code) for the given Italian city
 */
export function getProvinceFromCity(cityName: string): string {
  const comuni = comuniData as ComuneData[];
  const city = comuni.find((comune) => comune.nome === cityName);
  return city?.sigla || "";
}

/**
 * Get country code from country name
 * Works with both English and Italian country names
 */
export function getCountryCode(countryName: string): string {
  const countries = countriesData as CountryData[];
  const country = countries.find(
    (c) => c.en === countryName || c.it === countryName
  );
  return country?.code || "";
}

/**
 * Calculate province based on country and city selection
 * For Italy: extract province code from city
 * For other countries: use country code as province
 */
export function calculateProvince(country: string, birthPlace: string): string {
  if (country === "Italy" || country === "Italia") {
    return getProvinceFromCity(birthPlace);
  } else {
    return getCountryCode(country);
  }
}
