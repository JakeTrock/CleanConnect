env SERVERNAME="cleanconnect.com"
env USERNAME="hokuco"
env PROGNAME="cleanconnect"
env PORT="5000"
#enter dir
cd ~
#install everything
sudo apt install -y git mongodb node npm postfix nginx gksu wget unattended-upgrades
#pull code

git clone git://github.com/$USERNAME/$PROGNAME.git $PROGNAME
#config certs
# sudo certbot --nginx -d $SERVERNAME
# sudo certbot renew --dry-run
#https://mailinabox.email/
curl -s https://mailinabox.email/setup.sh | sudo bash

#mongodb config
systemctl enable mongod.service
#nodejs config
cd backend && sudo npm install && cd ..
cd frontend && sudo npm install && cd ..
npm i nodemon mocha -g
#https://constituteweb.com/nodejs-with-reactjs


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
ExecStart=/usr/bin/bash ~/$PROGNAME/init.sh
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
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##
        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;
        server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

        gzip on;

        # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        ##
        # Virtual Host Configs
        ##

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}
">/etc/nginx/nginx.conf
sudo service nginx reload
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
#allow webtraffic
#sudo ufw allow 80 #not secure
sudo ufw allow 443