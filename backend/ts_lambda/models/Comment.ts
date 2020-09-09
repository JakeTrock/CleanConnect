import * as Sequelize from "sequelize";
import sequelize from '../config/db';
import { get, rmImageDelete, mark } from '../funcs/Comment';
import cuss from 'cuss';

class Comment extends Sequelize.Model {
  public id!: string;
  public markedForDeletion?: boolean;
  public ip?: string;
  public tag!: string;
  public img?: string;
  public text!: string;
  public sev!: number;
  public removedAt?: Date;
  public static get = get;
  public static rmImageDelete = rmImageDelete;
  public static mark = mark;
}

Comment.init({
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  tag: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  img: {
    type: Sequelize.STRING
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'text can\'t be empty' },
      isClean(value) {
        if (value.toLowerCase().split(" ").some((r) => cuss[r] == 2)) throw new Error("You'll have to clean up your language before we clean up this room.");
      }
    },
  },
  sev: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'severity can\'t be empty' },
      min: 0,
      max: 2
    },
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
  },
}, {
  tableName: "Comment",
  timestamps: true,
  sequelize
});

export default Comment;