const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { urlencoded } = require("express");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
   url:String,
   fileName:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  Owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",

  },
});
listingSchema.post("findByIdAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
