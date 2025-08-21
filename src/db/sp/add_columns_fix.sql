USE GestionExpedientes;
GO

-- EXPEDIENTES
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Expedientes') AND name = 'actualizado_en')
  ALTER TABLE dbo.Expedientes ADD actualizado_en DATETIME2 NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Expedientes') AND name = 'fecha_estado')
  ALTER TABLE dbo.Expedientes ADD fecha_estado DATETIME2 NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Expedientes') AND name = 'aprobador_id')
  ALTER TABLE dbo.Expedientes ADD aprobador_id INT NULL;
GO

-- INDICIOS
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Indicios') AND name = 'actualizado_en')
  ALTER TABLE dbo.Indicios ADD actualizado_en DATETIME2 NULL;
GO
