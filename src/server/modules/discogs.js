const axios = require("axios");

const Discogs = {};

/*
* Creates a GET request to the Discogs API search. 
* @params {Object} params. The params to be added to the end of the search query
*/
Discogs.search = params => {
  return axios
    .get(`https://api.discogs.com/database/search?`, { params })
    .then(res => res.data)
    .catch(err => console.error(err));
};

/**
 * Uses .search() to obtain the Discogs ID for a specific item
 * @param {Object} params to be pasased to .search()
 */
Discogs.getId = params => {
  return Discogs.search(params)
    .then(res => res.results[0].id)
    .catch(err => console.error(err));
};

/**
 * Gets all information held by Discogs on a particular release using result of getId()
 * @param {Object} params to be passed to .getID
 */
Discogs.getRelease = params => {
  return Discogs.getId(params)
    .then(id => axios.get(`https://api.discogs.com/releases/${id}`))
    .then(res => res.data)
    .catch(err => console.error(err));
};

/**
 * Get tracklist for release. Array.map() to create an Object for each track
 * containing track position, title and duration
 * @param {Object} params to be passed to .getRelease
 */
Discogs.getTracklist = params => {
  return Discogs.getRelease(params)
    .then(res =>
      res.tracklist.map(track => ({
        position: track.position,
        title: track.title,
        duration: track.duration
      }))
    )
    .catch(err => console.error(err));
};

/**
 * Get genre(s) for a release
 * @param {Object} params to be passed to .getRelease
 */
Discogs.getGenres = params => {
  return Discogs.getRelease(params)
    .then(res => res.genres)
    .catch(err => console.error(err));
};

/**
 * Get labels(s) for a release
 * @param {Object} params to be passed to .getRelease
 */
Discogs.getLabels = params => {
  return Discogs.getRelease(params)
    .then(res => res.labels)
    .catch(err => console.error(err));
};

/**
 * Get cover image for a release.
 * Currently no image url data being returned from Discogs API when getting a releases data
 * Workaround - use cover image from first result exposed when carrying out initial search
 * @param {Object} params
 */
Discogs.getImage = params => {
  return Discogs.search(params)
    .then(res => res.results[0].cover_image)
    .catch(err => console.error(err));
};

Discogs.getCurrentPrice = params => {
  return Discogs.getId(params)
  .then(res => axios.get(`https://api.discogs.com//marketplace/price_suggestions/${res}`))
  .catch (err => console.log(err));
}

/**
 * Takes all information from all the above searches an returns a single Object.
 * Uses Promise.all, which returns an array with the result of all the Promises passed to it
 * @param {Object} params
 */
Discogs.createVinyl = params => {
  return Promise.all([
    Discogs.getTracklist(params),
    Discogs.getGenres(params),
    Discogs.getLabels(params),
    Discogs.getImage(params)
  ])
    .then(res => {
      return {
        title: params.title,
        artist: params.artist,
        tracklist: res[0],
        genres: res[1],
        labels: res[2].map(label => label.name),
        catno: res[2][0].catno, //Take catalog number from first label entry
        image: res[3]
      };
    })
    .catch(err => console.error(err));
};

module.exports = Discogs; //Export Discogs Object