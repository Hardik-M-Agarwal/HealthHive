import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

const AddMedicationModal = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [frequencyType, setFrequencyType] = useState('daily');
  const { user } = useAuth();

  const categories = [
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'over-the-counter', label: 'Over the Counter', icon: '🏪' },
    { value: 'supplement', label: 'Supplement', icon: '💪' },
    { value: 'herbal', label: 'Herbal', icon: '🌿' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  const dosageUnits = [
    'mg', 'g', 'mcg', 'ml', 'tablet', 'capsule', 'drop', 'puff', 'unit'
  ];

  const timeOfDayOptions = [
    { value: 'morning', label: 'Morning', icon: '🌅', time: '10:00' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️', time: '14:00' },
    { value: 'evening', label: 'Evening', icon: '🌆', time: '18:00' },
    { value: 'night', label: 'Night', icon: '🌙', time: '22:00' }
  ];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleFormSubmit = (data) => {
    const medicationData = {
      medicineName: data.medicineName,
      category: data.category || 'prescription',
      dosage: {
        value: parseFloat(data.dosageValue),
        unit: data.dosageUnit
      },
      frequency: {
        type: frequencyType,
        timesPerDay: parseInt(data.timesPerDay) || 1,
        interval: data.interval ? parseInt(data.interval) : null
      },
      timeOfDay: data.timeOfDay || [],
      startDate: data.startDate,
      endDate: data.endDate || null,
      instructions: data.instructions || '',
      userId: user.id,
      familyId: user.familyId
    };
    onSubmit(medicationData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900 bg-opacity-60 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Add New Medication</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-6">
            <div className="space-y-6">

              {/* Basic Information */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="mb-4 flex items-center gap-2 font-medium text-slate-900">
                  <span className="h-5 w-1 rounded-full bg-blue-600"></span>
                  Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Medicine Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('medicineName', { required: 'Medicine name is required' })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="e.g., Amoxicillin"
                    />
                    {errors.medicineName && (
                      <p className="mt-1 text-sm text-red-500">{errors.medicineName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dosage Information */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="mb-4 flex items-center gap-2 font-medium text-slate-900">
                  <span className="h-5 w-1 rounded-full bg-blue-600"></span>
                  Dosage Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Dosage Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('dosageValue', {
                        required: 'Dosage value is required',
                        min: { value: 0, message: 'Dosage must be positive' }
                      })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="500"
                    />
                    {errors.dosageValue && (
                      <p className="mt-1 text-sm text-red-500">{errors.dosageValue.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('dosageUnit', { required: 'Unit is required' })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      <option value="">Select unit</option>
                      {dosageUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    {errors.dosageUnit && (
                      <p className="mt-1 text-sm text-red-500">{errors.dosageUnit.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="mb-4 flex items-center gap-2 font-medium text-slate-900">
                  <span className="h-5 w-1 rounded-full bg-blue-600"></span>
                  Schedule
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('startDate', { required: 'Start date is required' })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      End Date <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Frequency
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFrequencyType('daily')}
                      className={`flex-1 rounded-lg border px-3 py-2 transition-all font-medium text-sm ${
                        frequencyType === 'daily'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-blue-500'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequencyType('custom')}
                      className={`flex-1 rounded-lg border px-3 py-2 transition-all font-medium text-sm ${
                        frequencyType === 'custom'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-blue-500'
                      }`}
                    >
                      Custom Interval
                    </button>
                  </div>
                </div>

                {frequencyType === 'daily' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Times per day
                    </label>
                    <select
                      {...register('timesPerDay')}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num} time{num > 1 ? 's' : ''} per day</option>
                      ))}
                    </select>
                  </div>
                )}

                {frequencyType === 'custom' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Interval (hours)
                    </label>
                    <input
                      type="number"
                      {...register('interval')}
                      min="1"
                      max="24"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="e.g., 8"
                    />
                  </div>
                )}
              </div>

              {/* Time of Day */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="mb-4 flex items-center gap-2 font-medium text-slate-900">
                  <span className="h-5 w-1 rounded-full bg-blue-600"></span>
                  Time of Day
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {timeOfDayOptions.map(option => (
                    <label key={option.value} className="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-500">
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register('timeOfDay')}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 flex items-center gap-2">
                        <span className="text-xl">{option.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{option.label}</span>
                        <span className="text-xs text-slate-400">{option.time}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Special Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  {...register('instructions')}
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  placeholder="e.g., Take with food, avoid alcohol..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end space-x-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white transition-colors duration-200 font-medium"
              >
                Add Medication
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicationModal;