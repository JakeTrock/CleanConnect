import * as Sequelize from "sequelize";
import sequelize from '../config/db';
import { get, createIndex, confirm } from '../funcs/UserIndex';

class UserIndex extends Sequelize.Model {
  public id!: string;
  public token!: string;
  public isCritical!: boolean;
  public email!: string;
  public userID?: string;
  public static get = get;
  public static createIndex = createIndex;
  public static confirm = confirm;
}

UserIndex.init({
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  userID: {
    type: Sequelize.UUID,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide valid e-mail address' }
    }
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isCritical: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
}, {
  tableName: "UserIndex",
  timestamps: true,
  sequelize
});

export default UserIndex;