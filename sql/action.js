const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  pool: {
      max: 5,
      min: 0,
      idle: 30000
  }
});

var Api = sequelize.define('api', {
  id: {
      type: Sequelize.STRING(50),
      primaryKey: true
  },
  path: Sequelize.STRING(100),
  apiContent: Sequelize.TEXT,
  createdAt: Sequelize.BIGINT,
  updatedAt: Sequelize.BIGINT
}, {
      timestamps: false
  });

 const Action = {

    // params: {
    //   id: 'd-' + now,
    //   path: '/www/test',
    //   createdAt: now,
    //   updatedAt: now,
    //   apiContent: ''
    // }
    // ？？ 数据库可不可以自己自增id或者创建时间
    add: async (params) => {
      var now = Date.now();
      var item = await Api.create(params);
      console.log('created: sql item');
    },

    // params: {
    //     where: {
    //       name: 'Gaffey'
    //   }
    // }
    findOne: async (params) => {
      const apis = await Api.findOne(params);
      console.log(`find api: ${apis}`);
      return apis;
    },

    max: async (param, url) => {
      const api = await Api.max(param, { where: { path: url }});
      return api;
    },
    /** 
     * api: 查询到的实例
     * valueObject: 要更新的api属性的集合对象
     */
    update: async (api, valueObject) => {
      api = { ...api, ...valueObject }
      await api.save();
    },

    /** 
     * api: 查询到的实例
     */
    del: async (api) => {
      await p.destroy();
    },
    getListByAttr: async (name) => {
      let list = await Api.all();
      list = list.map(item => item.getDataValue(name));
      return [... new Set(list)];
    },
    getListOfVersion: async (attr, params) => {
      let list = await Api.findAll(params);
      list = list.map(item => item.getDataValue(attr));
      return [... new Set(list)];
    }
  }
  module.exports = Action;