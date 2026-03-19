import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/documentService';
import DocumentCard from './DocumentCard';
import UploadDocumentModal from './UploadDocumentModal';
import toast from 'react-hot-toast';

const DocumentsView = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchInput, setSearchInput] = useState(''); // For input field
  const [activeSearch, setActiveSearch] = useState(''); // For actual search
  const [showFavorites, setShowFavorites] = useState(false);
  const { user } = useAuth();

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'prescription', label: '💊 Prescriptions' },
    { value: 'lab_report', label: '🔬 Lab Reports' },
    { value: 'discharge_summary', label: '🏥 Discharge Summaries' },
    { value: 'vaccination', label: '💉 Vaccinations' },
    { value: 'insurance', label: '📄 Insurance' },
    { value: 'identification', label: '🪪 Identification' },
    { value: 'imaging', label: '📷 Imaging' },
    { value: 'other', label: '📁 Other' }
  ];

  // Fetch documents when filters change (category, favorites, or active search)
  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, showFavorites, activeSearch]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (showFavorites) {
        params.favorite = 'true';
      }
      
      if (activeSearch) {
        params.search = activeSearch;
      }

      const response = await documentService.getDocuments(params);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchInput); // Trigger search with current input
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const handleUpload = async (file, category, categoryCustom) => {
    try {
      await documentService.uploadDocument(file, category, categoryCustom);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      throw error;
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await documentService.toggleFavorite(id);
      setDocuments(prev => prev.map(doc => 
        doc._id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
      ));
      toast.success('Favorite updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleCategoryChange = async (id, category, categoryCustom) => {
    try {
      await documentService.updateCategory(id, category, categoryCustom);
      fetchDocuments();
      toast.success('Category updated');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Medical Documents</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your central health repository
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Document</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search input with button */}
          <div className="flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>
          </div>
          
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Favorites filter */}
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showFavorites 
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {showFavorites ? 'Showing Favorites' : 'Show Favorites'}
          </button>

          {/* Active search indicator */}
          {activeSearch && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              <span className="text-sm">Search: "{activeSearch}"</span>
              <button
                onClick={handleClearSearch}
                className="hover:text-blue-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map(doc => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onFavorite={handleToggleFavorite}
              onCategoryChange={handleCategoryChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-4">Upload your first medical document</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Upload Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default DocumentsView;