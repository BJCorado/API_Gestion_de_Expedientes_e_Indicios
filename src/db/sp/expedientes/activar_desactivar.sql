USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Expedientes_ActivarDesactivar','P') IS NOT NULL DROP PROCEDURE dbo.sp_Expedientes_ActivarDesactivar;
GO
CREATE PROCEDURE dbo.sp_Expedientes_ActivarDesactivar
  @id INT,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.Expedientes
  SET activo = @activo,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT * FROM dbo.Expedientes WHERE id = @id;
END
GO
