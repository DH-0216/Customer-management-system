import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 0, // No timeout for large file uploads
})

export const bulkUploadApi = {
  /**
   * Upload Excel file for bulk customer creation.
   * @param {File} file
   * @param {Function} onUploadProgress  - axios progress callback
   * @returns {Promise<{jobId: string}>}
   */
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/customers/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
  },

  /**
   * Poll job status.
   * @param {string} jobId
   * @returns {Promise<{jobId, status, total, processed, failed, errors}>}
   */
  getJobStatus: (jobId) => api.get(`/customers/bulk-upload/${jobId}`),
}

export default bulkUploadApi
