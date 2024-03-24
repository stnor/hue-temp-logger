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
    const last24hours = new Date().getTime() - 60 * 60 * 24 * 1000;
    db.all("SELECT * FROM TEMPERATURE WHERE obstime > " + last24hours + " ORDER BY ID DESC", (err, rows) => {
        rows.forEach(row => {
            row.sensorName = sensorFriendlyNames.get(row.sensor);
            row.temperatureC = Number((row.temperature / 100).toFixed(1));
        });
        const observationTimes = [...new Set(rows.map(r => r.obstime))];
        let lowestPerObs = [];
        for (let obs of observationTimes) {
            const tempsInObs = rows.filter(r => r.obstime == obs).map(r=>r.temperatureC);
            //plocka ur det lägsta värdet per observation
            lowestPerObs.push(Math.min(...tempsInObs));
        }
        res.render('index', {tempSensors: rows.slice(0, SENSOR_COUNT),
                                obsTime: new Date(rows[0].obstime).toLocaleString('sv-SE'),
                                max: Math.max(...lowestPerObs),
                                min: Math.min(...lowestPerObs)});
    });
});
module.exports = router;
