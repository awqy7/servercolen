@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║       INSTALAÇÃO DO SISTEMA DA OFICINA               ║
echo ║           AutoRepair Pro - Setup Completo            ║
echo ╚══════════════════════════════════════════════════════╝
echo.

:: ─── Verificar se Node.js está instalado ────────────────────────────────────
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js NAO foi encontrado neste computador!
    echo.
    echo Por favor, siga os passos abaixo:
    echo   1. Abra o navegador e acesse: https://nodejs.org
    echo   2. Baixe a versao LTS (recomendada)
    echo   3. Instale o Node.js normalmente (clique em Avancar em tudo)
    echo   4. Reinicie o computador
    echo   5. Abra esta pasta novamente e execute este arquivo
    echo.
    pause
    exit /b 1
)

FOR /F "tokens=*" %%V IN ('node -v') DO SET NODE_VER=%%V
echo [OK] Node.js detectado: %NODE_VER%
echo.

:: ─── Instalar dependências do projeto ───────────────────────────────────────
echo [1/2] Instalando dependencias do sistema (pode demorar alguns minutos)...
echo Por favor, aguarde...
echo.
call npm install --legacy-peer-deps

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    echo Verifique sua conexao com a internet e tente novamente.
    pause
    exit /b 1
)

echo [OK] Dependencias instaladas com sucesso!
echo.

:: ─── Build do sistema ────────────────────────────────────────────────────────
echo [2/2] Otimizando o sistema para velocidade maxima...
echo Por favor, aguarde (esta etapa pode levar 2-3 minutos)...
echo.
call npm run build

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao preparar o sistema.
    echo Entre em contato com o suporte tecnico.
    pause
    exit /b 1
)

echo [OK] Sistema preparado com sucesso!
echo.

:: ─── Criar atalho na Área de Trabalho ───────────────────────────────────────
echo Criando atalho na Area de Trabalho...

SET "INICIAR=%~dp02-iniciar-oficina.bat"
SET "ATALHO=%USERPROFILE%\Desktop\Iniciar Oficina.bat"

:: Copia o arquivo .bat de inicialização para a área de trabalho
copy "%INICIAR%" "%ATALHO%" >nul 2>nul

IF EXIST "%ATALHO%" (
    echo [OK] Atalho criado na Area de Trabalho: "Iniciar Oficina.bat"
) ELSE (
    echo [AVISO] Nao foi possivel criar atalho automaticamente.
    echo         Use o arquivo "2-iniciar-oficina.bat" para abrir o sistema.
)

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║   INSTALAÇÃO CONCLUÍDA COM SUCESSO!                  ║
echo ║                                                      ║
echo ║   Para abrir o sistema, use o atalho na             ║
echo ║   Area de Trabalho: "Iniciar Oficina.bat"           ║
echo ║   ou execute: 2-iniciar-oficina.bat                 ║
echo ╚══════════════════════════════════════════════════════╝
echo.
pause
