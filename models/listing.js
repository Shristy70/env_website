const mongooose = require("mongoose");
const Schema = mongooose.Schema;
const listingSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  image: {
    default:
      "https://unsplash.com/photos/do-something-great-neon-sign-oqStl2L5oxI",
    type: String,
    set: (v) =>
      v === " "
        ? "https://unsplash.com/photos/do-something-great-neon-sign-oqStl2L5oxI "
        : v,
  },
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
});
const Listing = mongooose.model("Listing", listingSchema);
module.exports = Listing;
