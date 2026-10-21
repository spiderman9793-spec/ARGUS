import axios from 'axios';

const API_BASE = "http://localhost:8000";

export const fetchHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
};

export const fetchAlerts = async (acked = null) => {
  const url = acked !== null ? `${API_BASE}/api/alerts?acked=${acked}` : `${API_BASE}/api/alerts`;
  const response = await axios.get(url);
  return response.data;
};

export const acknowledgeAlert = async (alertId) => {
  const response = await axios.post(`${API_BASE}/api/alerts/${alertId}/ack`);
  return response.data;
};

export const fetchSightings = async (params = {}) => {
  const response = await axios.get(`${API_BASE}/api/sightings`, { params });
  return response.data;
};

export const fetchHotlist = async () => {
  const response = await axios.get(`${API_BASE}/api/hotlist`);
  return response.data;
};

export const addToHotlist = async (plate, reason = "Hotlist Flagged") => {
  const response = await axios.post(`${API_BASE}/api/hotlist`, { plate, reason, active: true });
  return response.data;
};

export const deleteFromHotlist = async (id) => {
  const response = await axios.delete(`${API_BASE}/api/hotlist/${id}`);
  return response.data;
};

export const fetchCameras = async () => {
  const response = await axios.get(`${API_BASE}/api/cameras`);
  return response.data;
};