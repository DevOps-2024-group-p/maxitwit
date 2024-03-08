source ~/.bash_profile

cd /maxitwit/remote_files

docker compose -f compose.yml pull
docker compose -f compose.yml up -d