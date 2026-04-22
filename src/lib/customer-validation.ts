import { z } from "zod";

const fullNamePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/u;
const phonePattern = /^\(\d{2}\)\s\d{5}-\d{4}$/;
const postalCodePattern = /^\d{5}-\d{3}$/;

const cleanText = (value: string) => value.trim().replace(/\s+/g, " ");

export const registerCustomerSchema = z.object({
  name: z
    .string()
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(5, "Informe o nome completo.")
        .regex(fullNamePattern, "Use apenas letras e nome completo."),
    ),
  email: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.string().email("Informe um e-mail válido.")),
  phone: z
    .string()
    .transform(cleanText)
    .pipe(z.string().regex(phonePattern, "Use o formato (DDD) 00000-0000.")),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(64, "A senha precisa ter no máximo 64 caracteres."),
  postalCode: z
    .string()
    .transform(cleanText)
    .pipe(z.string().regex(postalCodePattern, "Use o formato 00000-000.")),
  street: z.string().transform(cleanText).pipe(z.string().min(3, "Informe a rua.")),
  number: z.string().transform(cleanText).pipe(z.string().min(1, "Informe o número.")),
  neighborhood: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(2, "Informe o bairro.")),
  city: z.string().transform(cleanText).pipe(z.string().min(2, "Informe a cidade.")),
  state: z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{2}$/, "Informe a UF com 2 letras.")),
  complement: z.string().transform(cleanText).optional(),
});

export const addressFormSchema = registerCustomerSchema.pick({
  postalCode: true,
  street: true,
  number: true,
  neighborhood: true,
  city: true,
  state: true,
  complement: true,
}).extend({
  label: z.string().transform(cleanText).pipe(z.string().min(2, "Informe o rótulo do endereço.")),
  recipientName: registerCustomerSchema.shape.name,
  phone: registerCustomerSchema.shape.phone,
  type: z.enum(["PRIMARY", "SECONDARY"]),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type AddressFormInput = z.infer<typeof addressFormSchema>;

export function formatBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
