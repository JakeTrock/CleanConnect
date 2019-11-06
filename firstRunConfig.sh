env SERVERNAME="cleanconnect.com"
env USERNAME="hokuco"
env PROGNAME="cleanconnect"
env PORT="5000"
#enter dir
cd ~
#install everything
sudo apt install -y git mongodb node npm postfix nginx python-certbot-nginx
#pull code
git clone git://github.com/$USERNAME/$PROGNAME.git $PROGNAME
#config certs
sudo certbot --nginx -d $SERVERNAME
sudo certbot renew --dry-run
#allow webtraffic
#sudo ufw allow 80 #not secure
sudo ufw allow 443
#mongodb config
systemctl enable mongod.service
#nodejs config
cd backend && sudo npm install && cd ..
cd frontend && sudo npm install && cd ..
#create systemd init service
sudo systemctl create $PROGNAME
touch /lib/systemd/system/$PROGNAME.service && echo "
[Unit]
Description=service made by $USERNAME
Documentation=git://github.com/$USERNAME/$PROGNAME
After=network.target

[Service]
Environment=NODE_PORT=$PORT
Type=simple
User=ubuntu
ExecStart=/usr/bin/node /home/ubuntu/$PROGNAME/index-unifying.js
Restart=on-failure
WorkingDirectory=/home/ubuntu/$PROGNAME
[Install]
WantedBy=multi-user.target
">/lib/systemd/system/$PROGNAME.service
sudo systemctl daemon-reload
sudo systemctl start $PROGNAME
sudo systemctl status $PROGNAME
sudo systemctl enable $PROGNAME
#configure server proxy
echo "
server {
#        listen 80 default_server;
#        listen [::]:80 default_server;
         listen 443 ssl default_server;
         listen [::]:443 ssl default_server;
        server_name $SERVERNAME;
#         ssl_certificate /etc/letsencrypt/live/$SERVERNAME/fullchain.pem;
#         ssl_certificate_key /etc/letsencrypt/live/$SERVERNAME/privkey.pem;
        location / {
                proxy_pass http://localhost:$PORT/;
#                 proxy_ssl_trusted_certificate /etc/letsencrypt/live/$SERVERNAME/fullchain.pem;
#                 proxy_ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        }
}
">/etc/nginx/sites-available/default
sudo nano /etc/nginx/sites-available/default
sudo service nginx restart