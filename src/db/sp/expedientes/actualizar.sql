USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Expedientes_Actualizar','P') IS NOT NULL DROP PROCEDURE dbo.sp_Expedientes_Actualizar;
GO
CREATE PROCEDURE dbo.sp_Expedientes_Actualizar
  @id INT,
  @codigo NVARCHAR(50),
  @descripcion NVARCHAR(500)
AS
BEGIN
  SET NOCOUNT ON;

  -- validar código único (excluyendo el mismo id)
  IF EXISTS(SELECT 1 FROM dbo.Expedientes WHERE codigo=@codigo AND id<>@id)
  BEGIN
    RAISERROR('El código ya existe.', 16, 1);
    RETURN;
  END

  UPDATE dbo.Expedientes
  SET codigo = @codigo,
      descripcion = @descripcion,
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id AND activo = 1;

  SELECT * FROM dbo.Expedientes WHERE id = @id;
END
GO
