-- Script para poblar la base de datos con datos iniciales
USE [GestionExpedientes];
GO
DELETE FROM dbo.Usuarios;
GO
INSERT INTO dbo.Usuarios(username, role, password_hash, activo) VALUES
('tecnico1','tecnico','$2b$10$BCgmn9EfJnFWTIN5FqC5oe7k0s89UX6uPNztj9LsmsVXoXM6DGxv2',1),
('coordinador1','coordinador','$2b$10$0TzFEgwbifn.KalZDL9F6OYaxE3gzTsiDZuJRKJxHa4Bta8/Yr0dK',1);
GO
