import axios from 'axios';

export default axios.create({
  baseURL: process.env.TOKEN_YOUTUBE_API,
  headers: {'Content-type': 'application/json'},

});
