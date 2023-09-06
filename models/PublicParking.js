const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    return  sequelize.define("publicparking", {
        //컬럼 정의
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, //NOT NULL
            primaryKey: true,
            autoIncrement: true,
        },
        code : {
          type : DataTypes.INTEGER,
            allowNull : false,
        },
        name : {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        address : {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        type : {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        tel : {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        questatus : {
          type : DataTypes.INTEGER,
          allowNull : false,
        },
        capacity : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currentparking : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        payyn : {
            type: DataTypes.CHAR(1),
            allowNull: false,
        },
        lat : {
            type : DataTypes.DOUBLE,
            allowNull : false,
        },
        lng : {
            type : DataTypes.DOUBLE,
            allowNull : false,
        },
        curparkingtime : {
            type : DataTypes.STRING(50),
            allowNull : false,
        },
    });

};


module.exports = Model;
