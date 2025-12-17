-- AlterTable
ALTER TABLE "_GroupToTool" ADD CONSTRAINT "_GroupToTool_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_GroupToTool_AB_unique";
