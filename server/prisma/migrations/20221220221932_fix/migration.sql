/*
  Warnings:

  - You are about to drop the `Bike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Point` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rental` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Bike";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Point";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Rental";
PRAGMA foreign_keys=on;
