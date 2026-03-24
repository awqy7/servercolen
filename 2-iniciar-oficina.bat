@echo off
echo =========================================
echo    BEM VINDO AO SISTEMA DA OFICINA
echo =========================================
echo.
echo O sistema esta rodando em segundo plano.
echo Nao feche esta janela preta enquanto estiver trabalhando!
echo.
echo Abrindo o navegador para iniciar os trabalhos...
echo.

:: Espera 3 segundos para o servidor ligar
timeout /t 3 /nobreak > nul

:: Abre o navegador padrão no localhost:3000
start http://localhost:3000

:: Inicia o servidor do Next.js (esse comando trava a tela preta aberta)
call npm run start
