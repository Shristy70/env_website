const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const Listing = require("./models/listing.js");
// const { listenerCount } = require("process");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");

const app = express();
const WrapAsync = require("./utils/WrapAsync.js");
const ExpresError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const MONGOSE_URL = "mongodb://127.0.0.1:27017/wonderlust";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

async function main() {
  try {
    await mongoose.connect(MONGOSE_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

main();

app.get("/", (req, res) => {
  res.send("App is here");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((ele) => ele.message).join();
    throw new ExpresError(404, errMsg);
  } else {
    next();
  }
};
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((ele) => ele.message).join();
    throw new ExpresError(404, errMsg);
  } else {
    next();
  }
};
app.get("/listings", async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
});

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post(
  "/listings",
  validateListing,
  WrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

app.put(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);
//edit
app.get(
  "/listings/:id/edit",
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);
//update
app.put(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);
//delete
app.delete(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    const { id } = req.params; // Correctly retrieve id from req.params
    const listingDelete = await Listing.findByIdAndDelete(id);
    console.log(listingDelete);
    res.redirect("/listings");
  })
);
app.post(
  "/listings/:id/reviews",
  validateReview,
  WrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review save ");
    res.send("new listing save");
    res.redirect(`/listings/${listing.__id}`);
  })
);

app.all("*", (err, req, res, next) => {
  next(new ExpresError(404, "page is not found  !"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something is wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.render("error.ejs",{message});
});

app.listen(8080, () => {
  console.log("App is listening on port 8080");
});
