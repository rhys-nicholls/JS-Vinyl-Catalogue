const mongoose = require("mongoose");

const vinylSchema = new mongoose.Schema({
  discogsId: String,
  artist: String,
  title: String,
  image: String,
  genres: [String],
  condition: String,
  labels: [
    {
      labelName: String,
      catno: String
    }
  ],
  tracklist: [
    {
      position: String,
      title: String,
      duration: String
    }
  ]
});

module.exports = mongoose.model('Vinyl', vinylSchema);