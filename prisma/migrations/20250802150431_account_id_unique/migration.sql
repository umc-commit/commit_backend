/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `artists` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `artists_account_id_key` ON `artists`(`account_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_account_id_key` ON `users`(`account_id`);
