import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

const MedicalHistory = ({ onNext, onBack, defaultData }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultData || {
      pastDiseases: [{ disease: '', year: '', status: 'recovered' }],
      chronicConditions: ['']
    }
  });

  const { fields: diseaseFields, append: appendDisease, remove: removeDisease } = useFieldArray({
    control,
    name: 'pastDiseases'
  });

  const [chronicInput, setChronicInput] = useState('');
  const [chronicConditions, setChronicConditions] = useState(defaultData?.chronicConditions || []);

  const addChronicCondition = () => {
    if (chronicInput.trim()) {
      setChronicConditions([...chronicConditions, chronicInput.trim()]);
      setChronicInput('');
    }
  };

  const removeChronicCondition = (index) => {
    setChronicConditions(chronicConditions.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    onNext({
      ...data,
      chronicConditions
    });
  };

  const currentYear = new Date().getFullYear();

  const commonChronicConditions = [
    'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 
    'Heart Disease', 'COPD', 'Cancer', 'Alzheimer\'s',
    'Osteoporosis', 'Thyroid Disorder', 'Epilepsy', 'Depression'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header with icon */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
          <p className="text-sm text-gray-500">Help us understand your health background</p>
        </div>
      </div>
      
      {/* Past Diseases */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full"></span>
          Past Diseases & Surgeries
        </h3>
        
        {diseaseFields.map((field, index) => (
          <div key={field.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-700">Record #{index + 1}</h4>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeDisease(index)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disease/Surgery</label>
                <input
                  type="text"
                  {...register(`pastDiseases.${index}.disease`, { 
                    required: 'Disease name is required' 
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Appendicitis"
                />
                {errors.pastDiseases?.[index]?.disease && (
                  <p className="text-red-500 text-xs mt-1">{errors.pastDiseases[index].disease.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  {...register(`pastDiseases.${index}.year`, { 
                    required: 'Year is required',
                    min: { value: 1900, message: 'Invalid year' },
                    max: { value: currentYear, message: 'Year cannot be in the future' }
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="2020"
                />
                {errors.pastDiseases?.[index]?.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.pastDiseases[index].year.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  {...register(`pastDiseases.${index}.status`)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="recovered">Recovered</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => appendDisease({ disease: '', year: '', status: 'recovered' })}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Disease/Surgery
        </button>
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
          Chronic Conditions
        </h3>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={chronicInput}
              onChange={(e) => setChronicInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., Diabetes, Hypertension, Asthma"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChronicCondition())}
            />
          </div>
          <button
            type="button"
            onClick={addChronicCondition}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300"
          >
            Add
          </button>
        </div>

        {/* Common conditions quick add */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Common conditions:</p>
          <div className="flex flex-wrap gap-2">
            {commonChronicConditions.map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => {
                  if (!chronicConditions.includes(condition)) {
                    setChronicConditions([...chronicConditions, condition]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chronicConditions.includes(condition)
                    ? 'bg-purple-100 text-purple-700 cursor-default'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={chronicConditions.includes(condition)}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {chronicConditions.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Your Chronic Conditions:</h4>
            <div className="flex flex-wrap gap-2">
              {chronicConditions.map((condition, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 shadow-sm group hover:border-red-200 transition-all"
                >
                  {condition}
                  <button
                    type="button"
                    onClick={() => removeChronicCondition(index)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="group px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
        >
          Next Step
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MedicalHistory;