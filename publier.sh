git add .
sleep 1
clear
git commit -m "Amélioration version x"
sleep 1
clear
git push
sleep 1
clear
echo "Publication de la version x terminée avec succès !"
sleep 2
clear

echo "Démarrage de l'application sur Android..."
sleep 1
clear
npx expo start --android