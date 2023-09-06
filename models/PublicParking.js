const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    const PublicParking =  sequelize.define("publicparking", {
        //컬럼 정의
        id: {
            type: DataTypes.INTEGER,
            allowNull: false, //NOT NULL
            primaryKey: true,
            autoIncrement: true,
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
            allowNull: false,
        },
        capacity : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        questatus : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        payyn : {
            type: DataTypes.CHAR(1),
            allowNull: false,
        },
    });
    PublicParking.associate = models => {
        PublicParking.hasOne(models.OperationTime, {foreignKey : 'publicparking_id', sourceKey : 'id'});
    };

    return PublicParking;
};


module.exports = Model;
