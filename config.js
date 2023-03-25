const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const { workerData } = require("worker_threads");


async function connectToMongo() {
    mongoose.connect(
    "mongodb+srv://acumen:q8am6KHkQLRy55le@cluster0.3ekrb.mongodb.net/ErnestInstagramUsage?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  ).then(()=>{
        console.log("Connected to database");
  }).catch((err) => {
      console.log(err);
      process.exit(0)
  });
}

function fetchPhoneRecordModel() {
  const Schema = mongoose.Schema;
  const phoneRecordSchema = new Schema({
    md5_device_hash: { type: String, required: true },
      email: { type: String, required: true },
      app_name: { type: String, required: true },
    start_date: { type: Date, default: Date.now },
    stop_date: { type: Date, required: false },
  });

  return mongoose.model("PhoneRecord", phoneRecordSchema);
}

function fetchUserModel() {
    const Schema = mongoose.Schema;
    const userSchema = new Schema({
        email: { type: String, required: true, unique: true },
    },{
        timestamps: true
    });

    return mongoose.model("User", userSchema);
}

async function connectToRedis(){
    const client = new Redis(
      "redis://default:xvr8m1Q2Rbx5AuzTgQCTyv0OFIRdynIE@redis-11462.c256.us-east-1-2.ec2.cloud.redislabs.com:11462"
    );

    console.log("Connected to Redis");
    return client;
}

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(toAddress, subject, message) {

    const EMAIL_HOST= "smtp.gmail.com"
    const EMAIL_HOST_PORT= 587
    const EMAIL_HOST_USER= "app.tethys@gmail.com"
    const EMAIL_HOST_PASSWORD= "ljkxbdoaqinvhdfe"

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_HOST_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: EMAIL_HOST_USER,
            pass: EMAIL_HOST_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: EMAIL_HOST_USER, // sender address
        to: toAddress, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
    });

    console.log(`Message sent: ${info.messageId}`);
}


module.exports = {
    connectToMongo,
    fetchPhoneRecordModel,
    fetchUserModel,
    sendMail,
    connectToRedis
}