var express = require('express');
var router = express.Router();
var crypto = require('crypto');//使用密码加密功能
var User = require('../models/user');//引入用户对象
var Post = require('../models/post');//引入发表评论对象

/* GET home page. */
router.get('/', function(req, res) {
  /*res.render('index', {
      title: '首页'
  });*/
  Post.get(null,function(err,posts){
    if(err){
        posts = [];
    }
    res.render('index',{
        title:'首页',
        posts:posts
    });
  });
});
router.get('/reg',checkNotLogin);
router.get('/reg',function (req,res) {
    res.render('reg',{
      title:'用户注册'
    })
});
router.post('/reg',checkNotLogin);
// /reg的post响应函数
router.post('/reg',function(req,res){
  //检查用户两次输入的口令是否一致
    if(req.body['password-repeat'] != req.body['password']){//用req.body获取post过来的值
      req.flash('error','两次输入的口令不一致');
      return res.redirect('/reg');//路由重定向
    }
    //生成口号的散列值
    var md5  = crypto.createHash('md5');
    //crypto 是 Node.js 的一个核心模块，功能是加密并生成各种散列，使用它之前首先
    //要声明 var crypto = require('crypto')。我们代码中使用它计算了密码的散
    //列值。
    var password = md5.update(req.body.password).digest('base64');//?
    var newUser = new User({
        name:req.body.username,
        password:password
    });
    //检查用户是否已经存在
    //搞不懂
    //User.get是通过用户名称来获取已知用户
    User.get(newUser.name,function (err,user) {
        if(user)
          err = 'Username is already exists,';
        if(err){
          req.flash('error',err);
            //req.flash 是 Express 提供的一个奇妙的工具，通过它保存的变量只会在用户当前
            // 和下一次的请求中被访问，之后会被清除，通过它我们可以很方便地实现页面的通知
            // 和错误信息显示功能。
          return res.redirect('/reg');
        }
        //如果不存在则新增用户
        //将用户对象的修改写入数据库
        newUser.save(function(err){
          if(err){
            req.flash('error',err);
            return res.redirect('/reg');
          }
          req.session.user = newUser;//向会话对象写入当前用户的信息。在后面我们会通过它判断用户是否已经存在。
          req.flash('success','注册成功');
          res.redirect('/');
        })
    })
});
router.get('/login',checkNotLogin);
//登入和登出
router.get('/login',function(req,res){
    res.render('login',{
        title:'用户登入'
    });
});
router.post('/login',checkNotLogin);
router.post('/login',function(req,res){
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username,function(err,user){
        if(!user){
            req.flash('error','用户不存在');
            return res.redirect('/login');
        }
        if(user.password != password){
            req.flash('error','用户口令错误');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success','登入成功');
        res.redirect('/');
    });
});
router.get('/logout',checkLogin);
router.get('/logout',function(req,res){
    req.session.user = null;
    req.flash('success','登出成功');
    res.redirect('/');
});


//用户权限管理
function checkLogin(req,res,next){
    if(!req.session.user){
        req.flash('error','未登入');
        return res.redirect('/login');
    }
    next();
}
function checkNotLogin(req,res,next){
    if(req.session.user){
        req.flash('error','已登录');
        return res.redirect('/');
    }
    next();
}

//发表微博
router.post('/post',checkLogin);
router.post('/post',function(req,res){
    var currentUser = req.session.user;
    var post = new Post(currentUser.name,req.body.post);
    post.save(function(err){
        if(err){
            req.flash('err',err);
            return res.redirect('/');
        }
        req.flash('succrss','发表成功');
        res.redirect('/u/'+currentUser.name);
    });
});


//用户页面
router.get('/u/:user',function(req,res){
    User.get(req.params.user,function(err,user){
        if(!user){
            req.flash('error','用户名不存在');
            return res.redirect('/');
        }
        Post.get(user.name,function(err,posts){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('user',{
                title:user.name,
                posts:posts
            });
        });
    });
});

module.exports = router;
