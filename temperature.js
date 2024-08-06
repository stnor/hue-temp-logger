const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/temperature.db');
const hue = require('node-hue-api');
const host = '192.168.2.59';
const USERNAME = 'Cn4LInILNmhnPvYVQ1jfGtjW9NjT9-HYHY52N7b6';

const sensorFriendlyNames = new Map([
        [8, 'Carport'],
        [39, 'Gavel mot relax'],
        [48, 'Lillstugan'],
        [55, 'Entré']
    ]
);
const SENSOR_COUNT = sensorFriendlyNames.size;

var api = {};
function initDb() {
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS TEMPERATURE (" +
            "id INTEGER PRIMARY KEY, " +
            "sensor INTEGER, " +
            "temperature INTEGER, " +
            "obstime DATETIME);");
        db.run("CREATE INDEX IF NOT EXISTS TEMPERATURE_BY_SENSOR ON TEMPERATURE (sensor)");
    });
}

api.doPoll = function doPoll() {
    console.log("Starting poll", new Date().toLocaleString('sv-SE'));
    return hue.api.createLocal(host).connect(USERNAME).then(api => {
        return api.sensors.getAll().then(sensors => {
            const tempSensors = sensors
                .map(s => s.data)
                .filter(d => d.type === 'ZLLTemperature' && d.state.temperature !== undefined)
            const now = new Date();

            const data = {
                ts: now,
                sensors: tempSensors.map(s => {
                    return {id: s.id, temp: s.state.temperature}
                })
            };

            const stmt = db.prepare("INSERT INTO TEMPERATURE (sensor, temperature, obstime) VALUES (?, ?, ?)");
            data.sensors.forEach(s => {
                stmt.run(s.id, s.temp, data.ts);
            })
            stmt.finalize();
        });
    });
}

api.startup = () => {
    initDb();
    setTimeout(() => api.doPoll(), 5000);
    var cron = require('node-cron');
    cron.schedule('0 0,15,30,45 * * * *', () => {
        api.doPoll();
    });
}

api.getData = async function getData() {
    const last24hours = new Date().getTime() - 60 * 60 * 24 * 1000;
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM TEMPERATURE WHERE obstime > " + last24hours + " AND SENSOR IN (8,39,48,55) ORDER BY ID DESC", (err, rows) => {
            rows.forEach(row => {
                row.sensorName = sensorFriendlyNames.get(+row.sensor);
                row.temperatureC = Number((row.temperature / 100).toFixed(1));
            });
            const observationTimes = [...new Set(rows.map(r => r.obstime))];
            let lowestPerObs = [];
            for (let obs of observationTimes) {
                const tempsInObs = rows.filter(r => r.obstime == obs).map(r => r.temperatureC);
                //plocka ur det lägsta värdet per observation
                lowestPerObs.push(Math.min(...tempsInObs));
            }
            const dateStr = new Date(rows[0].obstime).toLocaleString('sv-SE').substring()
            resolve({tempSensors: rows.slice(0, SENSOR_COUNT),
                obsTime: dateStr.substring(0, dateStr.length-3),
                max: Math.max(...lowestPerObs),
                min: Math.min(...lowestPerObs)});
        });
    })

}
module.exports = api;
