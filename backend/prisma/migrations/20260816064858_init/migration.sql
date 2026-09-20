-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('borrow', 'giveaway');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('available', 'pending', 'borrowed', 'unavailable', 'archived');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('books_materials', 'calculators', 'cables_connectors', 'project_equipment', 'camera_photography', 'tools', 'club_activity_gear');

-- CreateEnum
CREATE TYPE "BorrowRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'returned', 'overdue', 'expired');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_request', 'request_approved', 'request_rejected', 'return_reminder', 'overdue_flag');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('listing', 'borrow_request');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'resolved');

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "owner_username" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ListingCategory" NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'available',
    "department" TEXT NOT NULL DEFAULT 'computer-science',
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borrow_requests" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "requester_username" TEXT NOT NULL,
    "message" TEXT,
    "response_message" TEXT,
    "status" "BorrowRequestStatus" NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "returned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "borrow_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_username" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "ref_listing_id" TEXT,
    "ref_request_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reporter_username" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_category_idx" ON "listings"("category");

-- CreateIndex
CREATE INDEX "listings_owner_username_idx" ON "listings"("owner_username");

-- CreateIndex
CREATE INDEX "borrow_requests_listing_id_idx" ON "borrow_requests"("listing_id");

-- CreateIndex
CREATE INDEX "borrow_requests_requester_username_idx" ON "borrow_requests"("requester_username");

-- CreateIndex
CREATE INDEX "borrow_requests_status_idx" ON "borrow_requests"("status");

-- CreateIndex
CREATE INDEX "notifications_recipient_username_is_read_idx" ON "notifications"("recipient_username", "is_read");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "borrow_requests" ADD CONSTRAINT "borrow_requests_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
