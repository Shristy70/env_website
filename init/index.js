
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGOSE_URL = "mongodb://127.0.0.1:27017/wonderlust";
main().then(()=>{console.log("connected mongooose")}).catch(err => console.log(err));


async function main() {
  await mongoose.connect(MONGOSE_URL);
}

const initDb = async()=>{
await Listing.deleteMany({});
await Listing.insertMany(initData.data)
console.log("data was sav");
};
initDb();
