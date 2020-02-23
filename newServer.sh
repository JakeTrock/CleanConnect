sudo apt update && sudo apt upgrade -y && sudo apt install nginx nodejs npm git mongodb -y
mkdir noderoot/
git clone https://jaketrock:Miweb1Hi@github.com/hokuco/CleanConnect.git
cd CleanConnect/
cd backend
npm i
cd ..
npm i
sudo npm install -g serve
sudo ufw allow 443
sudo touch /lib/systemd/system/ccserve.service
sudo su
echo "
[Unit]
Description=janitorial coordination service
Documentation=git://github.com/hokuco/CleanConnect
After=network.target

[Service]
Type=simple
User=autotask
ExecStart=/usr/bin/npm run prod
Restart=on-failure
WorkingDirectory=/home/autotask/noderoot/CleanConnect
[Install]
WantedBy=multi-user.target
">/lib/systemd/system/ccserve.service
exit
sudo systemctl daemon-reload
sudo systemctl start ccserve
sudo systemctl status ccserve
sudo systemctl enable ccserve
sudo nano /etc/nginx/sites-available/default
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot python-certbot-nginx
sudo certbot --nginx
sudo certbot renew --dry-run
