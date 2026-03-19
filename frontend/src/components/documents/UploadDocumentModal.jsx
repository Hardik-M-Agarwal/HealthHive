import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadDocumentModal = ({ isOpen, onClose, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState('other');
  const [customCategory, setCustomCategory] = useState('');

  const categories = [
    { value: 'prescription', label: '💊 Prescription' },
    { value: 'lab_report', label: '🔬 Lab Report' },
    { value: 'discharge_summary', label: '🏥 Discharge Summary' },
    { value: 'vaccination', label: '💉 Vaccination' },
    { value: 'insurance', label: '📄 Insurance' },
    { value: 'identification', label: '🪪 Identification' },
    { value: 'imaging', label: '📷 Imaging' },
    { value: 'other', label: '📁 Other' },
    { value: 'custom', label: '✏️ Custom' }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await onUpload(
        selectedFile, 
        category, 
        category === 'custom' ? customCategory : null
      );
      setSelectedFile(null);
      setPreview(null);
      setCategory('other');
      setCustomCategory('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-40" onClick={onClose}></div>

        <div className="relative z-50 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Upload Medical Document</h3>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2">
                  <span className="text-5xl block">📄</span>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                </div>
              ) : (
                <>
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 mb-2">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">PDF, Images (Max 10MB)</p>
                </>
              )}
            </div>

            {/* Category selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {category === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g., Heart Report, Eye Checkup"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  maxLength="50"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;