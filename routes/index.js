var express = require('express');
var router = express.Router();
const api = require('../temperature');

/* GET home page. */
router.get('/', function (req, res, next) {
        api.getData().then(data => {
           res.render('index', data);
        });
    });
module.exports = router;
