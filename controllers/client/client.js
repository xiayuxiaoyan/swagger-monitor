const fs = require('fs');
const path = require('path');
const sqlActions = require('../../sql/action');
const utils = require('../../static/utils/index');
const koaBodyparser = require('koa-bodyparser');

const DIFF_HTML_PATH = 'static/diff/html';
const DIFF_JSON_PATH = 'static/diff/json';

const RESULT_TEMPLATE = {
  errCode: 0,
  errMsg: '',
  data: null
}

async function getJson({ url, version }) {
  const params = {
    where: {
      createdAt: version,
      path: url
    }
  }
 let json = await sqlActions.findOne(params);
 json = json && JSON.stringify(json.apiContent);
//  return json = json && json.apiContent;
 return json;
}

async function creatJsonFile({ url, oldVersion, newVersion }) {
  const oldJson = await getJson({ url, version: oldVersion });
  const newJson = await getJson({ url, version: newVersion });
  // fs.writeFileSync(path.join(DIFF_JSON_PATH, `./${utils.urlToFileName(url)}old.json`), oldJson);
  // fs.writeFileSync(path.join(DIFF_JSON_PATH, `./${utils.urlToFileName(url)}new.json`), newJson)
  await fs.writeFile(path.join(DIFF_JSON_PATH, `./${utils.urlToFileName(url)}old.json`), oldJson, (err) => {
    if (!!err) {
      console.log('创建json文件失败');
      throw err;
    }
  });
  await fs.writeFile(path.join(DIFF_JSON_PATH, `./${utils.urlToFileName(url)}new.json`), newJson, (err) => {
    if (!!err) {
      console.log('创建json文件失败');
      throw err;
    }
  })
}

  function getDiffHtml({ url, oldVersion, newVersion }) {
  return new Promise(async (reslove, reject) => {
    var exec = require('child_process').exec;
    if(!url || !oldVersion || !newVersion) {
      console.error('参数错误');
      return;
    }
    await creatJsonFile({ url, oldVersion, newVersion });
    const newPath = path.join(DIFF_JSON_PATH, `./${utils.urlToFileName(url)}new.json`);
    const oldpath = path.join(DIFF_JSON_PATH, `./${utils.urlToFileName(url)}old.json`);
    var exec_command = `java -jar static/utils/swagger-diff.jar  -new ${newPath} -old ${oldpath} -v 2.0  -output-mode html > ${DIFF_HTML_PATH}/${utils.urlToFileName(url)}-diff.html`;
    exec(exec_command || true, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      reslove();
      // cb();
    });
  });
}
/**·
 * query:{
 *  url: ,
 *  oldVersion: ,
 *  newVersion: ,
 * }
 */
  function handleDiff (ctx, next) {
  console.log('lala');
  const { url, oldVersion, newVersion }= ctx.query;
  // await getDiffHtml({ url, oldVersion, newVersion }, ()=> {
  //   const filePath = path.join(__dirname, `../../${DIFF_HTML_PATH}/${utils.urlToFileName(url)}-diff.html`);
  //   console.log(`filePath=${filePath}`);
  //   const html = fs.readFileSync(filePath, {encoding: 'utf8'});
  //   ctx.body = html;
  // });
  return new Promise((resolve, reject) => {
    getDiffHtml({ url, oldVersion, newVersion }).then(() => {
      const filePath = path.join(__dirname, `../../${DIFF_HTML_PATH}/${utils.urlToFileName(url)}-diff.html`);
      console.log(`filePath=${filePath}`);
      const html = fs.readFileSync(filePath, {encoding: 'utf8'});
      ctx.body = html;
      resolve();
    });
  })
  // const filePath = path.join(__dirname, `../../${DIFF_HTML_PATH}/${utils.urlToFileName(url)}-diff.html`);
  // console.log(`filePath=${filePath}`);
  // const html = fs.readFileSync(filePath, {encoding: 'utf8'});
  // ctx.body = html;
}

async function handleAddUrl (ctx, next) {
  const server = require('../server/index');
  const { url } = ctx.request.body;
  // 初始化存入一条查询记录
  const turl = url.trim()
  if(turl){
    await server.diffOnce(turl);
    ctx.response.body = { ...RESULT_TEMPLATE }

    // 开始监控此地址的文档变更
    await server.monitorApi(turl);
  }
}

async function handleGetVersionlist (ctx, next) {
  const { url } = ctx.query;
  const param = {
    where: {
      path: url
    }
  }
  const rs = await sqlActions.getListOfVersion('createdAt', param);
  ctx.body = { ...RESULT_TEMPLATE, data: rs }
  next();
}

async function handleGetUrlList (ctx, next) {
  const rs = await sqlActions.getListByAttr('path');
  ctx.body = { ...RESULT_TEMPLATE, data: rs }
  next();
}

function handleRoot(ctx, next) {
  ctx.body = { ...RESULT_TEMPLATE, data: 'hello' }
  next();
}

module.exports = {
  'GET /': handleRoot,
  'GET /diff/html': handleDiff,
  'POST /addurl': handleAddUrl,
  'GET /versionlist': handleGetVersionlist,
  'GET /urllist': handleGetUrlList,
  //'POST /signin': fn_signin
};