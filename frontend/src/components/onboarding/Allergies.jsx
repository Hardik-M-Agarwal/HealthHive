import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const Allergies = ({ onNext, onBack, defaultData }) => {
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues: defaultData });
  const [allergyInput, setAllergyInput] = useState('');
  const allergies = watch('allergies') || [];

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setValue('allergies', [...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const removeAllergy = (index) => setValue('allergies', allergies.filter((_, i) => i !== index));

  const commonAllergies = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Penicillin', 'Aspirin', 'Pollen', 'Dust Mites', 'Pet Dander', 'Latex'];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Allergies & Sensitivities</h2>
          <p className="text-sm text-slate-500">Help us identify potential allergic reactions</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Add Allergies (Food, Medicine, Environmental)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Peanuts, Penicillin, Pollen"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
              />
            </div>
            <button type="button" onClick={addAllergy} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200">
              Add
            </button>
          </div>
        </div>

        {/* Common allergies */}
        <div>
          <p className="text-sm text-slate-500 mb-2">Common allergies:</p>
          <div className="flex flex-wrap gap-2">
            {commonAllergies.map((allergy) => (
              <button
                key={allergy}
                type="button"
                onClick={() => { if (!allergies.includes(allergy)) setValue('allergies', [...allergies, allergy]); }}
                disabled={allergies.includes(allergy)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  allergies.includes(allergy)
                    ? 'bg-blue-100 text-blue-700 cursor-default'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Allergies list */}
      {allergies.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your Allergies ({allergies.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 shadow-sm">
                {allergy}
                <button type="button" onClick={() => removeAllergy(index)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-yellow-50 rounded-xl p-4 flex items-start gap-3 border border-yellow-100">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-yellow-700">This information is crucial for emergency situations and will be highlighted in your emergency profile.</p>
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="group px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 flex items-center gap-2">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button type="submit" className="group px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2">
          Next Step
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default Allergies;