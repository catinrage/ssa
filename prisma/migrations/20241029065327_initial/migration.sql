-- CreateEnum
CREATE TYPE "OperationEnum" AS ENUM ('ROUGH', 'FINISH', 'SEMI_FINISH', 'DRILLING', 'FACE_MILLING');

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "name" "OperationEnum" NOT NULL,
    "flags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupSheet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ignored" BOOLEAN NOT NULL DEFAULT false,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetupSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolSettingsForProject" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "ToolSettingsForProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationTimeStats" (
    "id" TEXT NOT NULL,
    "toolId" TEXT,
    "groupId" TEXT,
    "toolSettingsForProjectId" TEXT,
    "rough" INTEGER NOT NULL DEFAULT 0,
    "finish" INTEGER NOT NULL DEFAULT 0,
    "semiFinish" INTEGER NOT NULL DEFAULT 0,
    "drilling" INTEGER NOT NULL DEFAULT 0,
    "faceMilling" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OperationTimeStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToTool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_name_key" ON "Setting"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_name_key" ON "Operation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_key" ON "Tool"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_projectId_name_key" ON "Group"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "OperationTimeStats_toolId_key" ON "OperationTimeStats"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationTimeStats_groupId_key" ON "OperationTimeStats"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationTimeStats_toolSettingsForProjectId_key" ON "OperationTimeStats"("toolSettingsForProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToTool_AB_unique" ON "_GroupToTool"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToTool_B_index" ON "_GroupToTool"("B");

-- AddForeignKey
ALTER TABLE "SetupSheet" ADD CONSTRAINT "SetupSheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSettingsForProject" ADD CONSTRAINT "ToolSettingsForProject_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSettingsForProject" ADD CONSTRAINT "ToolSettingsForProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTimeStats" ADD CONSTRAINT "OperationTimeStats_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTimeStats" ADD CONSTRAINT "OperationTimeStats_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationTimeStats" ADD CONSTRAINT "OperationTimeStats_toolSettingsForProjectId_fkey" FOREIGN KEY ("toolSettingsForProjectId") REFERENCES "ToolSettingsForProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTool" ADD CONSTRAINT "_GroupToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTool" ADD CONSTRAINT "_GroupToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
