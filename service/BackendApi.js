import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

const authHeaders = () => {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const BackendApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getJobs: () => api.get('/api/jobs'),
  createJob: (data) => api.post('/api/jobs', data, { headers: authHeaders() }),
  updateJob: (id, data) => api.put(`/api/jobs/${id}`, data, { headers: authHeaders() }),
  deleteJob: (id) => api.delete(`/api/jobs/${id}`, { headers: authHeaders() }),
  createResume: (data) => api.post('/api/resumes', data),
  getResumes: (email) => api.get('/api/resumes', { params: { email } }),
  getResumeById: (id) => api.get(`/api/resumes/${id}`),
  updateResume: (id, data, email) => api.put(`/api/resumes/${id}`, data, { params: { email } }),
  deleteResume: (id, email) => api.delete(`/api/resumes/${id}`, { params: { email } }),
  syncResume: (data) => api.put('/api/resumes/sync', data),
  getJobMatches: (email) => api.get('/api/match', { params: { email } }),
}

export default BackendApi
