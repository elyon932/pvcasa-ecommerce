import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.floor(Math.random() * 900 + 100);
  return `PVC-${stamp}-${random}`;
}
