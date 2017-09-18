var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('reg',{title:'哈哈'});
});

module.exports = router;
