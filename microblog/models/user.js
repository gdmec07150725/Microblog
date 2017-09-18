//用户模型.主要是数据库操作
var mongodb = require('./db');
function User(user){
    this.name = user.name;
    this.password = user.password;
}
module.exports = User;

User.prototype.save = function save(callback){
    //存入mongodb文档
     var user = {
         name:this.name,
         password:this.password
     };
    mongodb.open(function(err,db){//mongodb.open表示打开数据库
        if(err){
            return callback(err);
        }
        //读取user集合
        db.collection('users',function(err,collection){//db.collection表示查看users表
            if(err){
                mongodb.close();
                return callback(err);
            }
            //为name属性添加索引
            collection.ensureIndex('name',{unique:true});
            //将数据写入users文档
            collection.insert(user,{safe:true},function(err,user){
                mongodb.close();
                callback(err,user);
            });
        });
    });
};

User.get = function get(username,callback){
    mongodb.open (function(err,db){
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找name属性为username的文档
            collection.findOne({name:username},function(err,doc){
                mongodb.close();
                if(doc){
                    //如果用户已经存在,封装文档为user对象,然后返回
                    var user = new User(doc);
                    callback(err,user);
                }else{
                    callback(err,null);
                }
            });
        });
    });
};