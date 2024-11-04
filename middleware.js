const Listing=require("./Models/listing.js");
const Review=require("./Models/review.js");
module.exports.isLoggedIn=(req,res,next)=>{
    //console.log(req.path +".."+ req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        return res.redirect("/login");
    }
    // }else{
    //     res.redirect("/listings");
    // }
   
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id);
    if(!listing.Owner._id.equals(res.locals.currUser._id)){
      return  res.redirect(`/listings/${id}`);
    }

    next();
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review= await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
      return  res.redirect(`/listings/${id}`);
    }

    next();
}
