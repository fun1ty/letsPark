const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    return  sequelize.define("price", {
        //컬럼 정의
        rates : {
            type : DataTypes.INTEGER,
            allowNull : true,
        },
        timerate : {
            type : DataTypes.INTEGER,
            allowNull : true,
        },
        addrates : {
            type : DataTypes.INTEGER,
            allowNull : true,
        },
        addtimerate : {
            type : DataTypes.INTEGER,
            allowNull : true,
        },
        monthfulltime : {
            type : DataTypes.INTEGER,
            allowNull : true,
        },
        daymax : {
            type : DataTypes.INTEGER,
            allowNull : true,
        },
    });

};


module.exports = Model;
