
const mongoose = require("mongoose");


async function connectToMongo() {
    mongoose.connect(
    "mongodb+srv://acumen:kylegenius@cluster0.3ekrb.mongodb.net/ErnestInstagramUsage?retryWrites=true&w=majority",
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
    start_date: { type: Date, default: Date.now },
    stop_date: { type: Date, required: false },
  });

  return mongoose.model("PhoneRecord", phoneRecordSchema);
}

async function connectToRedis(){
    const client = new Redis(
      "redis://default:P913VqAW9hjinSImJLGkECq2uUPxJFat@redis-10896.c11.us-east-1-2.ec2.cloud.redislabs.com:10896"
    );

    console.log("Connected to Redis");
    return client;
}

module.exports = {
    connectToMongo,
    fetchPhoneRecordModel,
    connectToRedis
}