import axios from 'axios';
const API_BASE = 'https://ai-wardrobe-backend-gy8x.onrender.com/api';

const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const loginUser = (data) => axios.post(`${API_BASE}/auth/login`, data);
export const registerUser = (data) => axios.post(`${API_BASE}/auth/register`, data);
export const getAllClothing = () => axios.get(`${API_BASE}/wardrobe/all`, authHeader());
export const addClothingItem = (data) => axios.post(`${API_BASE}/wardrobe/add`, data, {
    headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' }
});
export const getOutfitSuggestions = (occ) => axios.post(`${API_BASE}/suggestions/outfit`, { occasion: occ }, authHeader());