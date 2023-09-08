const schedule = require('node-schedule');
const models = require('../models/index');
const axios = require('axios');
require('dotenv').config();
const env = process.env;

const updateInfoJob = schedule.scheduleJob('* 3 * * * *', async ()=> {
    console.log('---------스케줄 실행 시작---------- ');
    let map = new Map();

    const dbData = await models.PublicParking.findOne({
        attributes : ['curparkingtime'],
        where : {
            questatus : 1,
        }
    });
    let recentUpdateData;
    await axios ({
        method : 'GET',
        url : `http://openapi.seoul.go.kr:8088/${env.SEOULDATA}/json/GetParkingInfo/1/1`,
    }).then((response)=> {
        recentUpdateData = response.data.GetParkingInfo.row[0].CUR_PARKING_TIME;
    });

    if(Date.parse(recentUpdateData) > Date.parse(dbData.curparkingtime)) {
        console.log('서울 열린데이터 업데이트 사항 있음, db update');

        for(let i=1 ; i<18000 ; i+= 1000) {
            console.log('----------------------------', i);
            await axios ({
                method : 'GET',
                url : `http://openapi.seoul.go.kr:8088/${env.SEOULDATA}/json/GetParkingInfo/${i}/${i + 999}/`,
            }).then((response)=> {
                const data = response.data.GetParkingInfo.row;
                data.forEach(idx => {
                    const code = Number(idx.PARKING_CODE);
                    if(code === 0 || idx.QUE_STATUS === '0' || map.has(code)) return;

                    const obj = {
                        currentparking : idx.CUR_PARKING,
                        curparkingtime : idx.CUR_PARKING_TIME,
                    }
                    map.set(code, obj);
                });
            });
        }
        console.log('스케줄 map 사이즈', map.size);
        for(let [key, value] of map) {

            models.PublicParking.update({
                currentparking : value.currentparking,
                curparkingtime : value.curparkingtime,
            }, {
                where : {
                    code : key,
                }
            }).then((result)=> {
                // console.log(result);
            });
        }
    }
});

module.exports = updateInfoJob;