var express = require('express');
var router = express.Router();
const hue = require('node-hue-api');

const sensorFriendlyNames = new Map([
        [8, 'Carport'],
        [39, 'Gavel mot relax'],
        [48, 'Lillstugan'],
        [55, 'Entré']
    ]
);
const SENSOR_COUNT = sensorFriendlyNames.size;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/temperature.db');

/* GET home page. */
router.get('/', function (req, res, next) {
    db.all("SELECT * FROM TEMPERATURE ORDER BY ID DESC limit " + SENSOR_COUNT, (err, rows) => {
        console.log(err, rows);
        rows.forEach(row => {
            row.sensorName = sensorFriendlyNames.get(row.sensor);
            row.temperatureC = (row.temperature / 100).toFixed(1);
            row.obstime = new Date(row.obstime).toLocaleString('sv-SE');
        });
        res.render('index', {tempSensors: rows});
    });
});
module.exports = router;
