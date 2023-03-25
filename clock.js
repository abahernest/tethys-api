const CronJob = require('cron').CronJob;
const { fork } = require('child_process');



function emailCustomer() {
    const job =  new CronJob(
        '0 10 * * 1', // cron job runs at 10:00am every monday,
        async () => await fetchPhoneRecordInNewProcess(),
        null,
        true,
        'Africa/Lagos',
    );

    job.start();
}

function fetchPhoneRecordInNewProcess(){
    const childProcess = fork("./clock_worker.js")

    childProcess.send("fetchPhoneRecordInNewProcess")

    childProcess.on("error", (err)=>{
        console.log("error creating child process", err)
    })

    childProcess.on("exit", (code, signal)=>{
        reject(new Error(`sendReportMail Worker has stopped. Code:${code}, Signal:${signal}`));
    })
}

const main = ()=>{
    emailCustomer();
}

module.exports = main;