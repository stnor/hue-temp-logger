# Temperature logger for Philips HUE
As Philips is closing down HUE Labs, which was the only place that displayed the temperature afaik,
I created this small project for logging and displaying the temperature for my four Philips Hue motion detectors.

## Tech stack
I deployed the project on an old Raspberry PI 2 running Debian. Node 21/Express, SQLite3.

## Notes
Endpoint, credentials, sensor friendly names are hardcoded in temperature.js.

The systemd-service has a hard coded directory and username too.


