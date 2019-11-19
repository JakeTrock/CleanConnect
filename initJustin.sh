
#sudo systemctl start mongod &  PIDIOS=$!
mongod &  PIDIOS=$!
npm run dev &  PIDMIX=$!
wait $PIDIOS
wait $PIDMIX
