@echo off
echo ===================================================
echo   Update Backend URL ke Railway Baru
echo ===================================================
echo.

cd /d "%~dp0"

set "OLD=https://desakalemago2-backend-production.up.railway.app"
set "NEW=https://desakalemago2-backend-production-674c.up.railway.app"

echo Sedang mengganti semua URL backend...
echo.

for /R %%f in (*.html *.js) do (
    powershell -Command "(Get-Content '%%f') -replace '%OLD%', '%NEW%' | Set-Content '%%f'"
)

echo.
echo ===================================================
echo   Selesai! Semua file sudah diupdate.
echo   Sekarang silakan push ke GitHub.
echo ===================================================
echo.
pause