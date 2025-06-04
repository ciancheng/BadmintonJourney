import api from './api';

const competitionService = {
  getCompetitions: async (page = 0, size = 10) => {
    const response = await api.get('/competitions', {
      params: { page, size }
    });
    return response.data;
  },

  getCompetition: async (id) => {
    const response = await api.get(`/competitions/${id}`);
    return response.data;
  },

  createCompetition: async (competitionData) => {
    const response = await api.post('/competitions', competitionData);
    return response.data;
  },

  updateCompetition: async (id, competitionData) => {
    const response = await api.put(`/competitions/${id}`, competitionData);
    return response.data;
  },

  deleteCompetition: async (id) => {
    const response = await api.delete(`/competitions/${id}`);
    return response.data;
  },

  uploadPhotos: async (id, photos) => {
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });

    const response = await api.post(`/competitions/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deletePhoto: async (id, photoPath) => {
    const response = await api.delete(`/competitions/${id}/photos`, {
      params: { photoPath }
    });
    return response.data;
  },

  deletePhotos: async (id, photoPaths) => {
    const response = await api.delete(`/competitions/${id}/photos/batch`, {
      data: photoPaths
    });
    return response.data;
  }
};

export default competitionService; 