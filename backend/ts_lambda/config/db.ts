import { Sequelize } from 'sequelize';

export default new Sequelize(process.env.dbName, process.env.dbUser, process.env.dbPass, {
  host: process.env.dbHost,
  dialect: 'postgres',
});