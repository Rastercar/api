-- CreateTable
CREATE TABLE "AccessLevel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "isFixed" BOOLEAN NOT NULL,
    "permissions" TEXT[],
    "organizationId" INTEGER,

    CONSTRAINT "AccessLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterAccessLevel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "isFixed" BOOLEAN NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "MasterAccessLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterUser" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "username" VARCHAR(255) NOT NULL,
    "lastLogin" TIMESTAMPTZ(0),
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR(255) NOT NULL,
    "resetPasswordToken" TEXT,
    "accessLevelId" INTEGER,
    "masterAccessLevelId" INTEGER NOT NULL,

    CONSTRAINT "MasterUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" VARCHAR(255) NOT NULL,
    "deletedAt" TIMESTAMPTZ(0),
    "blocked" BOOLEAN NOT NULL,
    "billingEmail" VARCHAR(255) NOT NULL,
    "billingEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimCard" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "phoneNumber" VARCHAR(255) NOT NULL,
    "ssn" VARCHAR(255) NOT NULL,
    "apnAddress" VARCHAR(255) NOT NULL,
    "apnUser" VARCHAR(255) NOT NULL,
    "apnPassword" VARCHAR(255) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "trackerId" INTEGER,

    CONSTRAINT "SimCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tracker" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "model" VARCHAR(255) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "vehicleId" INTEGER,

    CONSTRAINT "Tracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnregisteredUser" (
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" VARCHAR(255),
    "email" VARCHAR(255),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "oauthProvider" VARCHAR(255) NOT NULL,
    "oauthProfileId" VARCHAR(255) NOT NULL,

    CONSTRAINT "UnregisteredUser_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "username" VARCHAR(255) NOT NULL,
    "lastLogin" TIMESTAMPTZ(0),
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR(255) NOT NULL,
    "resetPasswordToken" TEXT,
    "googleProfileId" VARCHAR(255),
    "autoLoginToken" TEXT,
    "organizationId" INTEGER NOT NULL,
    "accessLevelId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "plate" VARCHAR(255) NOT NULL,
    "modelYear" SMALLINT,
    "fabricationYear" SMALLINT,
    "chassisNumber" VARCHAR(255),
    "brand" VARCHAR(255),
    "model" VARCHAR(255),
    "renavam" VARCHAR(255),
    "color" VARCHAR(255),
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_user_email_unique" ON "MasterUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_email_unique" ON "Organization"("billingEmail");

-- CreateIndex
CREATE UNIQUE INDEX "organization_owner_id_unique" ON "Organization"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "sim_card_phone_number_unique" ON "SimCard"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sim_card_ssn_unique" ON "SimCard"("ssn");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_profile_id_unique" ON "User"("googleProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_plate_unique" ON "Vehicle"("plate");

-- AddForeignKey
ALTER TABLE "AccessLevel" ADD CONSTRAINT "access_level_organization_id_foreign" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterUser" ADD CONSTRAINT "master_user_access_level_id_foreign" FOREIGN KEY ("accessLevelId") REFERENCES "AccessLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterUser" ADD CONSTRAINT "master_user_master_access_level_id_foreign" FOREIGN KEY ("masterAccessLevelId") REFERENCES "MasterAccessLevel"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "organization_owner_id_foreign" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimCard" ADD CONSTRAINT "sim_card_organization_id_foreign" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimCard" ADD CONSTRAINT "sim_card_tracker_id_foreign" FOREIGN KEY ("trackerId") REFERENCES "Tracker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tracker" ADD CONSTRAINT "tracker_organization_id_foreign" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tracker" ADD CONSTRAINT "tracker_vehicle_id_foreign" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "user_access_level_id_foreign" FOREIGN KEY ("accessLevelId") REFERENCES "AccessLevel"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "user_organization_id_foreign" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "vehicle_organization_id_foreign" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
