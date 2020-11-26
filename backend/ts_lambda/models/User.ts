import * as Sequelize from "sequelize";
import sequelize from '../config/db';
import * as crypto from 'crypto';
import Tag from "./Tag";
import Inventory from "./Inventory";
import { get, login, changeInfo, changePass, newUsr, purge } from '../funcs/User';

class User extends Sequelize.Model {
  public id!: string;
  public dashUrl!: string;
  public dashCode!: string;
  public tags?: Tag[];
  public invs?: Inventory[];
  public isVerified?: boolean;
  public tier!: number;
  public password!: string;
  public custID!: string;
  public PayToken!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public static get = get;
  public static login = login;
  public static changeInfo = changeInfo;
  public static changePass = changePass;
  public static newUsr = newUsr;
  public static purge = purge;
}



User.init({
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'name can\'t be empty' },
      len: [6, 100],
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide valid e-mail address' }
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dashurl: {
    type: Sequelize.STRING,
    defaultValue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg==",
  },
  dashcode: {
    type: Sequelize.STRING,
    defaultValue: crypto.randomBytes(16).toString("hex").substring(8),
  },
  payToken: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'payment token can\'t be empty' },
    },
  },
  custID: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer ID can\'t be empty' },
    },
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone can\'t be empty' },
      is: /^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/
    },
  },
  tags: {
    type: Sequelize.VIRTUAL,
    get: () => Tag.findAll({
      // @ts-ignore
      where: { user: this.get('id') }
    })
  },
  invs: {
    type: Sequelize.VIRTUAL,
    get: () => Inventory.findAll({
      // @ts-ignore
      where: { user: this.get('id') }
    })
  },
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  tier: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 2
    },
  }
}, {
  tableName: "User",
  timestamps: true,
  sequelize
});

// User.hasMany(Tag, {
//   sourceKey: "id",
//   foreignKey: "user",
//   as: "tags",
// });

// Tag.belongsTo(User, { targetKey: "id" });
// User.hasOne(Tag, { sourceKey: "id" });

// User.hasMany(Inventory, {
//   sourceKey: "id",
//   foreignKey: "user",
//   as: "invs",
// });

// Inventory.belongsTo(User, { targetKey: "id" });
// User.hasOne(Inventory, { sourceKey: "id" });

export default User;