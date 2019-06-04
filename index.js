
const sqlActions = require('./sql/action');

// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// 跨域请求
var cors = require('koa2-cors');
app.use(cors({
  origin: function(ctx) {
    // if (ctx.url === '/test') {
    //   return false;
    // }
    return '*';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

const static = require("koa-static");
app.use(static(__dirname+ "/static/html",{ extensions: ['html']}))

// log request URL:
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// 解析post请求的body内容，并赋值到ctx.request.body
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// 导入controller middleware:
const controller = require('./controllers/index');
app.use(controller());

// 开启已有url的监控
const server = require('./controllers/server/index');
server.initRun()

// 在端口3000监听:
app.listen(3002);
console.log('app started at port 3002...');

