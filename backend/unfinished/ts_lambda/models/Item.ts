import * as Sequelize from "sequelize";
import sequelize from '../config/db';
import { get, change, mark } from '../funcs/Item';

class Item extends Sequelize.Model {
  public id!: string;
  public markedForDeletion!: boolean;
  public name!: string;
  public inventory!: string;
  public minQuant!: number;
  public maxQuant!: number;
  public curQuant!: number;
  public ip?: string;
  public static get = get;
  public static change = change;
  public static mark = mark;
}

Item.init({
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  inventory: {
    type: Sequelize.UUID,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'name can\'t be empty' }
    },
  },
  maxQuant: {
    type: Sequelize.INTEGER,
    validate: {
      min: 0
    }
  },
  minQuant: {
    type: Sequelize.INTEGER,
    validate: {
      min: 0
    }
  },
  curQuant: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  markedForDeletion: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  removedAt: {
    type: Sequelize.DATE
  },
  ip: {
    type: Sequelize.STRING,
    validate: {
      isIP: true
    }
  }
}, {
  tableName: "Item",
  timestamps: true,
  sequelize
});

export default Item;