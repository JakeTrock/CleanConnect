ssh -i "UKP.pem" ubuntu@ec2-3-20-85-15.us-east-2.compute.amazonaws.com 'cd && cd noderoot/CleanConnect/ && git pull https://hokuco:Miweb1Hi@github.com/hokuco/CleanConnect.git && pm2 restart ecosystem.config.js --watch && exit'
 
