import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.193", "132.255.215.80"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  async redirects() {
    return [
      { source: "/catalogo", destination: "/shop", permanent: true },
      { source: "/produto/:slug", destination: "/products/:slug", permanent: true },
      { source: "/carrinho", destination: "/cart", permanent: true },
      { source: "/sobre", destination: "/about", permanent: true },
      { source: "/contato", destination: "/contact", permanent: true },
      { source: "/entrega", destination: "/shipping", permanent: true },
      { source: "/trocas", destination: "/returns", permanent: true },
      { source: "/checkout/sucesso", destination: "/checkout/success", permanent: true },
      { source: "/admin/produtos", destination: "/admin/products", permanent: true },
      { source: "/admin/categorias", destination: "/admin/categories", permanent: true },
      { source: "/admin/conteudo", destination: "/admin/content", permanent: true },
      { source: "/admin/pedidos", destination: "/admin/orders", permanent: true },
    ];
  },
};

export default nextConfig;