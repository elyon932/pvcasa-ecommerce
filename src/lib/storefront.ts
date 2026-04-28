import "server-only";

import type { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import {
  categories as categoryDefinitions,
  heroSlides as heroSlideDefinitions,
  orders,
  products as productDefinitions,
} from "@/data/mockStore";
import { prisma } from "@/lib/prisma";
import type { Category, HeroSlide, Order, Product, ProductFilters } from "@/types/store";

const categoryOrder = ["bed", "table", "bath", "decor", "kids"] as const;
const customerVisibleOrderStatuses: PrismaOrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
const customerVisibleOrderStatusSet = new Set<string>(customerVisibleOrderStatuses);

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function resolveCategoryFromDefinition(slug: string): Category {
  const category = categoryDefinitions.find((entry) => entry.slug === slug) ?? categoryDefinitions[0];

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
  };
}

function normalizeColorLabel(color: string) {
  const labels: Record<string, string> = {
    white: "Branco",
    sand: "Areia",
    copper: "Cobre",
    caramel: "Caramelo",
    terracotta: "Terracota",
    sage: "Sálvia",
    blue: "Azul",
    green: "Verde",
    pink: "Rosa",
    graphite: "Grafite",
  };

  return labels[color] ?? color;
}

function getCategoryOrderIndex(slug: string) {
  const index = categoryOrder.indexOf(slug as (typeof categoryOrder)[number]);
  return index === -1 ? categoryOrder.length : index;
}

export function resolveProduct(product: (typeof productDefinitions)[number]): Product {
  return {
    ...product,
    source: "mock",
    category: resolveCategoryFromDefinition(product.categorySlug),
    images: product.images,
  };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function getSimilarityScore(needle: string, haystack: Product) {
  if (!needle) {
    return 1;
  }

  const normalizedNeedle = needle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const queryTokens = tokenize(normalizedNeedle);
  const haystackTokens = tokenize(
    [
      haystack.name,
      haystack.shortDescription,
      haystack.description,
      haystack.category.name,
      haystack.brand,
      haystack.material,
      ...haystack.tags,
      ...haystack.colors.map(normalizeColorLabel),
    ].join(" "),
  );

  const haystackString = haystackTokens.join(" ");
  let score = haystackString.includes(normalizedNeedle) ? 10 : 0;

  for (const token of queryTokens) {
    if (haystackTokens.includes(token)) {
      score += 5;
      continue;
    }

    if (haystackTokens.some((entry) => entry.includes(token) || token.includes(entry))) {
      score += 2;
    }
  }

  return score;
}

function matchesPrice(priceInCents: number, priceFilter?: string) {
  switch (priceFilter) {
    case "up-to-100":
      return priceInCents <= 10000;
    case "100-to-200":
      return priceInCents > 10000 && priceInCents <= 20000;
    case "200-to-350":
      return priceInCents > 20000 && priceInCents <= 35000;
    case "350-plus":
      return priceInCents > 35000;
    default:
      return true;
  }
}

function sortProducts(products: Product[], sort: ProductFilters["sort"] = "featured") {
  const entries = [...products];

  switch (sort) {
    case "price-asc":
      return entries.sort((left, right) => left.priceInCents - right.priceInCents);
    case "price-desc":
      return entries.sort((left, right) => right.priceInCents - left.priceInCents);
    case "newest":
      return entries.sort((left, right) => Number(right.isNew) - Number(left.isNew));
    case "featured":
    default:
      return entries.sort((left, right) => {
        return (
          Number(right.isFeatured) - Number(left.isFeatured) ||
          Number(right.isOnSale) - Number(left.isOnSale) ||
          right.stock - left.stock
        );
      });
  }
}

async function getDatabaseCatalog(): Promise<Product[] | null> {
  if (!hasDatabase()) {
    return null;
  }

  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!dbProducts.length) {
      return null;
    }

    return dbProducts.map((product) => ({
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      source: "database",
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      priceInCents: product.priceInCents,
      compareAtCents: product.compareAtCents ?? undefined,
      shippingInCents:
        "shippingInCents" in product && typeof product.shippingInCents === "number"
          ? product.shippingInCents
          : 999,
      stock: product.stock,
      isFeatured: product.featured,
      isNew: false,
      isOnSale:
        typeof product.compareAtCents === "number"
          ? product.compareAtCents > product.priceInCents
          : false,
      brand: product.brand ?? "PV Casa",
      material: product.material ?? "Algodão",
      category: {
        id: product.category.id,
        slug: product.category.slug,
        name: product.category.name,
        description: product.category.description ?? "",
        imageUrl:
          categoryDefinitions.find((entry) => entry.slug === product.category.slug)?.imageUrl ??
          categoryDefinitions[0]?.imageUrl,
      },
      colors: [],
      room: "bedroom",
      audience: "family",
      tags: product.tags,
      images:
        product.images.length > 0
          ? product.images.map((image) => ({
              id: image.id,
              url: image.url,
              alt: image.alt,
            }))
          : productDefinitions[0].images,
    }));
  } catch {
    return null;
  }
}

