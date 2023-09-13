const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("chatroom", {
    //컬럼 정의
    id: {
      type: DataTypes.INTEGER,
      allowNull: false, //NOT NULL
      primaryKey: true,
      autoIncrement: true,
    },
    roomname: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    shareparkname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  });
};

module.exports = Model;
