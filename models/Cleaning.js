const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    return sequelize.define("cleaning", {
        //컬럼 정의
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, //NOT NULL
            primaryKey: true,
            autoIncrement: true,
        },
        price : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content : {
            type : DataTypes.STRING(500),
            allowNull : false,
        },
        enddate : {
            type : DataTypes.STRING(50),
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
