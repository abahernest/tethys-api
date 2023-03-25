const { workerData } = require("worker_threads");
const { sendMail } = require("./config.js");

/**
 * Send Weekly Report Mail
 *
 * @param {Array<Object>} metricsObject the report of all users
 * @returns {} void
 */
const sendReportMail = async function (metricsObject) {

    const appMetricString = (apps)=>{
        let str = "";
        apps.forEach(app=>{
            const hours = (app.duration/3600).toFixed(1)
            const minutes = (app.duration/60).toFixed(1)
            str += `\t\t${app.app_name}: ${hours} hrs ≈ ${minutes} minutes \n`
        })
        return str;
    }
    const deviceMetricString = (devices)=>{
        let str = "";
        devices.forEach(device=>{
            const appString = appMetricString(device.apps);

            str += `\tDevice ${device.md5_device_hash}:\n${appString}\n`
        })
        return str;
    }

    metricsObject.forEach(async (metric)=>{
        const deviceInfoString = deviceMetricString(metric.devices)
        const toAddress = metric._id;

        const html = `Hello,\n
Here's your weekly social media report 🚀\n\n
${deviceInfoString}
\n
Cheers.
Tethys
`;
        const subject = "Tethys Weekly Social Media Report🚀🚀";
        await sendMail(toAddress, subject, html);

    })

};


const {action, data} = workerData;

switch (action) {
    case 'sendReportMail':
        sendReportMail(data);
        break;
    default:
        console.log('Invalid action specified');
}