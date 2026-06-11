import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const EditAppointmentModal = ({ isOpen, onClose, onSubmit, appointment }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (appointment) {
      const date = new Date(appointment.dateTime);
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = date.toTimeString().slice(0, 5);
      
      reset({
        doctorName: appointment.doctorName,
        clinic: appointment.clinic,
        date: formattedDate,
        time: formattedTime,
        notes: appointment.notes || ''
      });
    }
  }, [appointment, reset]);

  const handleFormSubmit = (data) => {
    const dateTime = new Date(`${data.date}T${data.time}`);
    
    const appointmentData = {
      doctorName: data.doctorName,
      clinic: data.clinic,
      dateTime: dateTime.toISOString(),
      notes: data.notes || ''
    };

    onSubmit(appointment._id, appointmentData);
  };

  if (!isOpen) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 z-40 transition-opacity" onClick={onClose}></div>

        <div className="relative z-50 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Edit Appointment</h3>
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
              {/* Doctor Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Doctor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('doctorName', { required: 'Doctor name is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Dr. Smith"
                />
                {errors.doctorName && (
                  <p className="text-red-500 text-sm mt-1">{errors.doctorName.message}</p>
                )}
              </div>

              {/* Clinic/Hospital */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Clinic / Hospital <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('clinic', { required: 'Clinic name is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="City Hospital"
                />
                {errors.clinic && (
                  <p className="text-red-500 text-sm mt-1">{errors.clinic.message}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    {...register('date', { required: 'Date is required' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register('time', { required: 'Time is required' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
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
                Update Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;