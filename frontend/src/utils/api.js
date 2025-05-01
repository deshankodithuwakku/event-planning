import axios from 'axios';

// Create an API utility with consistent authorization header setup
const api = {
  // Get the authorization header with token
  getAuthHeader() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  },
  
  // GET request with authorization
  async get(url) {
    return axios.get(url, this.getAuthHeader());
  },
  
  // POST request with authorization
  async post(url, data) {
    return axios.post(url, data, this.getAuthHeader());
  },
  
  // PUT request with authorization
  async put(url, data) {
    return axios.put(url, data, this.getAuthHeader());
  },
  
  // DELETE request with authorization
  async delete(url) {
    return axios.delete(url, this.getAuthHeader());
  }
};

export default api;
