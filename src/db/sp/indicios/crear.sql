USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Indicios_Crear','P') IS NOT NULL DROP PROCEDURE dbo.sp_Indicios_Crear;
GO
CREATE PROCEDURE dbo.sp_Indicios_Crear
  @expediente_id INT,
  @descripcion NVARCHAR(500),
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @peso DECIMAL(10,2),
  @ubicacion NVARCHAR(100) = NULL,
  @tecnico_id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF @peso < 0
  BEGIN
    RAISERROR('El peso debe ser >= 0.', 16, 1);
    RETURN;
  END

  -- Validar que el expediente exista y esté activo
  IF NOT EXISTS(SELECT 1 FROM dbo.Expedientes WHERE id=@expediente_id AND activo=1)
  BEGIN
    RAISERROR('Expediente no encontrado o inactivo.', 16, 1);
    RETURN;
  END

  INSERT INTO dbo.Indicios (expediente_id, descripcion, color, tamano, peso, ubicacion, tecnico_id)
  VALUES (@expediente_id, @descripcion, @color, @tamano, @peso, @ubicacion, @tecnico_id);

  SELECT SCOPE_IDENTITY() AS id;
END
GO
