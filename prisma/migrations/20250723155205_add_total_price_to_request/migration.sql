/*
  Warnings:

  - A unique constraint covering the columns `[imp_uid]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `total_price` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `requests` ADD COLUMN `total_price` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payments_imp_uid_key` ON `payments`(`imp_uid`);
