

exports.resultToObject = (result) => {

    let obj = new Object();

    for (const [key, value] of Object.entries(result.dataValues)) {
        // console.log('key', key);
        // console.log('value', value);
        obj[`${key}`] = value;
    }

    return obj;
}

exports.resultToObjectArray = (result) => {
    let objArray = [];

    return objArray;
}