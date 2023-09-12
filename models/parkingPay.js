const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("parkingpay", {
    // 컬럼 정의

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
