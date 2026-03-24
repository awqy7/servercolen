@echo off
echo =========================================
echo    PREPARANDO SISTEMA DA OFICINA
echo =========================================
echo.
echo Instalando dependencias do sistema...
call npm install

echo.
echo Otimizando o sistema para velocidade maxima (Build)...
call npm run build

echo.
echo =========================================
echo TUDO PRONTO!
echo Pode fechar esta janela. A partir de agora, 
echo use apenas o botao "Iniciar Sistema Oficina".
echo =========================================
pause
