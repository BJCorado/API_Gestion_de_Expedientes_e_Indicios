USE GestionExpedientes;
GO
IF OBJECT_ID('dbo.sp_Expedientes_CambiarEstado','P') IS NOT NULL DROP PROCEDURE dbo.sp_Expedientes_CambiarEstado;
GO
CREATE PROCEDURE dbo.sp_Expedientes_CambiarEstado
  @id INT,
  @nuevo_estado NVARCHAR(20),     -- 'aprobado' | 'rechazado'
  @justificacion NVARCHAR(500) = NULL,
  @aprobador_id INT               -- id del coordinador
AS
BEGIN
  SET NOCOUNT ON;

  IF @nuevo_estado NOT IN ('aprobado','rechazado')
  BEGIN
    RAISERROR('Estado inválido.', 16, 1);
    RETURN;
  END

  IF @nuevo_estado = 'rechazado' AND (NULLIF(LTRIM(RTRIM(@justificacion)),'') IS NULL)
  BEGIN
    RAISERROR('Se requiere justificación para rechazo.', 16, 1);
    RETURN;
  END

  UPDATE dbo.Expedientes
  SET estado = @nuevo_estado,
      justificacion = @justificacion,
      aprobador_id = @aprobador_id,
      fecha_estado = SYSUTCDATETIME(),
      actualizado_en = SYSUTCDATETIME()
  WHERE id = @id AND activo = 1;

  SELECT * FROM dbo.Expedientes WHERE id = @id;
END
GO
