require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const notifyPhoneNumber = process.env.NOTIFY_PHONE_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

const fs = require('fs');
var contents = JSON.parse(fs.readFileSync("./config.json"));
const checkEveryXSeconds = contents.CheckEveryXSeconds;
const statusFileName = contents.StatusFileName;
const debugFileName = contents.DebugFileName;

console.log(statusFileName);
let pctPermitAvailabilityWebsite = "https://portal.permit.pcta.org/availability/mexican-border.php";

let messagesSent = [];

console.log("watching pct availability page on a constant loop every " + checkEveryXSeconds + " seconds");

const WriteStatus = (message) => {
    
    fs.writeFile(statusFileName, message, err => {
        if (err) throw err;

    } )
}

const WriteDebugLog = (log) => {
    fs.writeFile(debugFileName, `${new Date}:${log}\n`, { flag: 'a'}, (err) => { if (err) throw err; })
}

const WriteLatestStatus = (date, responseCode, hasCalendar) => {
    WriteStatus(`Latest Time Checked: ${date}\nLatest Response Code: ${responseCode}\nHas Calendar: ${hasCalendar}\n`)
}
const StringifyAvailablePermits = (availablePermits) => {
    let message = '';

    availablePermits.map(permit => {
        message += `(${permit.start_date}:${35-permit.num}) `
    })

    return message;
}

const GetNonSentMessages = (availablePermits) => availablePermits.filter(permit => messagesSent.find(sentPermit => sentPermit.start_date == permit.start_date) == undefined)

const CheckForPermitsAvailable = async (websiteSource) => {

    let permitInfo = await JSON.parse(websiteSource.match(/(?<=data\s=\s){.*}/gm))
    let availablePermits = []
    let datesChecked = 0;
    
    permitInfo.calendar.map(date => {
        datesChecked++;
        if (date.num != 35) {
            console.log("we found " + (35 - date.num) + " permit(s) on " + date.start_date)
            availablePermits = [...availablePermits, date]
        }
    })

    WriteLatestStatus(new Date, 200, datesChecked != 0);

    if (availablePermits.length > 0) {
        let nonSentMessages = GetNonSentMessages(availablePermits);
        
        if (nonSentMessages.length > 0) {
            console.log(`Open Permits ${StringifyAvailablePermits(availablePermits)}`)
           
            console.log(`Sending message to ${notifyPhoneNumber} from ${twilioPhoneNumber}`)

            let body = "Open Permits " + StringifyAvailablePermits(nonSentMessages);
            client.messages
            .create({
                body: body,
                from: twilioPhoneNumber,
                to: notifyPhoneNumber
            })

            WriteDebugLog(`Sent message to ${notifyPhoneNumber} from ${twilioPhoneNumber} with body ${body}`)

            messagesSent = [...messagesSent, ...nonSentMessages]
        } else {
            WriteDebugLog("Permits were available but they have all been sent")
        }
    }
}

const CheckWebsite = () => {    
    fetch(pctPermitAvailabilityWebsite)
    .then(website => website.text())
    .then(text => CheckForPermitsAvailable(text));

}

setInterval(CheckWebsite, checkEveryXSeconds * 1000);