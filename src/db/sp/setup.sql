-- =====================================================================
-- Ejecuta TODOS los procedimientos almacenados del proyecto
-- Requiere: sqlcmd (lo usaremos desde el contenedor)
-- =====================================================================

-- Asegura la base correcta
USE GestionExpedientes;
GO

-- ====================== USUARIOS ======================
:r /sp/usuarios/crear.sql
:r /sp/usuarios/login.sql
:r /sp/usuarios/listar.sql

-- ====================== EXPEDIENTES ===================
:r /sp/expedientes/crear.sql
:r /sp/expedientes/actualizar.sql
:r /sp/expedientes/obtener.sql
:r /sp/expedientes/listar.sql
:r /sp/expedientes/cambiar_estado.sql
:r /sp/expedientes/activar_desactivar.sql

-- ====================== INDICIOS ======================
:r /sp/indicios/crear.sql
:r /sp/indicios/actualizar.sql
:r /sp/indicios/listar_por_expediente.sql
:r /sp/indicios/activar_desactivar.sql
