"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { categories as mockCategories } from "@/data/mockStore";
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

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(6),
});

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

export async function saveProductAction(formData: FormData) {
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
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/products");
    return;
  }

  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function createCategoryAction(formData: FormData) {
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/categories");
    return;
  }

  const parsed = categorySchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  await prisma.category.create({
    data: {
      name: parsed.name,
      slug: slugify(parsed.name),
      description: parsed.description,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategoryAction(formData: FormData) {
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/categories");
    return;
  }

  const id = String(formData.get("id"));
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function updateOrderStatusAction(formData: FormData) {
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/orders");
    return;
  }

  const id = String(formData.get("id"));
  const status = z
    .enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"])
    .parse(formData.get("status"));

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
