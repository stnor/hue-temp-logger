# Temperature logger for Philips HUE
As Philips is closing down HUE Labs, which was the only place that displayed the temperature afaik,
I created this small project for logging and displaying the temperature for my four Philips Hue motion detectors.

## How it works
The node server polls the HUE bridge every 15 minutes. The cron expression is in temperature.js.

```javascript
    cron.schedule('0 0,15,30,45 * * * *', () => {
        api.doPoll();
    });
```

Each sensor and temperature value gets saved to a sqlite database file, which is in turn used to display the 
temperature and the min/max values on the web page.

The min/max values are calculated by taking the lowest sensor value for each poll for the last 24 h and then
displaying the min/max based on that series. I'm taking the lowest value to disregard measurements
from sensors in the sun.

## Tech stack
Uses https://github.com/peter-murray/node-hue-api
I deployed the project on an old Raspberry PI 2 running Debian. Node 21/Express, SQLite3.

## Notes
Endpoint, credentials, sensor friendly names are hardcoded in temperature.js.

The systemd-service has a hard coded directory and username too.
Here are instructions on how to use systemd: https://blog.r0b.io/post/running-node-js-as-a-systemd-service/


