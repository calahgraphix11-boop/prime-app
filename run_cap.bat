@echo off
cd /d "C:\Users\Q\Desktop\calah.ai\calah-app"
echo === npm install @capacitor/assets ===
npm install @capacitor/assets --save-dev
echo === EXIT CODE: %ERRORLEVEL% ===
echo === npx generate ===
npx @capacitor/assets generate --android --iconBackgroundColor "#004d2e" --iconBackgroundColorDark "#004d2e" --splashBackgroundColor "#004d2e" --splashBackgroundColorDark "#004d2e"
echo === EXIT CODE: %ERRORLEVEL% ===
