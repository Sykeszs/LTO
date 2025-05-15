// appointment.tsx
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';


interface AppointmentData {
  request_id: string;
  client_id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  transaction_type: string;
  request_date: string;
  status: string;
  uploaded_files: string;
}

const Appointment = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('appointmentData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          setAppointments(parsed);
        } else {
          setAppointments([parsed]); // Wrap single object in an array
        }
      } catch (err) {
        console.error("Failed to parse appointmentData:", err);
      }
    }
  }, []);  
  

  if (appointments.length === 0) {
    return <div className="p-4">No appointment data available.</div>;
  }
  
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Your Appointments</h1>
      {appointments.map((appointment, index) => (
        <div
          key={appointment.request_id || index}
          className="bg-white rounded shadow p-4 border"
        >
          <p><strong>Request ID:</strong> {appointment.request_id}</p>
          <p><strong>Transaction Type:</strong> {appointment.transaction_type}</p>
          <p><strong>Date:</strong> {format(new Date(appointment.appointment_date), 'MMMM dd, yyyy')}</p>
          <p><strong>Time:</strong> {appointment.appointment_time}</p>
          <p><strong>Status:</strong> {appointment.status}</p>
          <p><strong>Uploaded Files:</strong> {appointment.uploaded_files}</p>
        </div>
      ))}
    </div>
  );  
  
};

export default Appointment;
