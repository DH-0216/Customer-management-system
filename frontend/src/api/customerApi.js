import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export const customerApi = {
  /** GET /customers?page=0&size=20&search= */
  getAll: (params = {}) => api.get('/customers', { params }),

  /** GET /customers/:id */
  getById: (id) => api.get(`/customers/${id}`),

  /** POST /customers */
  create: (data) => api.post('/customers', data),

  /** PUT /customers/:id */
  update: (id, data) => api.put(`/customers/${id}`, data),

  /** DELETE /customers/:id */
  remove: (id) => api.delete(`/customers/${id}`),

  /** GET /customers/search?query=... */
  search: (query) => api.get('/customers/search', { params: { query } }),
}

export const masterApi = {
  /** GET /master/countries */
  getCountries: () => api.get('/master/countries'),

  /** GET /master/cities?countryId= */
  getCities: (countryId) => api.get('/master/cities', { params: { countryId } }),
}

export default api
