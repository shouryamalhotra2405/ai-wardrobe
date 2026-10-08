import axios from 'axios';

// CHANGE THIS LINE: React will now ask its own host server for the API
const API_BASE = '/api';

const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const loginUser = (data) => axios.post(`${API_BASE}/auth/login`, data);
export const registerUser = (data) => axios.post(`${API_BASE}/auth/register`, data);
export const getAllClothing = () => axios.get(`${API_BASE}/wardrobe/all`, authHeader());
export const addClothingItem = (data) => axios.post(`${API_BASE}/wardrobe/add`, data, {
    headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' }
});
export const deleteClothingItem = (id) => axios.delete(`${API_BASE}/wardrobe/delete/${id}`, authHeader());
export const getOutfitSuggestions = (occ, season) => axios.post(`${API_BASE}/suggestions/outfit`, { occasion: occ, season: season }, authHeader());