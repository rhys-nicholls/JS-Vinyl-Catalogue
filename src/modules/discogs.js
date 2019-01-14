const axios = require('axios');

const Discogs = {};

axios.defaults.headers.get['User-Agent'] = 'VinylCatalogueProject/0.1 +https://github.com/rhys-nicholls/JS-Vinyl-Catalogue';

/*
* Creates a GET request to the Discogs API search.
* @params {Object} params. The params to be added to the end of the search query
*/
Discogs.search = params => axios
  .get('https://api.discogs.com/database/search?', { params })
  .then(res => res.data)
  .catch(err => console.error(err));

/**
 * Uses .search() to obtain the Discogs ID for a specific item
 * @param {Object} params to be pasased to .search()
 */
Discogs.getId = params => Discogs.search(params)
  .then(res => res.results[0].id)
  .catch(err => console.error(err));

/**
 * Gets all information held by Discogs on a particular release using result of getId()
 * @param {Object} params to be passed to .getID
 */
Discogs.getRelease = params => Discogs.getId(params)
  .then(id => axios.get(`https://api.discogs.com/releases/${id}?key=${params.key}&secret=${params.secret}`))
  .then(res => res.data)
  .catch(err => console.error(err));

/**
 * Gets Title and Artist for a release. Allows for fuzzy search.
 * E.g. Title: DAMN Artist:Kendrick would be stored as Title: Damn. Artist: Kendrick Lamar
 * @param {Object} params to be passed to .getID
 */
Discogs.getTitleArtist = params => Discogs.getRelease(params)
  .then(res => ({
    artist: res.artists[0].name,
    title: res.title,
  }))
  .catch(err => console.error(err));

/**
 * Get tracklist for release. Mapped to create an Object for each track
 * containing track position, title and duration
 * @param {Object} params to be passed to .getRelease
 */
Discogs.getTracklist = params => Discogs.getRelease(params)
  .then(res => res.tracklist.map(track => ({
    position: track.position,
    title: track.title,
    duration: track.duration,
  })))
  .catch(err => console.error(err));

/**
 * Get genre(s) for a release
 * @param {Object} params to be passed to .getRelease
 */
Discogs.getGenres = params => Discogs.getRelease(params)
  .then(res => res.genres)
  .catch(err => console.error(err));

/**
 * Get labels(s) for a release. Mapped to return only label name and catno
 * @param {Object} params to be passed to .getRelease
 */
Discogs.getLabels = params => Discogs.getRelease(params)
  .then(res => res.labels.map(label => ({
    labelName: label.name,
    catno: label.catno,
  })))
  .catch(err => console.error(err));

/**
 * Get images for a release. Images are filtered to ensure they are roughly square.
 * Now fixed. The Discogs key and secret not being appended to the url in getRelease
 * @param {Object} params
 */
Discogs.getImages = params => Discogs.getRelease(params)
  .then(res => res.images
    .filter(image => image.height >= (image.width - 15)
        && image.height <= (image.width + 15)))
  .catch(err => console.error(err));

/**
 * Get Discogs page url
 * @param {Object} params
 */
Discogs.getUri = params => Discogs.getRelease(params)
  .then(res => res.uri)
  .catch(err => console.error(err));

/**
 * Get current lowest price.
 * TODO: The Discogs API only returns the lowest price for a release. Possibly scape the actual
 * release pageto get the median price for a release to give a more accurate representation of
 * a releases value.
 * Value returned is in USD
 * @param {Object} params
 */
Discogs.getPrice = id => axios
  .get(`https://api.discogs.com/releases/${id}`)
  .then(res => res.data.lowest_price)
  .catch(err => console.log(err));

/**
 * Takes all information from all the above searches an returns a single Object, exceot getPrice as
 * price is subject to change so will not be stored.
 * Uses Promise.all which returns an array with the results of all the Promises passed to it
 * @param {Object} params
 */
Discogs.createVinyl = params => Promise.all([
  Discogs.getId(params),
  Discogs.getTitleArtist(params),
  Discogs.getTracklist(params),
  Discogs.getGenres(params),
  Discogs.getLabels(params),
  Discogs.getImages(params),
  Discogs.getUri(params),
])
  .then((res) => {
    const newVinyl = {
      discogsId: res[0],
      artist: res[1].artist,
      title: res[1].title,
      tracklist: res[2],
      genres: res[3],
      labels: res[4],
      images: res[5],
      uri: res[6],
    };
    return newVinyl;
  })
  .catch(err => console.error(err));

module.exports = Discogs; // Export Discogs Object
