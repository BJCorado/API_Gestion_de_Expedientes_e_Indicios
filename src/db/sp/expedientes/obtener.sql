USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Expedientes_Obtener','P') IS NOT NULL DROP PROCEDURE dbo.sp_Expedientes_Obtener;
GO
CREATE PROCEDURE dbo.sp_Expedientes_Obtener
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT e.*, t.username AS tecnico, a.username AS aprobador
  FROM dbo.Expedientes e
  LEFT JOIN dbo.Usuarios t ON t.id = e.tecnico_id
  LEFT JOIN dbo.Usuarios a ON a.id = e.aprobador_id
  WHERE e.id = @id AND e.activo = 1;
END
GO
