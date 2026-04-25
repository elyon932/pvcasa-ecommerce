import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const updateMany = vi.fn();
const update = vi.fn();
const create = vi.fn();
const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback({
    customerAddress: {
      findFirst,
      updateMany,
      update,
      create,
    },
  }),
);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
  },
}));

describe("accounts security", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://localhost/test";
  });

  it("rejects address updates when the address does not belong to the customer", async () => {
    findFirst.mockResolvedValue(null);

    const { updateCustomerAddress } = await import("@/lib/accounts");

    await expect(
      updateCustomerAddress("customer-1", "address-2", {
        type: "PRIMARY",
        label: "Casa",
        recipientName: "Maria Silva",
        phone: "(93) 99111-2233",
        postalCode: "68180-220",
        street: "Rua das Flores",
        number: "125",
        neighborhood: "Centro",
        city: "Itaituba",
        state: "PA",
        complement: "Casa",
      }),
    ).rejects.toThrow("ADDRESS_NOT_FOUND");

    expect(updateMany).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
