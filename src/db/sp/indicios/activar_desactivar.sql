USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Indicios_ActivarDesactivar','P') IS NOT NULL DROP PROCEDURE dbo.sp_Indicios_ActivarDesactivar;
GO
CREATE PROCEDURE dbo.sp_Indicios_ActivarDesactivar
  @id INT,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.Indicios
  SET activo = @activo,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT * FROM dbo.Indicios WHERE id = @id;
END
GO
