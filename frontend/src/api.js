import axios from 'axios';

const API_BASE = 'https://ai-wardrobe-backend-gy8x.onrender.com/api';

export const addClothingItem = async (formData) => {
  const res = await axios.post(`${API_BASE}/wardrobe/add`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getAllClothing = async () => {
  const res = await axios.get(`${API_BASE}/wardrobe/all`);
  return res.data;
};

export const deleteClothingItem = async (id) => {
  const res = await axios.delete(`${API_BASE}/wardrobe/delete/${id}`);
  return res.data;
};

export const getOutfitSuggestions = async (occasion, season) => {
  const res = await axios.post(`${API_BASE}/suggestions/outfit`, { occasion, season });
  return res.data;
};

export const getWardrobeStats = async () => {
  const res = await axios.get(`${API_BASE}/wardrobe/stats`);
  return res.data;
};