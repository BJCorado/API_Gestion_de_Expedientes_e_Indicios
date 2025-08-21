USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Indicios_ListarPorExpediente','P') IS NOT NULL DROP PROCEDURE dbo.sp_Indicios_ListarPorExpediente;
GO
CREATE PROCEDURE dbo.sp_Indicios_ListarPorExpediente
  @expediente_id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT i.*
  FROM dbo.Indicios i
  WHERE i.expediente_id = @expediente_id
    AND i.activo = 1
  ORDER BY i.id DESC;
END
GO
