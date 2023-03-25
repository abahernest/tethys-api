const express = require("express");
const Redis = require("ioredis");
const { connectToMongo, fetchPhoneRecordModel, fetchUserModel } = require("./config.js");
const clock = require("./clock.js");


const app = express();
connectToMongo();
const PhoneRecord = fetchPhoneRecordModel();
const UserModel = fetchUserModel();
const port = 3000;


async function verifyAuthToken(req, res, next) {
    try{
        const md5_device_hash = req.headers.authtoken;
        const {email, appname: app_name} = req.headers;

        if(!md5_device_hash){
            return res.status(401).send("Unauthorized0");
        }

        if(!email){
            return res.status(401).send("provide email in header");
        }

        if(!app_name){
            return res.status(401).send("provide appname in header");
        }

        const users = await UserModel.find({ email });
        if(users.length ===0 ){
            return res.status(401).send("Unauthorized1");
        }

        req.user = {email:users[0].email, md5_device_hash, app_name}
        next();
    }catch(err){
        return res.status(401).send("Unauthorized2");
    }
}

app.get("/", (req, res) => {
  greeting = "<h1>Hello From Node on Fly!</h1>";
  name = req.params["name"];
  if (name) {
    res.send(greeting + "</br>and hello to " + name);
  } else {
    res.send(greeting);
  }
});

app.get("/register/:email", async (req, res) => {
    email = req.params["email"];
    let users = await UserModel.find({email})
    if (users.length >0){
        return res.status(400).send("User exists")
    }
    await UserModel.create({email})
    res.status(200).send("OK")
});

const generateHashKey = (email, md5_device_hash, app_name)=>{
    return `${email}-${md5_device_hash}-${app_name}`
}
app.get("/api/v1/start-date", verifyAuthToken, async (req, res) => {
    try{
        const {email, md5_device_hash, app_name} = req.user;
        const record = await PhoneRecord.create({email, md5_device_hash, app_name})
        const client = new Redis(
          "redis://default:xvr8m1Q2Rbx5AuzTgQCTyv0OFIRdynIE@redis-11462.c256.us-east-1-2.ec2.cloud.redislabs.com:11462"
        );

        const redisKey = generateHashKey(email, md5_device_hash, app_name);
        await client.set(redisKey, String(record._id));

        res.status(200).send("OK");

    }catch(error){
      console.log(error);
        res.status(401).send("Failed");
    }

});

app.get("/api/v1/stop-date", verifyAuthToken, async (req, res) => {
  try {
      const {email, md5_device_hash, app_name } = req.user;

    const client = new Redis(
      "redis://default:xvr8m1Q2Rbx5AuzTgQCTyv0OFIRdynIE@redis-11462.c256.us-east-1-2.ec2.cloud.redislabs.com:11462"
    );

      const redisKey = generateHashKey(email, md5_device_hash, app_name);
    const currentlyOpenId = await client.get(redisKey);

    await PhoneRecord.updateOne({ _id: currentlyOpenId },{ stop_date: new Date() });

    res.status(200).send("OK")
    
  } catch (error) {
    res.status(401).send("Failed");
  }
});


clock();
app.listen(port, () => console.log(`Tethys app listening on port ${port}!`));
