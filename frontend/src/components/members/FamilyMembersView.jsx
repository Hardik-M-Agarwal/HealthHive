import React from 'react';
import { useAuth } from '../../context/AuthContext';

const FamilyMembersView = ({ familyMembers, familyDetails }) => {
  const { user } = useAuth();

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{familyDetails?.familyName}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'} in your family
            </p>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {familyMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Top accent strip based on role */}
            <div className={`h-1 w-full ${member.role === 'admin' ? 'bg-blue-600' : 'bg-slate-200'}`} />

            <div className="p-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{member.email}</p>
                </div>
              </div>

              {/* Role badge */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  member.role === 'admin'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {member.role === 'admin' ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Admin
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Member
                    </>
                  )}
                </span>

                {member._id === user?.id && (
                  <span className="text-xs text-slate-400 font-medium">You</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMembersView;   