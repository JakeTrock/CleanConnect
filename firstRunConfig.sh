env SERVERNAME="cleanconnect.com"
env USERNAME="hokuco"
env PROGNAME="cleanconnect"
env PORT="5000"
#enter dir
cd ~
#install everything
#https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-on-ubuntu-16-04
sudo apt install -y git mongodb node npm postfix nginx python-certbot-nginx
#https://libre-software.net/ubuntu-automatic-updates/
#pull code
git clone git://github.com/$USERNAME/$PROGNAME.git $PROGNAME
#config certs
sudo certbot --nginx -d $SERVERNAME
sudo certbot renew --dry-run
#allow webtraffic
#sudo ufw allow 80 #not secure
sudo ufw allow 443
sudo ufw allow Postfix
#mongodb config
systemctl enable mongod.service
#nodejs config
cd backend && sudo npm install && cd ..
cd frontend && sudo npm install && cd ..
#config postfix
#unfinished-fix letsencrypt too
# echo "
# smtpd_banner = $myhostname ESMTP $mail_name (Ubuntu)
# biff = no

# # appending .domain is the MUA's job.
# append_dot_mydomain = no

# readme_directory = no

# # See http://www.postfix.org/COMPATIBILITY_README.html -- default to 2 on
# # fresh installs.
# compatibility_level = 2

# # TLS parameters
# smtpd_tls_cert_file = /etc/letsencrypt/live/$SERVERNAME/fullchain.pem
# smtpd_tls_key_file = /etc/letsencrypt/live/$SERVERNAME/privkey.pem
# smtp_tls_cert_file = /etc/letsencrypt/live/$SERVERNAME/fullchain.pem
# smtp_tls_key_file = /etc/letsencrypt/live/$SERVERNAME/privkey.pem
# smtpd_use_tls=yes
# smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
# smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache


# smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
# myhostname = ip-172-31-18-210.us-east-2.compute.internal
# alias_maps = hash:/etc/aliases
# alias_database = hash:/etc/aliases
# myorigin = /etc/mailname
# mydestination = $myhostname, localhost.$SERVERNAME, localhost
# relayhost = [smtp.$SERVERNAME]:587
# mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
# mailbox_size_limit = 0
# recipient_delimiter = +
# inet_interfaces = loopback-only
# inet_protocols = all
# home_mailbox = Maildir/
# virtual_alias_maps = hash:/etc/postfix/virtual
# ">/etc/postfix/main.cf
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