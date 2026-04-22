import type {
  CategoryDefinition,
  CustomerAccount,
  DashboardMetrics,
  HeroSlideDefinition,
  Order,
  ProductDefinition,
} from "@/types/store";

const image = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1600&q=80`;

const categoryImageUrls = {
  bed: image("photo-1505693416388-ac5ce068fe85"),
  bath: image("photo-1515377905703-c4788e51af15"),
  table: image("photo-1524758631624-e2822e304c36"),
  decor: image("photo-1493663284031-b7e3aefcae8e"),
  kids: image("photo-1515488042361-ee00e0ddd4e4"),
} as const;

const colorLabels: Record<string, string> = {
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

export const categories: CategoryDefinition[] = [
  {
    id: "cat-bed",
    slug: "bed",
    name: "Cama",
    description: "Jogos de cama, colchas, mantas e enxovais para quartos acolhedores.",
    imageUrl: categoryImageUrls.bed,
  },
  {
    id: "cat-bath",
    slug: "bath",
    name: "Banho",
    description: "Toalhas, roupões, tapetes e acessórios para um banho premium.",
    imageUrl: categoryImageUrls.bath,
  },
  {
    id: "cat-table",
    slug: "table",
    name: "Mesa",
    description: "Toalhas, trilhos e composições para mesa posta.",
    imageUrl: categoryImageUrls.table,
  },
  {
    id: "cat-decor",
    slug: "decor",
    name: "Decor",
    description: "Mantas, almofadas e apoio têxtil para finalizar ambientes.",
    imageUrl: categoryImageUrls.decor,
  },
  {
    id: "cat-kids",
    slug: "kids",
    name: "Infantil",
    description: "Linhas infantis para quartos leves, práticos e confortáveis.",
    imageUrl: categoryImageUrls.kids,
  },
];

type ProductFamily = {
  key: string;
  categorySlug: string;
  room: ProductDefinition["room"];
  audience: ProductDefinition["audience"];
  brand: string;
  material: string;
  basePriceInCents: number;
  compareAtInCents?: number;
  colors: string[];
  featuredIndexes?: number[];
  saleIndexes?: number[];
  newIndexes?: number[];
  stockBase: number;
  imageSeeds: string[];
  buildName: (colorLabel: string) => string;
  buildShortDescription: (colorLabel: string) => string;
  buildDescription: (colorLabel: string) => string;
  tags: string[];
};

const productFamilies: ProductFamily[] = [
  {
    key: "percale-sheet-set",
    categorySlug: "bed",
    room: "bedroom",
    audience: "adult",
    brand: "PV Casa Signature",
    material: "Percal 300 fios",
    basePriceInCents: 28990,
    compareAtInCents: 33990,
    colors: ["white", "sand", "sage", "blue"],
    featuredIndexes: [0, 1],
    saleIndexes: [0, 3],
    newIndexes: [2],
    stockBase: 12,
    imageSeeds: ["photo-1505693416388-ac5ce068fe85", "photo-1513694203232-719a280e022f"],
    buildName: (colorLabel) => `Jogo de Cama Percal ${colorLabel} 300 Fios`,
    buildShortDescription: (colorLabel) =>
      `Percal com toque suave e acabamento elegante na cor ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Conjunto premium para cama com caimento sofisticado, respirabilidade e visual hoteleiro em tom ${colorLabel.toLowerCase()}.`,
    tags: ["percal", "hotel", "jogo de cama"],
  },
  {
    key: "quilt",
    categorySlug: "bed",
    room: "bedroom",
    audience: "family",
    brand: "Buddemeyer",
    material: "Micropercal",
    basePriceInCents: 35990,
    compareAtInCents: 41990,
    colors: ["copper", "terracotta", "sand", "graphite"],
    featuredIndexes: [1, 2],
    saleIndexes: [0],
    newIndexes: [3],
    stockBase: 8,
    imageSeeds: ["photo-1513694203232-719a280e022f", "photo-1505693416388-ac5ce068fe85"],
    buildName: (colorLabel) => `Colcha Matelassê Essencial ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Volume leve, textura bonita e visual ${colorLabel.toLowerCase()} para a cama.`,
    buildDescription: (colorLabel) =>
      `Colcha matelassê com enchimento equilibrado para uso diário, acabamento premium e presença elegante em ${colorLabel.toLowerCase()}.`,
    tags: ["colcha", "matelassê", "quarto"],
  },
  {
    key: "bath-towel-kit",
    categorySlug: "bath",
    room: "bathroom",
    audience: "family",
    brand: "Karsten",
    material: "Algodão penteado",
    basePriceInCents: 24990,
    compareAtInCents: 28990,
    colors: ["white", "sand", "green", "pink"],
    featuredIndexes: [0],
    saleIndexes: [1, 2],
    newIndexes: [3],
    stockBase: 16,
    imageSeeds: ["photo-1515377905703-c4788e51af15", "photo-1515377905703-c4788e51af15"],
    buildName: (colorLabel) => `Kit de Toalhas Prime ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Absorção alta, toque macio e composição ${colorLabel.toLowerCase()} para o banho.`,
    buildDescription: (colorLabel) =>
      `Kit com peças felpudas, gramatura equilibrada e acabamento refinado para banheiro com cara de spa em ${colorLabel.toLowerCase()}.`,
    tags: ["toalhas", "banho", "spa"],
  },
  {
    key: "bath-robe",
    categorySlug: "bath",
    room: "bathroom",
    audience: "adult",
    brand: "Trussardi",
    material: "Algodão velour",
    basePriceInCents: 29990,
    compareAtInCents: 34990,
    colors: ["white", "copper", "sand", "graphite"],
    featuredIndexes: [1],
    saleIndexes: [0],
    newIndexes: [2, 3],
    stockBase: 6,
    imageSeeds: ["photo-1515377905703-c4788e51af15", "photo-1505693416388-ac5ce068fe85"],
    buildName: (colorLabel) => `Roupão Spa Premium ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Modelagem elegante e banho aconchegante em ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Roupão com absorção eficiente, toque encorpado e acabamento premium para suítes e rotina de autocuidado em ${colorLabel.toLowerCase()}.`,
    tags: ["roupão", "spa", "suíte"],
  },
  {
    key: "tablecloth",
    categorySlug: "table",
    room: "dining",
    audience: "family",
    brand: "PV Casa Home",
    material: "Linho misto",
    basePriceInCents: 18990,
    compareAtInCents: 22990,
    colors: ["terracotta", "sand", "green", "blue"],
    featuredIndexes: [0, 2],
    saleIndexes: [1],
    newIndexes: [3],
    stockBase: 14,
    imageSeeds: ["photo-1524758631624-e2822e304c36", "photo-1524758631624-e2822e304c36"],
    buildName: (colorLabel) => `Toalha de Mesa Aconchego ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Mesa posta com textura elegante e paleta ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Toalha com toque encorpado e caimento bonito para almoços especiais e rotina sofisticada em ${colorLabel.toLowerCase()}.`,
    tags: ["mesa", "mesa posta", "linho"],
  },
  {
    key: "table-runner",
    categorySlug: "table",
    room: "dining",
    audience: "guest",
    brand: "PV Casa Home",
    material: "Sarja premium",
    basePriceInCents: 9990,
    compareAtInCents: 12990,
    colors: ["sand", "copper", "graphite", "green"],
    featuredIndexes: [0],
    saleIndexes: [2],
    newIndexes: [1, 3],
    stockBase: 20,
    imageSeeds: ["photo-1524758631624-e2822e304c36", "photo-1505693416388-ac5ce068fe85"],
    buildName: (colorLabel) => `Trilho de Mesa Contorno ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Detalhe rápido para compor mesa em ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Trilho versátil, fácil de combinar e ideal para receber com mais calor visual em ${colorLabel.toLowerCase()}.`,
    tags: ["trilho", "mesa", "receber"],
  },
  {
    key: "throw-blanket",
    categorySlug: "decor",
    room: "living-room",
    audience: "family",
    brand: "Buddemeyer",
    material: "Algodão e acrílico",
    basePriceInCents: 15990,
    compareAtInCents: 19990,
    colors: ["copper", "sand", "graphite", "blue"],
    featuredIndexes: [0, 1],
    saleIndexes: [3],
    newIndexes: [2],
    stockBase: 10,
    imageSeeds: ["photo-1484154218962-a197022b5858", "photo-1493663284031-b7e3aefcae8e"],
    buildName: (colorLabel) => `Manta Decor Trama ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Textura visual, toque aconchegante e cor ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Manta para sofá, poltrona ou pé da cama com presença elegante e uso fácil no dia a dia em ${colorLabel.toLowerCase()}.`,
    tags: ["manta", "decor", "sala"],
  },
  {
    key: "pillow-cover",
    categorySlug: "decor",
    room: "living-room",
    audience: "guest",
    brand: "PV Casa Decor",
    material: "Chenille",
    basePriceInCents: 7990,
    compareAtInCents: 9990,
    colors: ["copper", "sand", "sage", "pink"],
    featuredIndexes: [0],
    saleIndexes: [1, 3],
    newIndexes: [2],
    stockBase: 25,
    imageSeeds: ["photo-1493663284031-b7e3aefcae8e", "photo-1484154218962-a197022b5858"],
    buildName: (colorLabel) => `Capa de Almofada Aura ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Troca rápida para renovar o ambiente em ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Capa com textura suave e acabamento limpo para compor sofás, poltronas e camas com praticidade em ${colorLabel.toLowerCase()}.`,
    tags: ["almofada", "decor", "textura"],
  },
  {
    key: "kids-bedding",
    categorySlug: "kids",
    room: "kids-room",
    audience: "kids",
    brand: "PV Casa Kids",
    material: "Algodão macio",
    basePriceInCents: 21990,
    compareAtInCents: 25990,
    colors: ["pink", "blue", "green", "sand"],
    featuredIndexes: [1],
    saleIndexes: [0],
    newIndexes: [2, 3],
    stockBase: 11,
    imageSeeds: ["photo-1515488042361-ee00e0ddd4e4", "photo-1505693416388-ac5ce068fe85"],
    buildName: (colorLabel) => `Jogo de Cama Infantil Sonho ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Conjunto infantil prático e suave em ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Peças leves, fáceis de cuidar e pensadas para quartos infantis confortáveis e delicados em ${colorLabel.toLowerCase()}.`,
    tags: ["infantil", "quarto infantil", "jogo de cama"],
  },
  {
    key: "kids-hooded-towel",
    categorySlug: "kids",
    room: "kids-room",
    audience: "kids",
    brand: "PV Casa Kids",
    material: "Algodão felpudo",
    basePriceInCents: 8990,
    compareAtInCents: 10990,
    colors: ["pink", "blue", "green", "white"],
    featuredIndexes: [2],
    saleIndexes: [0, 1],
    newIndexes: [3],
    stockBase: 18,
    imageSeeds: ["photo-1515488042361-ee00e0ddd4e4", "photo-1515377905703-c4788e51af15"],
    buildName: (colorLabel) => `Toalha Infantil Capuz ${colorLabel}`,
    buildShortDescription: (colorLabel) =>
      `Banho infantil mais prático com cor ${colorLabel.toLowerCase()}.`,
    buildDescription: (colorLabel) =>
      `Toalha com capuz, toque macio e secagem eficiente para rotina infantil na cor ${colorLabel.toLowerCase()}.`,
    tags: ["infantil", "toalha", "banho"],
  },
];

const createProductImage = (id: string, seed: string) => ({
  id,
  url: image(seed),
  alt: "Produto PV Casa em ambientação elegante",
});

export const products: ProductDefinition[] = productFamilies.flatMap((family) =>
  family.colors.map((colorSlug, index) => {
    const colorLabel = colorLabels[colorSlug];

    return {
      id: `${family.key}-${colorSlug}`,
      slug: `${family.key}-${colorSlug}`,
      sku: `PVC-${family.categorySlug.toUpperCase()}-${String(index + 1).padStart(3, "0")}-${family.key
        .slice(0, 3)
        .toUpperCase()}`,
      name: family.buildName(colorLabel),
      shortDescription: family.buildShortDescription(colorLabel),
      description: family.buildDescription(colorLabel),
      priceInCents: family.basePriceInCents + index * 1500,
      compareAtCents: family.compareAtInCents
        ? family.compareAtInCents + index * 1500
        : undefined,
      shippingInCents: 999,
      stock: family.stockBase + index * 3,
      isFeatured: family.featuredIndexes?.includes(index) ?? false,
      isNew: family.newIndexes?.includes(index) ?? false,
      isOnSale: family.saleIndexes?.includes(index) ?? false,
      brand: family.brand,
      material: family.material,
      categorySlug: family.categorySlug,
      colors: [colorSlug],
      room: family.room,
      audience: family.audience,
      tags: [...family.tags, colorLabel.toLowerCase(), family.material.toLowerCase()],
      images: [
        createProductImage(`${family.key}-${colorSlug}-1`, family.imageSeeds[0]),
        createProductImage(`${family.key}-${colorSlug}-2`, family.imageSeeds[1]),
      ],
    };
  }),
);

export const heroSlides: HeroSlideDefinition[] = [
  {
    id: "hero-1",
    href: "/shop?category=bed",
    imageUrl: image("photo-1505693416388-ac5ce068fe85"),
  },
  {
    id: "hero-2",
    href: "/shop?category=table",
    imageUrl: image("photo-1524758631624-e2822e304c36"),
  },
  {
    id: "hero-3",
    href: "/shop?category=bath",
    imageUrl: image("photo-1515377905703-c4788e51af15"),
  },
];

export const customerAccounts: CustomerAccount[] = [
  {
    id: "customer-ana",
    name: "Ana Carolina Gomes",
    email: "ana@pvcasa.com",
    phone: "(93) 99111-2233",
    passwordHash: "$2b$12$.i1XKO0r7hTMFDIgkX2BN.QzFYxxlGo.Zy/zIRbiyPkY/.rBwaQca",
    createdAt: "2026-04-01T10:00:00.000Z",
    source: "mock",
    primaryAddress: {
      id: "customer-ana-primary",
      label: "Endereço principal",
      type: "PRIMARY",
      recipientName: "Ana Carolina Gomes",
      phone: "(93) 99111-2233",
      postalCode: "68180-220",
      street: "Rua das Flores",
      number: "125",
      neighborhood: "Centro",
      city: "Itaituba",
      state: "PA",
      complement: "Casa",
    },
    addresses: [
      {
        id: "customer-ana-primary",
        label: "Endereço principal",
        type: "PRIMARY",
        recipientName: "Ana Carolina Gomes",
        phone: "(93) 99111-2233",
        postalCode: "68180-220",
        street: "Rua das Flores",
        number: "125",
        neighborhood: "Centro",
        city: "Itaituba",
        state: "PA",
        complement: "Casa",
      },
    ],
  },
  {
    id: "customer-bruno",
    name: "Bruno Henrique Dias",
    email: "bruno@pvcasa.com",
    phone: "(93) 99288-4411",
    passwordHash: "$2b$12$.i1XKO0r7hTMFDIgkX2BN.QzFYxxlGo.Zy/zIRbiyPkY/.rBwaQca",
    createdAt: "2026-04-03T15:30:00.000Z",
    source: "mock",
    primaryAddress: {
      id: "customer-bruno-primary",
      label: "Endereço principal",
      type: "PRIMARY",
      recipientName: "Bruno Henrique Dias",
      phone: "(93) 99288-4411",
      postalCode: "68005-100",
      street: "Travessa Tapajós",
      number: "88",
      neighborhood: "Aldeia",
      city: "Santarém",
      state: "PA",
    },
    addresses: [
      {
        id: "customer-bruno-primary",
        label: "Endereço principal",
        type: "PRIMARY",
        recipientName: "Bruno Henrique Dias",
        phone: "(93) 99288-4411",
        postalCode: "68005-100",
        street: "Travessa Tapajós",
        number: "88",
        neighborhood: "Aldeia",
        city: "Santarém",
        state: "PA",
      },
    ],
  },
];

export const orders: Order[] = [
  {
    id: "order-001",
    customerId: "customer-ana",
    orderNumber: "PVC-20260415-112",
    status: "PROCESSING",
    customerName: "Ana Carolina Gomes",
    customerEmail: "ana@pvcasa.com",
    totalInCents: 64980,
    city: "Itaituba",
    state: "PA",
    createdAt: "2026-04-15T14:20:00.000Z",
    items: [
      {
        id: "order-001-item-1",
        productId: products[0].id,
        name: products[0].name,
        slug: products[0].slug,
        quantity: 1,
        unitPriceInCents: products[0].priceInCents,
      },
      {
        id: "order-001-item-2",
        productId: products[28].id,
        name: products[28].name,
        slug: products[28].slug,
        quantity: 1,
        unitPriceInCents: products[28].priceInCents,
      },
    ],
  },
  {
    id: "order-002",
    customerId: "customer-ana",
    orderNumber: "PVC-20260410-104",
    status: "DELIVERED",
    customerName: "Ana Carolina Gomes",
    customerEmail: "ana@pvcasa.com",
    totalInCents: 25990,
    city: "Itaituba",
    state: "PA",
    createdAt: "2026-04-10T11:00:00.000Z",
    items: [
      {
        id: "order-002-item-1",
        productId: products[10].id,
        name: products[10].name,
        slug: products[10].slug,
        quantity: 1,
        unitPriceInCents: products[10].priceInCents,
      },
    ],
  },
  {
    id: "order-003",
    customerId: "customer-bruno",
    orderNumber: "PVC-20260413-107",
    status: "SHIPPED",
    customerName: "Bruno Henrique Dias",
    customerEmail: "bruno@pvcasa.com",
    totalInCents: 53980,
    city: "Santarém",
    state: "PA",
    createdAt: "2026-04-13T18:42:00.000Z",
    items: [
      {
        id: "order-003-item-1",
        productId: products[16].id,
        name: products[16].name,
        slug: products[16].slug,
        quantity: 1,
        unitPriceInCents: products[16].priceInCents,
      },
      {
        id: "order-003-item-2",
        productId: products[34].id,
        name: products[34].name,
        slug: products[34].slug,
        quantity: 2,
        unitPriceInCents: products[34].priceInCents,
      },
    ],
  },
  {
    id: "order-004",
    customerId: "customer-bruno",
    orderNumber: "PVC-20260402-091",
    status: "PAID",
    customerName: "Bruno Henrique Dias",
    customerEmail: "bruno@pvcasa.com",
    totalInCents: 8990,
    city: "Santarém",
    state: "PA",
    createdAt: "2026-04-02T09:30:00.000Z",
    items: [
      {
        id: "order-004-item-1",
        productId: products[39].id,
        name: products[39].name,
        slug: products[39].slug,
        quantity: 1,
        unitPriceInCents: products[39].priceInCents,
      },
    ],
  },
];

export const dashboardMetrics: DashboardMetrics = {
  revenueInCents: 24856000,
  orders: 516,
  averageTicketInCents: 48170,
  returningCustomers: 143,
  bestSellers: [
    { name: products[0].name, quantity: 84, revenueInCents: 2435160 },
    { name: products[10].name, quantity: 72, revenueInCents: 1889280 },
    { name: products[28].name, quantity: 55, revenueInCents: 879450 },
  ],
  recentOrders: orders,
};
