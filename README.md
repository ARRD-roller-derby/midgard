# Construire l'image
docker build -t midgard .

# Exécuter le conteneur
docker run -d --restart always --name midgard --env-file .env

# Stop 
docker stop midgard
