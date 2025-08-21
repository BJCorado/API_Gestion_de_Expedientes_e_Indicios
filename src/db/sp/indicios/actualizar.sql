USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Indicios_Actualizar','P') IS NOT NULL DROP PROCEDURE dbo.sp_Indicios_Actualizar;
GO
CREATE PROCEDURE dbo.sp_Indicios_Actualizar
  @id INT,
  @descripcion NVARCHAR(500),
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @peso DECIMAL(10,2),
  @ubicacion NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @peso < 0
  BEGIN
    RAISERROR('El peso debe ser >= 0.', 16, 1);
    RETURN;
  END

  UPDATE dbo.Indicios
  SET descripcion = @descripcion,
      color = @color,
      tamano = @tamano,
      peso = @peso,
      ubicacion = @ubicacion,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id AND activo = 1;

  SELECT * FROM dbo.Indicios WHERE id = @id;
END
GO
