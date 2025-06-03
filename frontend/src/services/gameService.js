import api from './api';

const gameService = {
  getMatchGames: async (matchId) => {
    const response = await api.get(`/games/match/${matchId}`);
    return response.data;
  },

  getGame: async (id) => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  createGame: async (gameData) => {
    const response = await api.post('/games', gameData);
    return response.data;
  },

  updateGame: async (id, gameData) => {
    const response = await api.put(`/games/${id}`, gameData);
    return response.data;
  },

  deleteGame: async (id) => {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },

  uploadVideo: async (id, video) => {
    const formData = new FormData();
    formData.append('video', video);

    const response = await api.post(`/games/${id}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default gameService; 