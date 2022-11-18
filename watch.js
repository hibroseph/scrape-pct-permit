require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const notifyPhoneNumber = process.env.NOTIFY_PHONE_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const checkEveryXSeconds = process.env.CHECK_EVERY_X_SECONDS;

const client = require('twilio')(accountSid, authToken);


let pctPermitAvailabilityWebsite = "https://portal.permit.pcta.org/availability/mexican-border.php";

let messagesSent = [];

console.log("watching pct availability page on a constant loop every " + checkEveryXSeconds + " seconds");

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

    if (availablePermits.length > 0) {
        let nonSentMessages = GetNonSentMessages(availablePermits);
        
        if (nonSentMessages.length > 0) {
            console.log(`Open Permits ${StringifyAvailablePermits(availablePermits)}`)
           
            console.log(`Sending message to ${notifyPhoneNumber} from ${twilioPhoneNumber}`)
            client.messages
            .create({
                body: "Open Permits " + StringifyAvailablePermits(nonSentMessages),
                from: twilioPhoneNumber,
                to: notifyPhoneNumber
            })

            messagesSent = [...messagesSent, ...nonSentMessages]
        }
    }
}

const CheckWebsite = () => {
    console.log(`Checking PCT calendar at ${new Date}`)
    fetch(pctPermitAvailabilityWebsite)
    .then(website => website.text())
    .then(text => CheckForPermitsAvailable(text));
}

setInterval(CheckWebsite, checkEveryXSeconds * 1000);