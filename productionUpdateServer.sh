cd frontend
npm run build
git add build
git commit -m "add new client build"
git push https://hokuco:Miweb1Hi@github.com/hokuco/CleanConnect.git
cd ..

ssh -i "UKP.pem" ubuntu@ec2-3-20-85-15.us-east-2.compute.amazonaws.com 'cd && cd noderoot/CleanConnect/ && git checkout master && git fetch https://hokuco:Miweb1Hi@github.com/hokuco/CleanConnect.git && git reset --hard origin/master && git pull https://hokuco:Miweb1Hi@github.com/hokuco/CleanConnect.git && git status && pm2 restart ecosystem.config.js && exit'
