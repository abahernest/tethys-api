
const mongoose = require("mongoose");


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
  });
}

function fetchPhoneRecordModel() {
  const Schema = mongoose.Schema;
  const phoneRecordSchema = new Schema({
    md5_device_hash: { type: String, required: true },
      email: { type: String, required: true },
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

module.exports = {
    connectToMongo,
    fetchPhoneRecordModel,
    fetchUserModel,
    connectToRedis
}