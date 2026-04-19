-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUSINESS_OWNER', 'CLUSTER_OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('SEEDING', 'ACTIVE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "FieldStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'GENERATING_REPORT', 'ACTIVE', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "CoEarningType" AS ENUM ('SESSION_SHARE', 'FIELD_SUBMISSION', 'REFRESH_BONUS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BUSINESS_OWNER',
    "wallet_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_owners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "co_score" INTEGER NOT NULL DEFAULT 0,
    "nft_mint_address" TEXT,
    "nft_tx_signature" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cluster_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_earnings" (
    "id" TEXT NOT NULL,
    "co_id" TEXT NOT NULL,
    "type" "CoEarningType" NOT NULL,
    "amount_idrx" DECIMAL(18,2) NOT NULL,
    "description" TEXT NOT NULL,
    "cluster_id" TEXT,
    "session_id" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "co_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "status" "ClusterStatus" NOT NULL DEFAULT 'SEEDING',
    "anchor_lat" DOUBLE PRECISION NOT NULL,
    "anchor_lng" DOUBLE PRECISION NOT NULL,
    "radius_km" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "anchor_label" TEXT NOT NULL,
    "data_completeness" INTEGER NOT NULL DEFAULT 0,
    "confidence_score" INTEGER NOT NULL DEFAULT 0,
    "total_validated_fields" INTEGER NOT NULL DEFAULT 0,
    "onchain_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_field_values" (
    "id" TEXT NOT NULL,
    "cluster_id" TEXT NOT NULL,
    "field_code" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "collection_method" TEXT NOT NULL,
    "is_complex" BOOLEAN NOT NULL DEFAULT false,
    "value" JSONB NOT NULL,
    "status" "FieldStatus" NOT NULL DEFAULT 'PENDING',
    "evidence_note" TEXT,
    "evidence_photo_url" TEXT,
    "field_hash" TEXT,
    "sol_tx_signature" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),

    CONSTRAINT "cluster_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cluster_id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amount_idrx" DECIMAL(18,2) NOT NULL DEFAULT 400000,
    "sol_tx_signature" TEXT,
    "free_message_count" INTEGER NOT NULL DEFAULT 0,
    "activated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept_forms" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "fb_subcategory" TEXT NOT NULL,
    "concept_name" TEXT NOT NULL,
    "concept_description" TEXT NOT NULL,
    "target_customer" TEXT NOT NULL,
    "specific_questions" TEXT,
    "menu_items" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "sections" JSONB,
    "pdf_url" TEXT,
    "tokens_used" INTEGER,
    "generation_time_ms" INTEGER,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT,
    "user_id" TEXT NOT NULL,
    "cluster_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "message_num" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_owners_user_id_key" ON "cluster_owners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_slug_key" ON "clusters"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_field_values_cluster_id_field_code_key" ON "cluster_field_values"("cluster_id", "field_code");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sol_tx_signature_key" ON "sessions"("sol_tx_signature");

-- CreateIndex
CREATE UNIQUE INDEX "concept_forms_session_id_key" ON "concept_forms"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_session_id_key" ON "reports"("session_id");

-- AddForeignKey
ALTER TABLE "cluster_owners" ADD CONSTRAINT "cluster_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_earnings" ADD CONSTRAINT "co_earnings_co_id_fkey" FOREIGN KEY ("co_id") REFERENCES "cluster_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "cluster_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_field_values" ADD CONSTRAINT "cluster_field_values_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_forms" ADD CONSTRAINT "concept_forms_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
