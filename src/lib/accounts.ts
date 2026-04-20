import { customerAccounts, orders } from "@/data/mockStore";
import { normalizeCopy } from "@/lib/storefront";

function normalizeCustomer<T extends (typeof customerAccounts)[number]>(customer: T) {
  return {
    ...customer,
    name: normalizeCopy(customer.name),
    city: normalizeCopy(customer.city),
    addressLine: normalizeCopy(customer.addressLine),
  };
}

export function getCustomerByEmail(email: string) {
  const customer =
    customerAccounts.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) ?? null;
  return customer ? normalizeCustomer(customer) : null;
}

export function getCustomerById(id: string) {
  const customer = customerAccounts.find((entry) => entry.id === id) ?? null;
  return customer ? normalizeCustomer(customer) : null;
}

export function getOrdersByCustomerId(customerId: string) {
  return orders.filter((order) => order.customerId === customerId);
}
