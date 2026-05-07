CREATE TABLE "TrafficEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrafficEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TrafficEvent_source_createdAt_idx" ON "TrafficEvent"("source", "createdAt");
CREATE INDEX "TrafficEvent_sessionId_createdAt_idx" ON "TrafficEvent"("sessionId", "createdAt");
