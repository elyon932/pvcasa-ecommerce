export type CategoryDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type ProductDefinition = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  priceInCents: number;
  compareAtCents?: number;
  shippingInCents: number;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  brand: string;
  material: string;
  categorySlug: string;
  colors: string[];
  room: "bedroom" | "bathroom" | "dining" | "living-room" | "kids-room";
  audience: "adult" | "family" | "kids" | "guest";
  tags: string[];
  images: ProductImage[];
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  priceInCents: number;
  compareAtCents?: number;
  shippingInCents: number;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  brand: string;
  material: string;
  category: Category;
  colors: string[];
  room: ProductDefinition["room"];
  audience: ProductDefinition["audience"];
  tags: string[];
  images: ProductImage[];
};

export type HeroSlideDefinition = {
  id: string;
  imageUrl: string;
  href: string;
};

export type HeroSlide = HeroSlideDefinition;

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  unitPriceInCents: number;
};

export type Order = {
  id: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  totalInCents: number;
  city: string;
  state: string;
  createdAt: string;
  items: OrderItem[];
};

export type CustomerAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
};

export type DashboardMetrics = {
  revenueInCents: number;
  orders: number;
  averageTicketInCents: number;
  returningCustomers: number;
  bestSellers: Array<{
    name: string;
    quantity: number;
    revenueInCents: number;
  }>;
  recentOrders: Order[];
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  priceInCents: number;
  stock: number;
  quantity: number;
};

export type ProductFilters = {
  query?: string;
  category?: string;
  color?: string;
  audience?: string;
  material?: string;
  price?: string;
  sale?: boolean;
  featured?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
};
