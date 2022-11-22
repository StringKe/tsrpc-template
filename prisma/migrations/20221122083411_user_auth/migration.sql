-- CreateEnum
CREATE TYPE "UserFileConsumeType" AS ENUM ('MEMBER', 'RESOURCE_PACKAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRecordSource" AS ENUM ('Promoter', 'Order', 'System', 'Activity', 'Other');

-- CreateEnum
CREATE TYPE "UserRecordType" AS ENUM ('Alliance', 'Withdraw', 'ResourcePackage', 'Member', 'Other');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "phoneCode" TEXT DEFAULT '+86',
    "phoneVerififedAt" TIMESTAMP(3),
    "isMember" BOOLEAN NOT NULL DEFAULT false,
    "memberLevel" INTEGER NOT NULL DEFAULT 0,
    "memberExpiredAt" TIMESTAMP(3),
    "memberStartedAt" TIMESTAMP(3),
    "loginIp" TEXT,
    "loginAt" TIMESTAMP(3),
    "registerIp" TEXT,
    "registerAt" TIMESTAMP(3),
    "registerChannel" TEXT,
    "inviterId" INTEGER,
    "inviteActivityId" INTEGER,
    "isPromoter" BOOLEAN NOT NULL DEFAULT false,
    "promoterOrderDivide" INTEGER DEFAULT 0,
    "promoterPackageDivide" INTEGER DEFAULT 0,
    "promoterOtherDivide" INTEGER DEFAULT 0,
    "totalDivide" INTEGER DEFAULT 0,
    "withdrawedDivide" INTEGER DEFAULT 0,
    "unwithdrawDivide" INTEGER DEFAULT 0,
    "settledDivide" INTEGER DEFAULT 0,
    "unsettledDivide" INTEGER DEFAULT 0,
    "memberDayReward" INTEGER DEFAULT 0,
    "packageCountReward" INTEGER DEFAULT 0,
    "withdrawType" TEXT,
    "withdrawAccount" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "bannedExpiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "platformValue" TEXT NOT NULL,
    "platformValueType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileDimension" DOUBLE PRECISION[],
    "fileMd5" TEXT,
    "filePath" TEXT,
    "resultPath" TEXT,
    "resultSize" INTEGER,
    "resultDimension" DOUBLE PRECISION[],
    "resultMd5" TEXT,
    "thumbnailResultPath" TEXT,
    "thumbnailResultSize" INTEGER,
    "thumbnailResultDimension" DOUBLE PRECISION[],
    "thumbnailResultMd5" TEXT,
    "thumbnailPath" TEXT,
    "thumbnailSize" INTEGER,
    "thumbnailDimension" DOUBLE PRECISION[],
    "thumbnailMd5" TEXT,
    "taskStatus" TEXT,
    "taskRetryCount" INTEGER DEFAULT 0,
    "taskError" TEXT,
    "taskLastStartedAt" TIMESTAMP(3),
    "taskLastReportedAt" TIMESTAMP(3),
    "taskFaceData" JSONB,
    "taskType" TEXT,
    "isOriginalFileDeleted" BOOLEAN DEFAULT false,
    "originalFileDeletedAt" TIMESTAMP(3),
    "isFromMiniProgram" BOOLEAN DEFAULT false,
    "isFromApp" BOOLEAN DEFAULT false,
    "isFromDesktop" BOOLEAN DEFAULT false,
    "shareShortKey" TEXT,
    "shareViewCount" INTEGER DEFAULT 0,
    "shareDownloadCount" INTEGER DEFAULT 0,
    "isConsumed" BOOLEAN DEFAULT false,
    "consumeType" "UserFileConsumeType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER,
    "batchId" INTEGER,

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBatchFile" (
    "id" SERIAL NOT NULL,
    "total" INTEGER,
    "completed" INTEGER,
    "failed" INTEGER,
    "totalSize" INTEGER,
    "zipPath" TEXT,
    "zipSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "UserBatchFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResourcePackage" (
    "id" SERIAL NOT NULL,
    "total" INTEGER,
    "used" INTEGER,
    "lastUsedAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "UserResourcePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRecord" (
    "id" SERIAL NOT NULL,
    "source" "UserRecordSource" NOT NULL,
    "type" "UserRecordType" NOT NULL,
    "data" JSONB,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "UserRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "UserBatchFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBatchFile" ADD CONSTRAINT "UserBatchFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResourcePackage" ADD CONSTRAINT "UserResourcePackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRecord" ADD CONSTRAINT "UserRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
