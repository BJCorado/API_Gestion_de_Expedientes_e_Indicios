USE GestionExpedientes;
GO
CREATE OR ALTER PROCEDURE dbo.sp_Usuarios_Crear
  @username       NVARCHAR(50),
  @password_hash  NVARCHAR(255),
  @role           NVARCHAR(20)
AS
BEGIN
  SET NOCOUNT ON;

  -- Validación de duplicado (opcional si ya tienes UNIQUE INDEX en la tabla)
  IF EXISTS (SELECT 1 FROM dbo.Usuarios WHERE username = @username)
    THROW 50010, 'username ya existe', 1;

  INSERT INTO dbo.Usuarios (username, password_hash, role, activo)
  VALUES (@username, @password_hash, @role, 1);

  SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
END
GO
