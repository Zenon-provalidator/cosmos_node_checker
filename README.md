# cosmos_node_checker

npm install

npm install -g pm2

pm2 start main.js --name=cosmos_node_checker

pm2 stop cosmos_node_checker

pm2 delete cosmos_node_checker

tail -f ~/.pm2/logs/cosmos-node-checker-error.log
