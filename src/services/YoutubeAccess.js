import Request from '../../http_commons.js';

const search = (searchQuery) => {
  return Request?.get(`https://youtube.googleapis.com/youtube/v3/search?part=id%2C%20snippet&maxResults=1&q=${searchQuery}&key=${process.env.TOKEN_YOUTUBE_API}`);
};

export {
  search,
};
