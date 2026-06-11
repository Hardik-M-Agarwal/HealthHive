import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const DocumentCard = ({ document, onFavorite, onCategoryChange, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(document.category);
  const [customCategory, setCustomCategory] = useState(document.categoryCustom || '');

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

  const getCategoryLabel = () => {
    if (document.category === 'custom' && document.categoryCustom) return document.categoryCustom;
    const cat = categories.find(c => c.value === document.category);
    return cat ? cat.label.split(' ')[1] : document.category;
  };

  const getCategoryIcon = () => {
    const cat = categories.find(c => c.value === document.category);
    return cat ? cat.label.split(' ')[0] : '📄';
  };

  const handleCategoryUpdate = () => {
    onCategoryChange(document._id, selectedCategory, selectedCategory === 'custom' ? customCategory : null);
    setShowCategoryModal(false);
    setShowMenu(false);
  };

  const getFileIcon = () => {
    if (document.fileType === 'pdf') return '📕';
    if (document.fileType === 'image') return '🖼️';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100 overflow-hidden">
        {/* Preview area */}
        <div className="h-32 bg-slate-50 flex items-center justify-center relative border-b border-slate-100">
          {document.fileType === 'image' && document.secureUrl ? (
            <img
              src={document.secureUrl}
              alt={document.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">{getFileIcon()}</span>
          )}

          {/* Favorite button */}
          <button
            onClick={() => onFavorite(document._id)}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-slate-100"
          >
            <svg
              className={`w-5 h-5 ${document.isFavorite ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
              fill="currentColor"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 truncate" title={document.originalName}>
                {document.originalName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {formatFileSize(document.fileSize)} • {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Menu button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10">
                  <a
                    href={document.secureUrl || `http://localhost:5000${document.storagePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    📄 View
                  </a>
                  <button
                    onClick={() => { setShowCategoryModal(true); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    🏷️ Change Category
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this document?')) onDelete(document._id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-base">{getCategoryIcon()}</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
              {getCategoryLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900 bg-opacity-60" onClick={() => setShowCategoryModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Category</h3>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {selectedCategory === 'custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                maxLength="50"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCategoryUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentCard;