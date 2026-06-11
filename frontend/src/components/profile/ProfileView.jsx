import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import onboardingService from '../../services/onboardingService';
import toast from 'react-hot-toast';

// ─── Reusable inline-edit section wrapper ───────────────────────────────────
const Section = ({ title, icon, children, onEdit, editing, onSave, onCancel, saving }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {!editing ? (
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
          >
            {saving ? (
              <><svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
            ) : 'Save'}
          </button>
        </div>
      )}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// ─── Field display helpers ───────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-400 font-normal">—</span>}</p>
  </div>
);

const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm";
const labelClass = "block text-xs font-medium text-slate-500 mb-1";

// ─── Tag chip ────────────────────────────────────────────────────────────────
const Tag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
    {label}
    {onRemove && (
      <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors ml-0.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </span>
);

// ════════════════════════════════════════════════════════════════════════════
const ProfileView = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-section edit state
  const [editSection, setEditSection] = useState(null); // 'basic' | 'allergies' | 'history' | 'contacts'
  const [saving, setSaving] = useState(false);

  // Draft state for each section
  const [draftBasic, setDraftBasic] = useState({});
  const [draftAllergies, setDraftAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [draftHistory, setDraftHistory] = useState({ pastDiseases: [], chronicConditions: [] });
  const [chronicInput, setChronicInput] = useState('');
  const [draftContacts, setDraftContacts] = useState([]);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await onboardingService.getHealthProfile();
      setProfile(res.healthProfile);
    } catch (err) {
      toast.error('Failed to load health profile');
    } finally {
      setLoading(false);
    }
  };

  // ── Open edit for a section ──────────────────────────────────────────────
  const openEdit = (section) => {
    if (section === 'basic') {
      setDraftBasic({
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        bloodGroup: profile.bloodGroup || '',
        height: profile.height || '',
        weight: profile.weight || '',
      });
    } else if (section === 'allergies') {
      setDraftAllergies([...(profile.allergies || [])]);
      setAllergyInput('');
    } else if (section === 'history') {
      setDraftHistory({
        pastDiseases: (profile.pastDiseases || []).map(d => ({ ...d })),
        chronicConditions: [...(profile.chronicConditions || [])],
      });
      setChronicInput('');
    } else if (section === 'contacts') {
      setDraftContacts((profile.emergencyContacts || []).map(c => ({ ...c })));
    }
    setEditSection(section);
  };

  const cancelEdit = () => setEditSection(null);

  // ── Save a section ───────────────────────────────────────────────────────
  const saveSection = async (section) => {
    try {
      setSaving(true);
      let payload = {};

      if (section === 'basic') {
        payload = { ...draftBasic };
      } else if (section === 'allergies') {
        payload = { allergies: draftAllergies };
      } else if (section === 'history') {
        payload = {
          pastDiseases: draftHistory.pastDiseases,
          chronicConditions: draftHistory.chronicConditions,
        };
      } else if (section === 'contacts') {
        payload = { emergencyContacts: draftContacts };
      }

      const res = await onboardingService.updateHealthProfile({ ...profile, ...payload });
      setProfile(res.healthProfile);
      setEditSection(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Allergy helpers ──────────────────────────────────────────────────────
  const addAllergy = () => {
    const val = allergyInput.trim();
    if (val && !draftAllergies.includes(val)) {
      setDraftAllergies([...draftAllergies, val]);
      setAllergyInput('');
    }
  };

  // ── Chronic condition helpers ────────────────────────────────────────────
  const addChronic = () => {
    const val = chronicInput.trim();
    if (val && !draftHistory.chronicConditions.includes(val)) {
      setDraftHistory(h => ({ ...h, chronicConditions: [...h.chronicConditions, val] }));
      setChronicInput('');
    }
  };

  // ── Past disease helpers ─────────────────────────────────────────────────
  const updateDisease = (idx, field, value) => {
    setDraftHistory(h => {
      const diseases = [...h.pastDiseases];
      diseases[idx] = { ...diseases[idx], [field]: value };
      return { ...h, pastDiseases: diseases };
    });
  };

  const removeDisease = (idx) => {
    setDraftHistory(h => ({ ...h, pastDiseases: h.pastDiseases.filter((_, i) => i !== idx) }));
  };

  const addDisease = () => {
    setDraftHistory(h => ({ ...h, pastDiseases: [...h.pastDiseases, { disease: '', year: '', status: 'recovered' }] }));
  };

  // ── Emergency contact helpers ────────────────────────────────────────────
  const updateContact = (idx, field, value) => {
    setDraftContacts(cs => {
      const updated = [...cs];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeContact = (idx) => setDraftContacts(cs => cs.filter((_, i) => i !== idx));
  const addContact = () => setDraftContacts(cs => [...cs, { name: '', relationship: '', phone: '' }]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No health profile found</h3>
        <p className="text-slate-500 text-sm">Complete onboarding to set up your profile</p>
      </div>
    );
  }

  const age = calcAge(profile.dateOfBirth);

  return (
    <div className="space-y-6">

      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">
                {user?.role}
              </span>
              {age && (
                <span className="text-xs text-slate-500">{age} years old</span>
              )}
              {profile.bloodGroup && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                  🩸 {profile.bloodGroup}
                </span>
              )}
              {user?.phoneNumber && (
                <span className="text-xs text-slate-500">📞 {user.phoneNumber}</span>
              )}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Last updated</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(profile.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* ── Basic Info ─────────────────────────────────────────────────── */}
      <Section
        title="Basic Health Information"
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        editing={editSection === 'basic'}
        onEdit={() => openEdit('basic')}
        onSave={() => saveSection('basic')}
        onCancel={cancelEdit}
        saving={saving}
      >
        {editSection === 'basic' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" value={draftBasic.dateOfBirth} onChange={e => setDraftBasic(d => ({ ...d, dateOfBirth: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Blood Group <span className="text-red-500">*</span></label>
              <select value={draftBasic.bloodGroup} onChange={e => setDraftBasic(d => ({ ...d, bloodGroup: e.target.value }))} className={inputClass}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Height</label>
              <div className="relative">
                <input type="number" step="0.1" value={draftBasic.height} onChange={e => setDraftBasic(d => ({ ...d, height: e.target.value }))} className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" placeholder="170" />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">cm</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Weight</label>
              <div className="relative">
                <input type="number" step="0.1" value={draftBasic.weight} onChange={e => setDraftBasic(d => ({ ...d, weight: e.target.value }))} className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" placeholder="70" />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">kg</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <Field label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
            <Field label="Blood Group" value={profile.bloodGroup} />
            <Field label="Height" value={profile.height ? `${profile.height} cm` : null} />
            <Field label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
          </div>
        )}
      </Section>

      {/* ── Allergies ──────────────────────────────────────────────────── */}
      <Section
        title="Allergies & Sensitivities"
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        editing={editSection === 'allergies'}
        onEdit={() => openEdit('allergies')}
        onSave={() => saveSection('allergies')}
        onCancel={cancelEdit}
        saving={saving}
      >
        {editSection === 'allergies' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={e => setAllergyInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                className={inputClass + ' flex-1'}
                placeholder="Type an allergy and press Enter or Add"
              />
              <button type="button" onClick={addAllergy} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Add</button>
            </div>
            {draftAllergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {draftAllergies.map((a, i) => (
                  <Tag key={i} label={a} onRemove={() => setDraftAllergies(arr => arr.filter((_, idx) => idx !== i))} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No allergies added yet</p>
            )}
          </div>
        ) : (
          profile.allergies?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((a, i) => <Tag key={i} label={a} />)}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No known allergies</p>
          )
        )}
      </Section>

      {/* ── Medical History ────────────────────────────────────────────── */}
      <Section
        title="Medical History"
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        editing={editSection === 'history'}
        onEdit={() => openEdit('history')}
        onSave={() => saveSection('history')}
        onCancel={cancelEdit}
        saving={saving}
      >
        {editSection === 'history' ? (
          <div className="space-y-6">
            {/* Past Diseases edit */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Past Diseases & Surgeries
              </h4>
              <div className="space-y-3">
                {draftHistory.pastDiseases.map((d, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 items-end">
                    <div>
                      <label className={labelClass}>Disease/Surgery</label>
                      <input type="text" value={d.disease} onChange={e => updateDisease(i, 'disease', e.target.value)} className={inputClass} placeholder="e.g., Appendicitis" />
                    </div>
                    <div>
                      <label className={labelClass}>Year</label>
                      <input type="number" value={d.year} onChange={e => updateDisease(i, 'year', e.target.value)} className={inputClass} placeholder="2020" />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className={labelClass}>Status</label>
                        <select value={d.status} onChange={e => updateDisease(i, 'status', e.target.value)} className={inputClass}>
                          <option value="recovered">Recovered</option>
                          <option value="ongoing">Ongoing</option>
                        </select>
                      </div>
                      {draftHistory.pastDiseases.length > 1 && (
                        <button type="button" onClick={() => removeDisease(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDisease} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Disease/Surgery
              </button>
            </div>

            {/* Chronic Conditions edit */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Chronic Conditions
              </h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={chronicInput}
                  onChange={e => setChronicInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addChronic())}
                  className={inputClass + ' flex-1'}
                  placeholder="Type a condition and press Enter or Add"
                />
                <button type="button" onClick={addChronic} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Add</button>
              </div>
              {draftHistory.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {draftHistory.chronicConditions.map((c, i) => (
                    <Tag key={i} label={c} onRemove={() => setDraftHistory(h => ({ ...h, chronicConditions: h.chronicConditions.filter((_, idx) => idx !== i) }))} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No chronic conditions added</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Past Diseases view */}
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Past Diseases & Surgeries
              </h4>
              {profile.pastDiseases?.length > 0 ? (
                <div className="space-y-2">
                  {profile.pastDiseases.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{d.disease}</p>
                          <p className="text-xs text-slate-400">{d.year}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        d.status === 'recovered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {d.status === 'recovered' ? 'Recovered' : 'Ongoing'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No past diseases recorded</p>
              )}
            </div>

            {/* Chronic Conditions view */}
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Chronic Conditions
              </h4>
              {profile.chronicConditions?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.chronicConditions.map((c, i) => <Tag key={i} label={c} />)}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No chronic conditions recorded</p>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Emergency Contacts ─────────────────────────────────────────── */}
      <Section
        title="Emergency Contacts"
        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
        editing={editSection === 'contacts'}
        onEdit={() => openEdit('contacts')}
        onSave={() => saveSection('contacts')}
        onCancel={cancelEdit}
        saving={saving}
      >
        {editSection === 'contacts' ? (
          <div className="space-y-3">
            {draftContacts.map((c, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 items-end">
                <div>
                  <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} className={inputClass} placeholder="John Doe" />
                </div>
                <div>
                  <label className={labelClass}>Relationship <span className="text-red-500">*</span></label>
                  <select value={c.relationship} onChange={e => updateContact(i, 'relationship', e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    {['Spouse', 'Parent', 'Sibling', 'Child', 'Guardian', 'Relative', 'Friend', 'Neighbor', 'Doctor', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} className={inputClass} placeholder="+1 234 567 8900" />
                  </div>
                  {draftContacts.length > 1 && (
                    <button type="button" onClick={() => removeContact(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addContact} className="mt-1 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Another Contact
            </button>
          </div>
        ) : (
          profile.emergencyContacts?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.emergencyContacts.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.relationship}</p>
                    <p className="text-xs text-slate-500 font-medium">{c.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No emergency contacts added</p>
          )
        )}
      </Section>

    </div>
  );
};

export default ProfileView;