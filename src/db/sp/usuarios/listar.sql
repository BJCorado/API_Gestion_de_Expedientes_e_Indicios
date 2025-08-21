IF OBJECT_ID('dbo.sp_Usuarios_Listar', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Usuarios_Listar;
GO
CREATE PROCEDURE dbo.sp_Usuarios_Listar
    @search NVARCHAR(100) = NULL,
    @page   INT = 1,
    @size   INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    IF @page < 1 SET @page = 1;
    IF @size < 1 SET @size = 10;

    ;WITH U AS (
        SELECT 
            u.id,
            u.username,
            u.role,
            u.activo
        FROM dbo.Usuarios u
        WHERE (@search IS NULL
               OR u.username LIKE '%' + @search + '%'
               OR u.role     LIKE '%' + @search + '%')
    )
    SELECT 
        (SELECT COUNT(*) FROM U) AS total,
        @page AS page,
        @size AS size,
        (
            SELECT *
            FROM U
            ORDER BY id DESC
            OFFSET (@page - 1) * @size ROWS
            FETCH NEXT @size ROWS ONLY
            FOR JSON PATH
        ) AS data_json;
END
GO
