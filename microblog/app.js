var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');//引入日志中间件,可以查看项目的日志信息
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//引入express-partials
var partials = require('express-partials');
//因为4.x中的flash不再和express捆绑在一起了，所以必须单独安装，再引入进来
var flash = require('connect-flash');
//因为4.x中的session不再和express捆绑在一起了，所以必须单独安装，再引入进来
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');

var fs = require('fs');
/*var morgan = require('morgan');//引入morgan作为日志中间件*/
var accessLogfile = fs.createWriteStream('access.log',{flags:'a'});
var errorLogfile = fs.createWriteStream('error.log',{flags:'a'});


var index = require('./routes/index');
var user = require('./routes/user');
var post = require('./routes/post');
var reg = require('./routes/reg');
var doReg = require('./routes/doReg');
var login = require('./routes/login');
var doLogin = require('./routes/doLogin');
var logout = require('./routes/logout');




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());//使用partials

//使用访问日志
app.use(logger({stream:accessLogfile}));
/*app.use(morgan('combined',{stream:accessLogfile}));//运用中间件，“combined”是日志显示的格式。*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//将会话信息保存到数据库中，以免丢失
app.use(session({
    secret:settings.cookieSecret,
    store:new MongoStore({
        db:settings.db,
        url: 'mongodb://localhost/microblog'
    })
}));
app.use(flash());

//创建视图助手
app.use(function(req,res,next){
    console.log("app.usr local");
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;
    var error = req.flash ('error');
    res.locals.error = error.length ? error : null;

    var success = req.flash('success');
    res.locals.success = success.length ? success : null;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));



app.use('/', index);
app.use('/u/:user',user);
app.use('/post',post);
app.use('/reg',reg);
app.use('/reg',doReg);
app.use('/login',login);
app.use('/login',doLogin);
app.use('/logout',logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
