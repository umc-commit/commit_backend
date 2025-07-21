/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `points` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `points_user_id_key` ON `points`(`user_id`);
