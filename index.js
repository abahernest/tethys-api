const express = require("express");
const Redis = require("ioredis");
const { connectToMongo, fetchPhoneRecordModel } = require("./config.js");

const app = express();
const md5_device_hash = '867e57bd062c7169995dc03cc0541c19';
const redisKey = `${md5_device_hash}_current_run`;
connectToMongo();
const PhoneRecord = fetchPhoneRecordModel();
const port = 3000;


function verifyAuthToken(req, res, next) {
    try{

        const authToken = req.headers.authtoken;
        if(!authToken || authToken !== md5_device_hash){
            return res.status(401).send("Unauthorized1");
        }

        next();
    }catch(err){
        return res.status(401).send("Unauthorized2");
    }
}

app.get(["/", "/:name"], (req, res) => {
  greeting = "<h1>Hello From Node on Fly!</h1>";
  name = req.params["name"];
  if (name) {
    res.send(greeting + "</br>and hello to " + name);
  } else {
    res.send(greeting);
  }
});

app.get("/api/v1/start-date", verifyAuthToken, async (req, res) => {
    try{
        const record = await PhoneRecord.create({md5_device_hash})
        const client = new Redis(
          "redis://default:P913VqAW9hjinSImJLGkECq2uUPxJFat@redis-10896.c11.us-east-1-2.ec2.cloud.redislabs.com:10896"
        );


        await client.set(redisKey, String(record._id))

        res.status(200).send("OK");

    }catch(error){
      console.log(error);
        res.status(401).send("Failed");
    }

});

app.get("/api/v1/stop-date", async (req, res) => {
  try {
    
    const client = new Redis(
      "redis://default:P913VqAW9hjinSImJLGkECq2uUPxJFat@redis-10896.c11.us-east-1-2.ec2.cloud.redislabs.com:10896"
    );

    const currentlyOpenId = await client.get(redisKey);

    await PhoneRecord.updateOne({ _id: currentlyOpenId },{ stop_date: new Date() });

    res.status(200).send("OK")
    
  } catch (error) {
    res.status(401).send("Failed");
  }
});

app.listen(port, () => console.log(`ErnestInstagramUsage app listening on port ${port}!`));
