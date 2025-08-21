USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Expedientes_Listar','P') IS NOT NULL DROP PROCEDURE dbo.sp_Expedientes_Listar;
GO
CREATE PROCEDURE dbo.sp_Expedientes_Listar
  @page       INT = 1,
  @pageSize   INT = 10,
  @estado     NVARCHAR(20) = NULL,           -- 'pendiente' | 'aprobado' | 'rechazado'
  @codigo     NVARCHAR(50) = NULL,           -- búsqueda exacta o parcial
  @tecnico_id INT = NULL                     -- filtrar por técnico (para vistas del técnico)
AS
BEGIN
  SET NOCOUNT ON;

  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  ;WITH filtrado AS (
    SELECT e.*, u.username AS tecnico, ROW_NUMBER() OVER (ORDER BY e.id DESC) AS rn
    FROM dbo.Expedientes e
    INNER JOIN dbo.Usuarios u ON e.tecnico_id = u.id
    WHERE e.activo = 1
      AND (@estado IS NULL OR e.estado = @estado)
      AND (@codigo IS NULL OR e.codigo LIKE '%' + @codigo + '%')
      AND (@tecnico_id IS NULL OR e.tecnico_id = @tecnico_id)
  )
  SELECT *
  FROM filtrado
  WHERE rn BETWEEN ((@page-1)*@pageSize + 1) AND (@page*@pageSize);

  -- total para paginación (opcional)
  SELECT COUNT(*) AS total
  FROM dbo.Expedientes e
  WHERE e.activo = 1
    AND (@estado IS NULL OR e.estado = @estado)
    AND (@codigo IS NULL OR e.codigo LIKE '%' + @codigo + '%')
    AND (@tecnico_id IS NULL OR e.tecnico_id = @tecnico_id);
END
GO

