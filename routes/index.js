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

/* GET home page. */
router.get('/', function (req, res, next) {
    const host = '192.168.2.59';
    const USERNAME = 'Cn4LInILNmhnPvYVQ1jfGtjW9NjT9-HYHY52N7b6';
    return hue.api.createLocal(host).connect(USERNAME).then(api => {
        api.sensors.getAll().then(sensors => {
            const tempSensors = sensors
                .map(s => s.data)
                .filter(d => d.type === 'ZLLTemperature' && d.state.temperature != undefined)
            // The sensor would have been previously obtained from the bridge.
            tempSensors.forEach(s => {
                s.name = sensorFriendlyNames.get(s.id);
            });

            res.render('index', {title: 'Express', tempSensors: tempSensors});
        });
    });
});

module.exports = router;
