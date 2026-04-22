import bcrypt from "bcryptjs";
import type { CustomerAddressType } from "@prisma/client";
import { customerAccounts, orders } from "@/data/mockStore";
import type { AddressFormInput, RegisterCustomerInput } from "@/lib/customer-validation";
import { prisma } from "@/lib/prisma";
import { normalizeCopy } from "@/lib/storefront";
import type { CustomerAccount, CustomerAddress } from "@/types/store";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeAddress(address: CustomerAddress): CustomerAddress {
  return {
    ...address,
    label: normalizeCopy(address.label),
    recipientName: normalizeCopy(address.recipientName),
    street: normalizeCopy(address.street),
    neighborhood: normalizeCopy(address.neighborhood),
    city: normalizeCopy(address.city),
    state: normalizeCopy(address.state),
    complement: address.complement ? normalizeCopy(address.complement) : undefined,
  };
}

function normalizeCustomer(customer: CustomerAccount): CustomerAccount {
  return {
    ...customer,
    name: normalizeCopy(customer.name),
    addresses: customer.addresses.map(normalizeAddress),
    primaryAddress: customer.primaryAddress ? normalizeAddress(customer.primaryAddress) : null,
  };
}

function mapMockCustomer(customer: (typeof customerAccounts)[number]): CustomerAccount {
  return normalizeCustomer(customer);
}

function mapDbCustomer(customer: {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
  addresses: Array<{
    id: string;
    label: string;
    type: CustomerAddressType;
    recipientName: string;
    phone: string;
    postalCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement: string | null;
  }>;
}): CustomerAccount {
  const addresses = customer.addresses.map((address) => ({
    id: address.id,
    label: address.label,
    type: address.type,
    recipientName: address.recipientName,
    phone: address.phone,
    postalCode: address.postalCode,
    street: address.street,
    number: address.number,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    complement: address.complement ?? undefined,
  }));

  return normalizeCustomer({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    passwordHash: customer.passwordHash,
    createdAt: customer.createdAt.toISOString(),
    addresses,
    primaryAddress: addresses.find((address) => address.type === "PRIMARY") ?? null,
    source: "database",
  });
}

async function findDbCustomerByEmail(email: string) {
  if (!hasDatabase()) {
    return null;
  }

  try {
    return await prisma.customer.findUnique({
      where: { email },
      include: {
        addresses: {
          orderBy: [{ type: "asc" }, { createdAt: "asc" }],
        },
      },
    });
  } catch {
    return null;
  }
}

async function findDbCustomerById(id: string) {
  if (!hasDatabase()) {
    return null;
  }

  try {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ type: "asc" }, { createdAt: "asc" }],
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getCustomerByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const dbCustomer = await findDbCustomerByEmail(normalizedEmail);
  if (dbCustomer) {
    return mapDbCustomer(dbCustomer);
  }

  const customer =
    customerAccounts.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
  return customer ? mapMockCustomer(customer) : null;
}

export async function getCustomerById(id: string) {
  const dbCustomer = await findDbCustomerById(id);
  if (dbCustomer) {
    return mapDbCustomer(dbCustomer);
  }

  const customer = customerAccounts.find((entry) => entry.id === id) ?? null;
  return customer ? mapMockCustomer(customer) : null;
}

export async function getOrdersByCustomerId(customerId: string) {
  if (hasDatabase()) {
    try {
      const dbOrders = await prisma.order.findMany({
        where: { customerId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      if (dbOrders.length) {
        return dbOrders;
      }
    } catch {
      // Falls back to mock orders when the database is unavailable.
    }
  }

  return orders.filter((order) => order.customerId === customerId);
}

export async function createCustomerAccount(input: RegisterCustomerInput) {
  if (!hasDatabase()) {
    throw new Error("DATABASE_REQUIRED");
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingCustomer) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const customer = await prisma.customer.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      addresses: {
        create: {
          type: "PRIMARY",
          label: "Endereço principal",
          recipientName: input.name,
          phone: input.phone,
          postalCode: input.postalCode,
          street: input.street,
          number: input.number,
          neighborhood: input.neighborhood,
          city: input.city,
          state: input.state,
          complement: input.complement || null,
        },
      },
    },
    include: {
      addresses: {
        orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return mapDbCustomer(customer);
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string | null,
  input: AddressFormInput,
) {
  if (!hasDatabase()) {
    throw new Error("DATABASE_REQUIRED");
  }

  await prisma.$transaction(async (tx) => {
    if (input.type === "PRIMARY") {
      await tx.customerAddress.updateMany({
        where: { customerId, type: "PRIMARY" },
        data: { type: "SECONDARY" },
      });
    }

    const payload = {
      type: input.type,
      label: input.label,
      recipientName: input.recipientName,
      phone: input.phone,
      postalCode: input.postalCode,
      street: input.street,
      number: input.number,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
      complement: input.complement || null,
    };

    if (addressId) {
      await tx.customerAddress.update({
        where: { id: addressId },
        data: payload,
      });
      return;
    }

    await tx.customerAddress.create({
      data: {
        customerId,
        ...payload,
      },
    });
  });
}

export function getPrimaryAddressLabel(customer: CustomerAccount) {
  const address = customer.primaryAddress;
  if (!address) {
    return null;
  }

  return `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`;
}

export function hasCompleteCheckoutProfile(customer: CustomerAccount) {
  const address = customer.primaryAddress;

  return Boolean(
    customer.name &&
      customer.email &&
      customer.phone &&
      address?.street &&
      address.number &&
      address.neighborhood &&
      address.city &&
      address.state &&
      address.postalCode,
  );
}
