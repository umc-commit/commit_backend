/*
  Warnings:

  - A unique constraint covering the columns `[request_id]` on the table `point_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `point_transactions_request_id_key` ON `point_transactions`(`request_id`);
