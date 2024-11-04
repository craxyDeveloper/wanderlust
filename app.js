
if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}
//console.log(process.env);
const express = require("express");
const app = express();
const Listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema}=require("./schema.js");
const Review = require("./Models/review.js");
const User = require("./Models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");


const mongoose = require("mongoose");
const { options } = require("joi");
const {isLoggedIn,isOwner,isReviewAuthor}=require("./middleware.js");
const {saveRedirectUrl}=require("./middleware.js");
const multer  = require('multer')
const{storage}=require("./CloudinaryConfig.js");
const upload = multer({ storage});

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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
//this is middleware for using data from req.user in ejs template.
// app.use((req,res,next)=>{
//   res.locals.currUser=req.user;
//   next();
// })
app.use(
  session({ secret: "mysecretstring", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
  // Make `user` and `authenticated` available in templates
  res.locals.currUser = req.user
 // res.locals.authenticated = !req.user.anonymous
  next()
})
const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map((ele)=>ele.message).join(',');
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
}
// app.get("/", (req, res) => {
//   res.send("hi i am root");
// });
//Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
  })
);
//New Route
app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("new.ejs");
});
//Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("Owner");
    res.render("show.ejs", { listing });
  })
);
//Create Route
app.post(
  "/listings", isLoggedIn,upload.single('listing[image]'),
 wrapAsync( async (req, res, next) => {
    //ye error client ke side se ata hai usko handle karne ke liye
    // if(!req.body.listing){
    //   throw new ExpressError(400,"send valid data for listing");
    // }
  //   let result = listingSchema.validate(req.body);
  //   console.log(result);
  //   if (result.err) {
  //     throw new ExpressError(400, result.err);
  //   }
    let response= await  geocoder.geocode(req.body.listing.location);
    console.log(response);
    res.send('done');
    let url=req.file.path;
    let filename=req.file.filename;
    const listing = req.body.listing;
    const newlisting = new Listing(listing);
    console.log(newlisting);
    console.log(res.user);
    newlisting.Owner=req.user._id;
    newlisting.image={url,filename};
    
   // console.log(newlisting);
    await newlisting.save();
    res.redirect("/listings");
  // console.log(req.file);
  // res.send(req.file);
  //   next();
  // })
}));
//Update Route
app.get(
  "/listings/:id/edit", isLoggedIn,isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("edit.ejs", { listing });
  })
);
app.put(
  "/listings/:id", isLoggedIn,isOwner,upload.single('listing[image]'),
  wrapAsync(async (req, res, next) => {
    try {
      let { id } = req.params;

    let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
     if(typeof req.file!=='undefined'){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
      await listing.save();
     }
      
      res.redirect(`/listings/${id}`);
    } catch (err) {
      next();
    }
  })
);
//Delete Route
app.delete(
  "/listings/:id", isLoggedIn,isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);
//Reviews
//Post a review
app.post("/listings/:id/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author=req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("review saved");
  res.redirect(`/listings/${listing._id}`);

}));
//Delete a review
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor,wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New villa",
//     description: "By the beach",
//     price: 1200,
//     location: "calangute,Goa",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("sucessful testing");
//});
//-----------------------------------------------
//USERS SIGNUP AND LOGIN
app.get("/signup", (req, res) => {
  res.render("./users/signup.ejs");
});
app.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser,(err)=>{
      if (err) {
        return next(err);
      }
      console.log(registeredUser);
    
      res. redirect("/listings");
    });
   
  } catch (e) {
   // alert(`Error is ${e.message}`);
    res.redirect("/signup");
  }
});
// Login
app.get("/login",async(req,res)=>{
  res.render("./users/login.ejs");
})
app.post("/login", saveRedirectUrl , passport.authenticate("local",{ failureRedirect: '/login' , failureFlash: true }),(req,res)=>{
  let redirectUrl=res.locals.redirectUrl;
  res.redirect(redirectUrl);
})
// logout
app.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if (err) {
      return next(err);
    }
    res. redirect("/listings");
  });
  
})
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
//Error handler using middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.render("error.ejs", { message });
});
app.listen(8080, () => {
  console.log("server is listing to port 8080");
});
