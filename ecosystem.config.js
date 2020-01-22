module.exports = {
  apps : [{
    name: 'API',
    script: 'npm run prod',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: true,
    //ignore_watch: ["README.md",“node_modules”],
    max_memory_restart: '600M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      mailServer: 'smtp.ethereal.email',
        mailPort: 587,
        mailUser: 'lilian.bernhard@ethereal.email',
        mailPass: 'fCc7CKMVv1VvuvrsaR',
      url: "mongodb://localhost/CleanConnectProd",
        secretOrKey: 'c9:4b:ed:35:ed:9d'
    }
  }],

  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
