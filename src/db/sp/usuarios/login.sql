USE GestionExpedientes;
GO
CREATE OR ALTER PROCEDURE dbo.sp_Usuarios_Login
  @username NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  -- Devuelve solo datos necesarios para comparar la contraseña en Node
  SELECT TOP 1
      id,
      username,
      password_hash,
      role,
      activo
  FROM dbo.Usuarios
  WHERE username = @username;
END
GO
