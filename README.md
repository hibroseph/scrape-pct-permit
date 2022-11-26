# Scrape PCT Permit Availablity Website
An simple application written to constantly scrape the [permit pct availablility calendar]("https://portal.permit.pcta.org/availability/mexican-border.php") from the mexican border and to alert through text message when a permit is available. 

## Prereqs
- node.js - developed and tested with version 18.x

## Setup
1. clone repo
2. npm install
3. Sign up for a twilio trial (no credit card needed) and  create a twilio number
4. create a `.env` file that has the following contents
```
TWILIO_ACCOUNT_SID=<insert twilio account sid from step 3>
TWILIO_AUTH_TOKEN=<insert twilio auth token from step 3>
NOTIFY_PHONE_NUMBER=<destination phone number in E.164 format>
TWILIO_PHONE_NUMBER=<twilio number created from step 3 in E.164 format>
CHECK_EVERY_X_SECONDS=<how often to check, probably don't make it less than 10>
```
5. either
    1. start application with node watch.js
    2. make `start-process.sh` executable with `chmod +x start-process.sh` and execute `start-process.sh` with `./start-process.sh`
        - Start process runs the node process disconnected from the tty session so it will keep running when you close the terminal where as `node watch.js` will terminate once the tty session is disconnected

## Changelogs
- Added debug logging to file
- Added config.json
- Added readme
- Added status.txt which displays most recent information about latest call to website