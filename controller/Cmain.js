const axios = require("axios");
const models = require("../models/index");
exports.main = (req, res) => {
  res.render("index");
};

exports.ppdb = async (req, res) => {
  let map = new Map();
  for(let i=1 ; i<18000 ; i += 1000) {
    console.log('----------------------------', i);
    await axios({
      method : 'GET',
      url : `http://openapi.seoul.go.kr:8088/466354715470617039364d6b517341/json/GetParkingInfo/${i}/${i + 999}/`,
    }).then((response)=> {
      const data = response.data.GetParkingInfo.row;
      data.forEach(idx => {
        const code = Number(idx.PARKING_CODE);
        if(code === 0) return;

        const obj = {
          name : idx.PARKING_NAME,
          address : idx.ADDR,
          type : idx.PARKING_TYPE_NM,
          tel : idx.TEL,
          questatus : Number(idx.QUE_STATUS),
          capacity : idx.CAPACITY,
          currentparking : idx.CUR_PARKING,
          payyn : idx.PAY_YN,
          lat : idx.LAT,
          lng : idx.LNG,
          curparkingtime : idx.CUR_PARKING_TIME,
          weekday_begin : idx.WEEKDAY_BEGIN_TIME,
          weekday_end : idx.WEEKDAY_END_TIME,
          weekend_begin : idx.WEEKEND_BEGIN_TIME,
          weekend_end : idx.WEEKEND_END_TIME,
          holiday_begin : idx.HOLIDAY_BEGIN_TIME,
          holiday_end : idx.HOLIDAY_END_TIME,
          rates : idx.RATES,
          timerate : idx.TIME_RATE,
          addrates : idx.ADD_RATES,
          addtimerate : idx.ADD_TIME_RATE,
          monthfulltime : Number(idx.FULLTIME_MONTHLY),
          daymax : idx.DAY_MAXIMUM,
        }

        if(map.has(code)) {
          const beforeCapacity = map.get(code).capacity;
          obj.capacity = beforeCapacity + 1;
          map.set(code, obj);
        } else {
          map.set(code, obj);
        }
      });
    });
  }
  console.log(map.size);
  for(let [key, value] of map) {
    models.PublicParking.create({
      code : key,
      name : value.name,
      address : value.address,
      type : value.type,
      tel : value.type,
      questatus : value.questatus,
      capacity : value.capacity,
      currentparking : value.currentparking,
      payyn : value.payyn,
      lat : value.lat,
      lng : value.lng,
      curparkingtime : value.curparkingtime,
      operationtime : {
        weekday_begin : value.weekday_begin,
        weekday_end : value.weekday_end,
        weekend_begin : value.weekend_begin,
        weekend_end : value.weekend_end,
        holiday_begin : value.holiday_begin,
        holiday_end : value.holiday_end,
      },
      price : {
        rates : value.rates,
        timerate : value.timerate,
        addrates : value.addrates,
        addtimerate : value.addtimerate,
        monthfulltime : value.monthfulltime,
        daymax : value.daymax,
      },
    }, {
      include : [models.OperationTime, models.Price],
    });
  }
};