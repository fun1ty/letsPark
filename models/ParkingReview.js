const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    return sequelize.define("parkingreview", {
        //컬럼 정의
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, //NOT NULL
            primaryKey: true,
            autoIncrement: true,
        },
        type : {
            type : DataTypes.INTEGER,
            allowNull: false,
        },
        parkid : {
            type : DataTypes.INTEGER,
            allowNull: false,
        },
        nickname : {
            type : DataTypes.STRING(30),
            allowNull : false,
        },
        score : {
            type : DataTypes.DOUBLE,
            allowNull : false,
        },
        comment : {
            type : DataTypes.STRING(300),
            allowNull : false,
        },
    });
};

module.exports = Model;