export async function getCatalog(filters: ProductFilters = {}) {
  const source =
    (await getDatabaseCatalog()) ?? productDefinitions.map((product) => resolveProduct(product));
  const query = filters.query?.trim() ?? "";

  const filtered = source
    .map((product) => ({
      product,
      score: getSimilarityScore(query, product),
    }))
    .filter(({ product, score }) => {
      const matchesQuery = !query || score > 0;
      const matchesCategory = !filters.category || product.category.slug === filters.category;
      const matchesColor = !filters.color || product.colors.includes(filters.color);
      const matchesAudience = !filters.audience || product.audience === filters.audience;
      const matchesMaterial =
        !filters.material ||
        product.material.toLowerCase().includes(filters.material.toLowerCase());
      const matchesSale = !filters.sale || product.isOnSale;
      const matchesFeatured = !filters.featured || product.isFeatured;
      const matchesPriceRange = matchesPrice(product.priceInCents, filters.price);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesColor &&
        matchesAudience &&
        matchesMaterial &&
        matchesSale &&
        matchesFeatured &&
        matchesPriceRange
      );
    })
    .sort((left, right) => right.score - left.score)
    .map(({ product }) => product);

  return sortProducts(filtered, filters.sort);
}

export async function getProductBySlug(slug: string) {
  const products = await getCatalog();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCategories() {
  if (!hasDatabase()) {
    return [...categoryDefinitions].sort(
      (left, right) => getCategoryOrderIndex(left.slug) - getCategoryOrderIndex(right.slug),
    );
  }

  try {
    const dbCategories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    if (!dbCategories.length) {
      throw new Error("No categories in database");
    }

    return dbCategories
      .map((category) => {
        const fallback = categoryDefinitions.find((entry) => entry.slug === category.slug);

        return {
          id: category.id,
          slug: category.slug,
          name: category.name,
          description: category.description ?? "",
          imageUrl: fallback?.imageUrl,
        };
      })
      .sort((left, right) => getCategoryOrderIndex(left.slug) - getCategoryOrderIndex(right.slug));
  } catch {
    return [...categoryDefinitions].sort(
      (left, right) => getCategoryOrderIndex(left.slug) - getCategoryOrderIndex(right.slug),
    );
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (hasDatabase()) {
    try {
      const dbSlides = await prisma.homeBanner.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      });

      if (dbSlides.length) {
        return dbSlides.map((slide) => ({
          id: slide.id,
          href: slide.ctaHref,
          imageUrl: slide.imageUrl,
        }));
      }
    } catch {
      // Falls back to local demo data when the database is unavailable.
    }
  }

  return heroSlideDefinitions;
}

export async function getFeaturedProducts() {
  const catalog = await getCatalog({ featured: true });
  return catalog.slice(0, 8);
}

export async function getSaleProducts() {
  const catalog = await getCatalog({ sale: true, sort: "price-asc" });
  return catalog.slice(0, 8);
}

export async function getNewProducts() {
  const catalog = await getCatalog({ sort: "newest" });
  return catalog.filter((product) => product.isNew).slice(0, 8);
}

export function getCatalogFilters() {
  return {
    colors: [
      { value: "white", label: "Branco" },
      { value: "sand", label: "Areia" },
      { value: "copper", label: "Cobre" },
      { value: "terracotta", label: "Terracota" },
      { value: "sage", label: "Sálvia" },
      { value: "blue", label: "Azul" },
      { value: "green", label: "Verde" },
      { value: "pink", label: "Rosa" },
      { value: "graphite", label: "Grafite" },
    ],
    audiences: [
      { value: "adult", label: "Adulto" },
      { value: "family", label: "Família" },
      { value: "kids", label: "Infantil" },
      { value: "guest", label: "Visita" },
    ],
    materials: ["Percal", "Micropercal", "Algodão", "Linho", "Chenille", "Velour", "Sarja"],
    prices: [
      { value: "up-to-100", label: "Até R$ 100" },
      { value: "100-to-200", label: "R$ 100 a R$ 200" },
      { value: "200-to-350", label: "R$ 200 a R$ 350" },
      { value: "350-plus", label: "Acima de R$ 350" },
    ],
  };
}

export async function getCustomerOrders(
  customerId: string,
  customerEmail?: string,
): Promise<Order[]> {
  if (hasDatabase()) {
    try {
      const dbOrders = await prisma.order.findMany({
        where: customerEmail
          ? {
              status: { in: customerVisibleOrderStatuses },
              OR: [{ customerId }, { customerEmail }],
            }
          : {
              customerId,
              status: { in: customerVisibleOrderStatuses },
            },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      if (dbOrders.length) {
        return dbOrders.map((order) => ({
          id: order.id,
          customerId: order.customerId ?? order.customerEmail,
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalInCents: order.totalInCents,
          city: order.deliveryCity,
          state: order.deliveryState,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId ?? item.productSlug,
            name: item.productName,
            slug: item.productSlug,
            quantity: item.quantity,
            unitPriceInCents: item.unitPriceInCents,
          })),
        }));
      }
    } catch {
      // Falls back to mock orders when the database is unavailable.
    }
  }

  return orders.filter(
    (order) =>
      customerVisibleOrderStatusSet.has(order.status) &&
      (order.customerId === customerId ||
        (customerEmail ? order.customerEmail === customerEmail : false)),
  );
}
