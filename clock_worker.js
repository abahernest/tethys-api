const dayjs = require("dayjs");
const { Worker } = require("worker_threads");
const {fetchPhoneRecordModel, connectToMongo} = require("./config.js");

connectToMongo()
const PhoneRecordModel = fetchPhoneRecordModel()

async function fetchPhoneRecordInNewProcess() {

    // notable metrics by App(Instagram, Snapchat, Tiktok)
    // - Total Hours
    // - Total Hours spent for separate time of day (morning, afternoon, evening)
    // - % increase or decrease compared to previous week
    const startDate = dayjs().subtract(7,'day').startOf('day').$d; // 12:00am, 7 days ago
    const endDate = dayjs().startOf('day').$d; //12am, current day

    // fetch metrics from database
    const metrics = await PhoneRecordModel.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        {$gte: [ "$start_date", {$toDate: startDate}]},
                        {$lte: [ "$stop_date", {$toDate: endDate}]}
                    ]
                }
            }
        },
        {
            $group: {
                _id: {
                    md5_device_hash: "$md5_device_hash",
                    email: "$email",
                    app_name: "$app_name",
                },
                duration:
                    {
                        $sum:
                            {
                                $dateDiff:
                                    {
                                        startDate: {$toDate: "$start_date"},
                                        endDate: {$toDate: "$stop_date"},
                                        unit: "second"
                                    }
                            }
                    },
                unit: {$first:{$toString: "seconds"}}
            }
        },
        {
            $group: {
                _id: {
                    "email": "$_id.email",
                    "md5_device_hash": "$_id.md5_device_hash",
                },
                apps: {$push: {app_name: "$_id.app_name", duration:"$duration", unit: "$unit"}},
            }
        },
        {
            $group: {
                _id: "$_id.email",
                devices: {$push: {md5_device_hash:"$_id.md5_device_hash", apps:"$apps"}}
            }
        }
    ]);


    const worker_promises = []
    const metricsLength = metrics.length
    function createWorker(metricsFraction) {
        return new Promise(function (resolve, reject) {
            const worker = new Worker("./multithreading_operations.js", {
                workerData: {
                    action: "sendReportMail",
                    data: metricsFraction
                },
            });
            worker.on("message", (data) => {
                resolve(data);
            });
            worker.on("error", (msg) => {
                reject(`An error ocurred: ${msg}`);
            });
            worker.on("exit", code => {
                if (code != 0) {
                    reject(new Error("sendReportMail Worker has stopped"));
                }
            });
        });
    }

    for (let i=1; i<=metricsLength; i+=1){
        worker_promises.push(createWorker(metrics.slice((i-1), i)))
    }

    const threadResults = await Promise.all(worker_promises)
    console.log(threadResults);

    return Promise.resolve()
}


process.on('message', (action) => {

    switch (action) {
        case 'fetchPhoneRecordInNewProcess':
            fetchPhoneRecordInNewProcess().catch(err=>console.log("ERROR:",err));
            break;
        default:
            console.log('Invalid action specified');
    }

});
