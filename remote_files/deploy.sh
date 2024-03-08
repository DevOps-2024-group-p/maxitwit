source ~/.bash_profile

cd /maxitwit/remote_files

docker compose -f compose.yaml pull
docker compose -f compose.yaml up -d