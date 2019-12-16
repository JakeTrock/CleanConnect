
#sudo systemctl start mongod &  PIDIOS=$!
mongod --dbpath ~/data/db &  PIDIOS=$!
npm run dev &  PIDMIX=$!
wait $PIDIOS
wait $PIDMIX
