const http = require('http');
const sqlActions = require('../../sql/action');

module.exports = {

  async setJsonToDatabase (data, path) {
    const now = Date.now();
    const newData = {
      id: 'd-' + now,
      path: path || '',
      createdAt: now,
      updatedAt: now,
      apiContent: data
    }
    await sqlActions.add(newData);
  },

  getJsonFromSwagger: async (url) => {
    const api = new URL(url);
    const options = {
      headers: {
        'Accept': 'application/json;charset=gbk,*/*',
        'Accept-Encoding':'gbk',
        'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection':'keep-alive',
        type: 'get',
        gzip:true
      }
    }
    return new Promise((resolve, reject) => {
      const req = http.request(api, options, (res) => {
        let data = [];
        res.on('data', (chunk) => {
          console.log('响应主体:');
          data.push(chunk);
          // data += chunk.toString();
        });
        res.on('end', () => {
          data = Buffer.concat(data).toString();
          resolve(data, url)
          console.log('响应中已无数据');
        });
      });

      req.on('error', (e) => {
        reject(e);
        console.error(`请求遇到问题: ${e.message}`);
      });

      req.end();
    });
  },

  async getLastJsonFromDatabase (url) {
    let data = null;
    const maxCreatedAt = await sqlActions.max('createdAt', url);
    const params = {
      where: {
        createdAt: maxCreatedAt,
        path: url
      }
    }
    if (maxCreatedAt) {
      data = await sqlActions.findOne(params);
    }
    return data;
  },

};
