import api from './api.js';

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data.data;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data.data;
};

export const createProject = async () => {
  const response = await api.post('/projects', {});
  return response.data.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data.data;
};

export const saveCode = async (id, generatedCode) => {
  const response = await api.put(`/projects/${id}`, { generatedCode });
  return response.data.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};