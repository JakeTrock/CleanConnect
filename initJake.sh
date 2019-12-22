
sudo systemctl start mongodb &  PIDIOS=$!
#mongod &  PIDIOS=$!
npm run dev &  PIDMIX=$!
wait $PIDIOS
wait $PIDMIX
