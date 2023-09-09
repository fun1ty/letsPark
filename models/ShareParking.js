const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    return  sequelize.define("shareparking", {
        //컬럼 정의
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, //NOT NULL
            primaryKey: true,
            autoIncrement: true,
        },
        shareparkname : {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        address : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        price : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        lat : {
            type : DataTypes.DOUBLE,
            allowNull : false,
        },
        lng : {
            type : DataTypes.DOUBLE,
            allowNull : false,
        },
        location : {
            type : DataTypes.STRING(300),
            allowNull : false,
        },
        status : {
            type : DataTypes.CHAR(1),
            allowNull : false,
            default : 'Y',
        }
    });
};


module.exports = Model;
