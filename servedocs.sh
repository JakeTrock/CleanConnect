git checkout master;
git fetch origin
git reset --hard origin/master
git pull;
git status;
cd backend && npm i && cd ..
cd frontend && npm i && cd ..
pm2 start ecosystem.config.js --watch
