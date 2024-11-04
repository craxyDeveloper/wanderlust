const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/listing.js");
const MONGO_URL = "mongodb+srv://arvindmn011:arvindmn011200@wanderlustcluster.6vn1i.mongodb.net/?retryWrites=true&w=majority&appName=wanderlustCluster";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
 // await Listing.deleteMany({});
  initData.data= initData.data.map((obj)=>({...obj,Owner:"66b8a16b9cd46beb3f62b727"}))
  await Listing.insertMany(initData.data);
  console.log("Data was initiated");
};
initDB();
