const serverData = require('./serverData');
const sqlActions = require('../../sql/action');
// let latestJson = '';

// 对比最新的接口数据和数据库存储的最新数据，有变化继续存入数据库，无变化继续轮询。


async function updateDatebase(curjson, latestJson, url) {
  if (!curjson) {
    console.log('未搜索到数据')
    return;
  }
  if (!latestJson) {
    await serverData.setJsonToDatabase(curjson, url);
    latestJson = curjson;
    console.log('存入第一条数据')
    return;
  }
  // latestJson.apiContent = latestJson.apiContent.replace(/�/g, '');
  // curjson = curjson.replace(/�/g, '');

  if (latestJson === curjson) {
    console.log('数据未变化')
    return;
  } else {
    await serverData.setJsonToDatabase(curjson, url);
    latestJson = curjson;
    console.log('存入一条数据');
  }
}
const diffOnce = async (url) => {
  const latestJson = await serverData.getLastJsonFromDatabase(url);
  const curjson = await serverData.getJsonFromSwagger(url);
  await updateDatebase(curjson, latestJson ? latestJson.apiContent.toString() : '', url);
}

const monitorApi = async (url) => {
  // //数据存入数据库前后有变化，直接存储最后一条数据，不去数据库取。
  const setIntervalId = setInterval(async () => {
    diffOnce(url)
  }, 3600000);
};

module.exports = {
  diffOnce,
  initRun: async () => {
    const rs = await sqlActions.getListByAttr('path');
    console.log(rs);
    if(rs && rs.length) {
      rs.forEach(url => monitorApi(url))
    }
  }
};
