const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("parkingpay", {
    // 컬럼 정의
    rates: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    timerate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shareid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payamount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
  });
};

module.exports = Model;
