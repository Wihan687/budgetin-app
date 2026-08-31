import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumberWithDots(value: string | number | null | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const raw = String(value).replace(/\D/g, "");
  if (!raw) return "";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

export function parseNumberFromDots(value: string | number | null | undefined): number {
  if (!value) return 0;
  const raw = String(value).replace(/\D/g, "");
  return raw ? Number(raw) : 0;
}