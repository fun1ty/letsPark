const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
    const OperationTime = sequelize.define("operationtime", {
        //컬럼 정의
       weekday_begin : {
           type : DataTypes.STRING(50),
           allowNull : true,
       },
       weekday_end : {
           type : DataTypes.STRING(50),
           allowNull : true,
       },
       weekend_begin : {
           type : DataTypes.STRING(50),
           allowNull : true,
       },
       weekend_end : {
           type : DataTypes.STRING(50),
           allowNull : true,
       },
       holiday_begin : {
           type : DataTypes.STRING(50),
           allowNull : true,
       },
       holiday_end : {
           type : DataTypes.STRING(50),
           allowNull : true,
       },

    });

    OperationTime.assosiate = models => {
        OperationTime.belongsTo(models.PublicParking, {foreignKey : 'publicparking_id', sourceKey : 'id'});
    };
    return OperationTime;
};

module.exports = Model;
