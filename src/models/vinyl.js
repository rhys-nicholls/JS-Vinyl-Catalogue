const mongoose = require('mongoose');

const vinylSchema = new mongoose.Schema({
  discogsId: String,
  artist: String,
  title: String,
  genres: [String],
  condition: String,
  uri: String,
  priceUSD: Number,
  labels: [
    {
      labelName: String,
      catno: String,
    },
  ],
  tracklist: [
    {
      position: String,
      title: String,
      duration: String,
    },
  ],
  images: [
    {
      uri: String,
      height: String,
      width: String,
    },
  ],
  owner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
});

module.exports = mongoose.model('Vinyl', vinylSchema);
