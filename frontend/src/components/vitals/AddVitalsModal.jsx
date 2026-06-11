import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AddVitalsModal = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [vitalsType, setVitalsType] = useState('bp');
  const { user } = useAuth();

  const vitalsTypes = [
    { value: 'bp', label: 'Blood Pressure', icon: '❤️', unit: 'mmHg' },
    { value: 'sugar', label: 'Blood Sugar', icon: '🩸', unit: 'mg/dL' },
    { value: 'weight', label: 'Weight', icon: '⚖️', unit: 'kg' },
    { value: 'pulse', label: 'Pulse Rate', icon: '💓', unit: 'bpm' },
    { value: 'temperature', label: 'Temperature', icon: '🌡️', unit: '°F' }
  ];

  const handleFormSubmit = (data) => {
    let value;
    if (vitalsType === 'bp') {
      value = { systolic: parseInt(data.systolic), diastolic: parseInt(data.diastolic) };
    } else {
      value = parseFloat(data.value);
    }
    const vitalsData = {
      vitalsType,
      value,
      unit: data.unit,
      notes: data.notes || '',
      timestamp: data.timestamp || new Date().toISOString()
    };
    onSubmit(vitalsData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900 bg-opacity-60" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Add Vitals Reading</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6">
          <div className="space-y-4">

            {/* Vitals Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vitals Type</label>
              <div className="grid grid-cols-2 gap-2">
                {vitalsTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => { setVitalsType(type.value); setValue('unit', type.unit); }}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      vitalsType === type.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <span className="text-xl mr-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BP Inputs */}
            {vitalsType === 'bp' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Systolic <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    {...register('systolic', { required: true })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diastolic <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    {...register('diastolic', { required: true })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="80"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Value <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  {...register('value', { required: true })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder={`Enter value in ${vitalsTypes.find(t => t.value === vitalsType)?.unit}`}
                />
              </div>
            )}

            <input type="hidden" {...register('unit')} value={vitalsTypes.find(t => t.value === vitalsType)?.unit} />

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                {...register('timestamp')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                {...register('notes')}
                rows="2"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Save Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVitalsModal;