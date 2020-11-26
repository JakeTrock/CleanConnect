import * as Sequelize from "sequelize";
import sequelize from '../config/db';
import Comment from "./Comment";
import { get, getall, newTag, change, removal, purge } from '../funcs/Tag';

class Tag extends Sequelize.Model {
  public id!: string;
  public qrcode!: string;
  public comments?: Comment[];
  public name!: string;
  public user!: string;
  public static get = get;
  public static getall = getall;
  public static newTag = newTag;
  public static change = change;
  public static removal = removal;
  public static purge = purge;
}

Tag.init({
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
    type: Sequelize.STRING,
    defaultValue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg==",
  },
  comments: {
    type: Sequelize.VIRTUAL,
    get: () => Comment.findAll({
      where: { tag: this.id }
    })
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'name can\'t be empty' },
      len: [4, 100],
    },
  }
}, {
  tableName: "Tag",
  timestamps: true,
  sequelize
});

// Tag.hasMany(Comment, {
//   sourceKey: "id",
//   foreignKey: "tag",
//   as: "comments", // this determines the name in `associations`!
// });

// Comment.belongsTo(Tag, { targetKey: "id" });
// Tag.hasOne(Comment, { sourceKey: "id" });

export default Tag;