import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveTrafficSource } from "@/lib/traffic";

const trafficEventSchema = z.object({
  path: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(500).optional(),
  utmSource: z.string().trim().max(80).optional(),
  utmMedium: z.string().trim().max(80).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  sessionId: z.string().trim().max(80).optional(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return new Response(null, { status: 204 });
  }

  const body = await request.json().catch(() => null);
  const parsed = trafficEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Evento de tráfego inválido." }, { status: 400 });
  }

  const { path, referrer, utmSource, utmMedium, utmCampaign, sessionId } = parsed.data;

  if (path?.startsWith("/admin")) {
    return new Response(null, { status: 204 });
  }

  const source = resolveTrafficSource({ referrer, utmSource, utmMedium });

  if (sessionId) {
    const existingSession = await prisma.trafficEvent.findFirst({
      where: {
        sessionId,
        createdAt: { gte: startOfToday() },
      },
      select: { id: true },
    });

    if (existingSession) {
      return new Response(null, { status: 204 });
    }
  }

  await prisma.trafficEvent.create({
    data: {
      source,
      path,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      sessionId,
    },
  });

  revalidatePath("/admin");

  return new Response(null, { status: 204 });
}
