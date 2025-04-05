import Request from '../../http_commons.js';

const search = async (searchQuery) => {
  try {
    const response = await Request.get(`https://youtube.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'id,snippet',
        maxResults: 1,
        q: searchQuery,
        key: process.env.TOKEN_YOUTUBE_API,
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
};

export { search };
