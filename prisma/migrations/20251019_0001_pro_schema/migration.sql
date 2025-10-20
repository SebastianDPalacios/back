-- CreateEnum
CREATE TYPE "ProjectEstado" AS ENUM ('BORRADOR', 'EN_PROGRESO', 'PAUSADO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TaskEstado" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'HECHA', 'BLOQUEADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "ProjectEstado" NOT NULL DEFAULT 'BORRADOR',
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "ownerId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "TaskEstado" NOT NULL DEFAULT 'PENDIENTE',
    "proyectoId" INTEGER NOT NULL,
    "asignadoAId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyectoMiembro" (
    "proyectoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "ProyectoMiembro_pkey" PRIMARY KEY ("proyectoId","usuarioId")
);

-- CreateTable
CREATE TABLE "Etiqueta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Etiqueta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyectoEtiqueta" (
    "proyectoId" INTEGER NOT NULL,
    "etiquetaId" INTEGER NOT NULL,

    CONSTRAINT "ProyectoEtiqueta_pkey" PRIMARY KEY ("proyectoId","etiquetaId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "tabla" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "actorId" INTEGER,
    "ocurridoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_nombre_key" ON "Proyecto"("nombre");

-- CreateIndex
CREATE INDEX "Proyecto_estado_idx" ON "Proyecto"("estado");

-- CreateIndex
CREATE INDEX "Tarea_proyectoId_estado_idx" ON "Tarea"("proyectoId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Etiqueta_nombre_key" ON "Etiqueta"("nombre");

-- CreateIndex
CREATE INDEX "AuditLog_tabla_ocurridoEn_idx" ON "AuditLog"("tabla", "ocurridoEn");

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoMiembro" ADD CONSTRAINT "ProyectoMiembro_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoMiembro" ADD CONSTRAINT "ProyectoMiembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoEtiqueta" ADD CONSTRAINT "ProyectoEtiqueta_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoEtiqueta" ADD CONSTRAINT "ProyectoEtiqueta_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "Etiqueta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

