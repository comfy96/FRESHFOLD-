/*
  Warnings:

  - Made the column `preferred_pickup_window` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "docket_number" INTEGER NOT NULL,
    "claim_pin_hash" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" DATETIME,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "preferred_pickup_window" TEXT NOT NULL,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_customers" ("claim_pin_hash", "created_at", "deleted_at", "docket_number", "email", "email_verified", "full_name", "id", "password_hash", "phone", "preferred_pickup_window", "role", "terms_accepted", "verified_at") SELECT "claim_pin_hash", "created_at", "deleted_at", "docket_number", "email", "email_verified", "full_name", "id", "password_hash", "phone", "preferred_pickup_window", "role", "terms_accepted", "verified_at" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
