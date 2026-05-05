"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { categories as mockCategories } from "@/data/mockStore";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  sku: z.string().min(3),
  categoryId: z.string().min(1),
  shortDescription: z.string().min(6),
  description: z.string().min(12),
  priceInCents: z.coerce.number().int().positive(),
  compareAtCents: z.coerce.number().int().optional(),
  stock: z.coerce.number().int().nonnegative(),
  brand: z.string().min(2),
  material: z.string().min(2),
  imageUrl: z.string().url(),
});

const idSchema = z.string().trim().min(1);
const orderStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
]);

function buildTagPayload(parsed: z.infer<typeof productSchema>) {
  return Array.from(
    new Map(
      [parsed.brand, parsed.material]
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => [
          slugify(value),
          {
            name: value,
            slug: slugify(value),
          },
        ]),
    ).values(),
  );
}

async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}

export async function saveProductAction(formData: FormData) {
  await requireAdminSession();

  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/products");
    return;
  }

  const parsed = productSchema.parse({
    id: formData.get("id")?.toString(),
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    priceInCents: formData.get("priceInCents"),
    compareAtCents: formData.get("compareAtCents") || undefined,
    stock: formData.get("stock"),
    brand: formData.get("brand"),
    material: formData.get("material"),
    imageUrl: formData.get("imageUrl"),
  });

  const slug = slugify(parsed.name);
  const tagPayload = buildTagPayload(parsed);
  const existingCategory = await prisma.category.findUnique({
    where: { id: parsed.categoryId },
  });

  if (!existingCategory) {
    const fallbackCategory = mockCategories.find((category) => category.id === parsed.categoryId);

    if (fallbackCategory) {
      await prisma.category.create({
        data: {
          id: fallbackCategory.id,
          name: fallbackCategory.name,
          slug: fallbackCategory.slug,
          description: fallbackCategory.description,
        },
      });
    }
  }

  await prisma.product.upsert({
    where: {
      id: parsed.id || "new-product",
    },
    create: {
      name: parsed.name,
      slug,
      sku: parsed.sku,
      shortDescription: parsed.shortDescription,
      description: parsed.description,
      priceInCents: parsed.priceInCents,
      compareAtCents: parsed.compareAtCents,
      stock: parsed.stock,
      brand: parsed.brand,
      material: parsed.material,
      tags: [parsed.material.toLowerCase(), parsed.brand.toLowerCase()],
      categoryId: parsed.categoryId,
      productTags: {
        create: tagPayload.map((tag) => ({
          tag: {
            connectOrCreate: {
              where: { slug: tag.slug },
              create: {
                name: tag.name,
                slug: tag.slug,
              },
            },
          },
        })),
      },
      images: {
        create: {
          url: parsed.imageUrl,
          alt: parsed.name,
        },
      },
    },
    update: {
      name: parsed.name,
      slug,
      sku: parsed.sku,
      shortDescription: parsed.shortDescription,
      description: parsed.description,
      priceInCents: parsed.priceInCents,
      compareAtCents: parsed.compareAtCents,
      stock: parsed.stock,
      brand: parsed.brand,
      material: parsed.material,
      tags: [parsed.material.toLowerCase(), parsed.brand.toLowerCase()],
      categoryId: parsed.categoryId,
      productTags: {
        deleteMany: {},
        create: tagPayload.map((tag) => ({
          tag: {
            connectOrCreate: {
              where: { slug: tag.slug },
              create: {
                name: tag.name,
                slug: tag.slug,
              },
            },
          },
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession();

  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/products");
    return;
  }

  const id = idSchema.parse(formData.get("id"));
  await prisma.product.deleteMany({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession();

  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/orders");
    return;
  }

  const id = idSchema.parse(formData.get("id"));
  const status = orderStatusSchema.parse(formData.get("status"));

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
