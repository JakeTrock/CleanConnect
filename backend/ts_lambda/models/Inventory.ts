import * as Sequelize from "sequelize";
import sequelize from '../config/db';
import Item from "./Item";
import { get, getall, newInv, change, removal, purge } from '../funcs/Inventory';

class Inventory extends Sequelize.Model {
  public id!: string;
  public qrcode!: string;
  public status!: number;
  public items?: Item[];
  public name!: string;
  public user!: string;
  public static get = get;
  public static getall = getall;
  public static newInv = newInv;
  public static change = change;
  public static removal = removal;
  public static purge = purge;
}

Inventory.init({
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  user: {
    type: Sequelize.UUID,
    allowNull: false
  },
  qrcode: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'name can\'t be empty' }
    },
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 2
    },
  },
  items: {
    type: Sequelize.VIRTUAL,
    get: () => Item.findAll({
      // @ts-ignore
      where: { inventory: this.get('id') }
    })
  }
}, {
  tableName: "Inventory",
  timestamps: true,
  sequelize
});

// Inventory.hasMany(Item, {
//   sourceKey: "id",
//   foreignKey: "inventory",
//   as: "items",
// });

// Item.belongsTo(Inventory, { targetKey: "id" });
// Inventory.hasOne(Item, { sourceKey: "id" });


export default Inventory;