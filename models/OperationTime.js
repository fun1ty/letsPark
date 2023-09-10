const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    return sequelize.define("operationtime", {
        //컬럼 정의
        weekday_begin: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        weekday_end: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        weekend_begin: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        weekend_end: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        holiday_begin: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        holiday_end: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    });
};

module.exports = Model;
