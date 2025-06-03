import api from './api';

const matchService = {
  getCompetitionMatches: async (competitionId) => {
    const response = await api.get(`/matches/competition/${competitionId}`);
    return response.data;
  },

  getMatch: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  createMatch: async (matchData) => {
    const response = await api.post('/matches', matchData);
    return response.data;
  },

  updateMatch: async (id, matchData) => {
    const response = await api.put(`/matches/${id}`, matchData);
    return response.data;
  },

  deleteMatch: async (id) => {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  }
};

export default matchService; 