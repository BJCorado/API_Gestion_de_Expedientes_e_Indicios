-- Script para crear el esquema de la base de datos
USE [master];
IF DB_ID('GestionExpedientes') IS NULL CREATE DATABASE GestionExpedientes;
GO
USE [GestionExpedientes];
GO

IF OBJECT_ID('dbo.Indicios','U') IS NOT NULL DROP TABLE dbo.Indicios;
IF OBJECT_ID('dbo.Expedientes','U') IS NOT NULL DROP TABLE dbo.Expedientes;
IF OBJECT_ID('dbo.Usuarios','U') IS NOT NULL DROP TABLE dbo.Usuarios;
GO

CREATE TABLE dbo.Usuarios(
  id INT IDENTITY PRIMARY KEY,
  username NVARCHAR(50) NOT NULL UNIQUE,
  role NVARCHAR(20) NOT NULL CHECK (role IN ('tecnico','coordinador')),
  password_hash NVARCHAR(255) NOT NULL,
  activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.Expedientes(
  id INT IDENTITY PRIMARY KEY,
  codigo NVARCHAR(50) NOT NULL UNIQUE,
  descripcion NVARCHAR(500) NOT NULL,
  fecha_registro DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  tecnico_id INT NOT NULL,
  estado NVARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
  justificacion NVARCHAR(500) NULL,
  aprobador_id INT NULL,
  fecha_estado DATETIME2 NULL,
  activo BIT NOT NULL DEFAULT 1,
  CONSTRAINT FK_Exp_Tecnico FOREIGN KEY (tecnico_id) REFERENCES dbo.Usuarios(id),
  CONSTRAINT FK_Exp_Aprobador FOREIGN KEY (aprobador_id) REFERENCES dbo.Usuarios(id)
);

CREATE TABLE dbo.Indicios(
  id INT IDENTITY PRIMARY KEY,
  expediente_id INT NOT NULL,
  descripcion NVARCHAR(500) NOT NULL,
  color NVARCHAR(50) NULL,
  tamano NVARCHAR(50) NULL,
  peso DECIMAL(10,2) NOT NULL CHECK (peso >= 0),
  ubicacion NVARCHAR(100) NULL,
  tecnico_id INT NOT NULL,
  fecha_registro DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  activo BIT NOT NULL DEFAULT 1,
  CONSTRAINT FK_Ind_Exp FOREIGN KEY (expediente_id) REFERENCES dbo.Expedientes(id),
  CONSTRAINT FK_Ind_Tec FOREIGN KEY (tecnico_id) REFERENCES dbo.Usuarios(id)
);
GO

IF OBJECT_ID('dbo.sp_Usuarios_Login','P') IS NOT NULL DROP PROCEDURE dbo.sp_Usuarios_Login;
GO
CREATE PROCEDURE dbo.sp_Usuarios_Login
  @username NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1 id, username, role, password_hash, activo
  FROM dbo.Usuarios WHERE username=@username AND activo=1;
END
GO

IF OBJECT_ID('dbo.sp_Usuarios_Crear','P') IS NOT NULL DROP PROCEDURE dbo.sp_Usuarios_Crear;
GO
CREATE PROCEDURE dbo.sp_Usuarios_Crear
  @p_username NVARCHAR(50),
  @p_password_hash NVARCHAR(255),
  @p_role NVARCHAR(20)
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Usuarios(username, role, password_hash, activo)
  VALUES(@p_username, @p_role, @p_password_hash, 1);
  SELECT SCOPE_IDENTITY() AS id;
END
GO
