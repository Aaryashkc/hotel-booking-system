import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

const MapUpload = () => {
  const [file, setFile] = useState(null);
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const response = await api.get('/api/admin/maps');
      setMaps(response.data);
    } catch (error) {
      console.error('Error loading maps:', error);
    }
  };

  const validatePDFFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please upload a valid PDF file');
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    try {
      if (selectedFile) {
        validatePDFFile(selectedFile);
        setFile(selectedFile);
      }
    } catch (error) {
      alert(error.message);
      e.target.value = '';
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !placeName) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('map', file);
    formData.append('name', placeName);
    formData.append('description', description);

    try {
      await api.post('/api/admin/maps/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFile(null);
      setPlaceName('');
      setDescription('');
      document.getElementById('mapFileInput').value = '';
      
      loadMaps();
      alert('Map uploaded successfully!');
    } catch (error) {
      console.error('Error uploading map:', error);
      alert('Error uploading map: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handleDelete = async (fileName) => {
    if (!confirm('Are you sure you want to delete this map?')) return;

    try {
      await api.delete(`/api/admin/maps/${fileName}`);
      loadMaps();
      alert('Map deleted successfully!');
    } catch (error) {
      console.error('Error deleting map:', error);
      alert('Error deleting map');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Offline Maps (PDF)</h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Place Name *</label>
          <input
            type="text"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PDF Map File *</label>
          <input
            id="mapFileInput"
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Only PDF files are supported (max 10MB)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Uploading...' : 'Upload Map'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Uploaded Maps</h3>
        <div className="grid grid-cols-1 gap-4">
          {maps.map((map) => (
            <div key={map.name} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{map.name}</h4>
                  <p className="text-sm text-gray-600">{map.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Size: {formatFileSize(map.size)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL}/api/admin/maps/download/${map.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(map.fileName)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapUpload;
