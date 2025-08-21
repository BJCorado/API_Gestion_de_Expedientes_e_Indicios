USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Expedientes_Crear','P') IS NOT NULL DROP PROCEDURE dbo.sp_Expedientes_Crear;
GO
CREATE PROCEDURE dbo.sp_Expedientes_Crear
  @codigo NVARCHAR(50),
  @descripcion NVARCHAR(500),
  @tecnico_id INT
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Expedientes (codigo, descripcion, tecnico_id)
  VALUES (@codigo, @descripcion, @tecnico_id);

  SELECT SCOPE_IDENTITY() AS id;
END
GO
