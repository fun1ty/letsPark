const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("parkingpay", {
    // 컬럼 정의

    payamount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pg: {
      type: DataTypes.JSON,
    },
  });
};

module.exports = Model;
