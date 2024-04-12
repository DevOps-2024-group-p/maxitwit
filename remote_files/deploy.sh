source ~/.bashrc

cd /vagrant/remote_files

docker compose -f compose.yaml pull
docker stack deploy --compose-file compose.yaml app