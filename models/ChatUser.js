const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("chatuser", {
    //컬럼 정의
    roomid: {
      type: DataTypes.INTEGER,
      allowNull: false, //NOT NULL
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joinuser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joinusernick: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
  });
};

module.exports = Model;
