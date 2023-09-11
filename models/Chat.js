const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("chat", {
    //컬럼 정의
    id: {
      type: DataTypes.INTEGER,
      allowNull: false, //NOT NULL
      primaryKey: true,
      autoIncrement: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CONTENT: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    FILE: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  });
};

module.exports = Model;
