-- CreateTable
CREATE TABLE "VasSchedule" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VasSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundSchedule" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VasSchedule_date_idx" ON "VasSchedule"("date");

-- CreateIndex
CREATE INDEX "VasSchedule_appointmentTime_idx" ON "VasSchedule"("appointmentTime");

-- CreateIndex
CREATE INDEX "OutboundSchedule_date_idx" ON "OutboundSchedule"("date");

-- CreateIndex
CREATE INDEX "OutboundSchedule_appointmentTime_idx" ON "OutboundSchedule"("appointmentTime");
