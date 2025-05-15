import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isBefore,
  addMonths,
  subMonths,
} from 'date-fns';

const ClientDashboard = () => {
  const [transactionType, setTransactionType] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [dynamicRequirements, setDynamicRequirements] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const requirementList = [
    "Application for Permits and License (APL) Form",
    "Medical Certificate",
    "Practical Driving Course (PDC)",
    "Valid Student-Driver's Permit",
    "Valid Non-Professional Driver's License",
    "Parent or guardian's consent with valid goverment I.D. with signature.",
    "PSA Birth Certificate",
  ];

  const transactionRequirements: { [key: string]: string[] } = {
    "NON-PROFESSIONAL DRIVER LICENSE APPLICATION": [
      "Application for Permits and License (APL) Form",
      "Medical Certificate",
      "Practical Driving Course (PDC)",
      "Valid Student-Driver's Permit",
      "PSA Birth Certificate",
    ],
    "PROFESSIONAL DRIVER LICENSE APPLICATION": [
      "Application for Permits and License (APL) Form",
      "Medical Certificate",
      "Practical Driving Course (PDC)",
      "Valid Non-Professional Driver's License",
      "PSA Birth Certificate",
    ],
    "ADDING RESTRICTION": [
      "Application for Permits and License (APL) Form",
      "Medical Certificate",
      "Practical Driving Course (PDC)",
    ],
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024

  const handleFileChange = (index: number, file: File | null) => {
    if (file && file.size > MAX_FILE_SIZE) {
      alert("File size exceeds the 5MB limit. Please choose a smaller file.");
      return;
    }
  
    const updatedFiles = [...uploadedFiles];
    updatedFiles[index] = file;
    setUploadedFiles(updatedFiles);
  };
  

  interface User {
    first_name?: string;
    middle_initial?: string;
    last_name?: string;
    email?: string;
    contact_number?: string;
    ltms_number?: string;
    birthdate?: string;
  }
  

  const timeSlots = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
  ];

  const transactionOptions = [
    'NON-PROFESSIONAL DRIVER LICENSE APPLICATION',
    'PROFESSIONAL DRIVER LICENSE APPLICATION',
    'ADDING RESTRICTION',
  ];

  const today = new Date();
  const isNextEnabledStep1 = selectedDate && selectedTimeSlot;
  const isNextEnabledStep2 =
  user?.first_name &&
  user?.last_name &&
  user?.birthdate &&
  user?.contact_number &&
  user?.ltms_number &&
  user?.email;
  const isSubmitEnabled =
  transactionType &&
  dynamicRequirements.length > 0 &&
  uploadedFiles.length === dynamicRequirements.length &&
  uploadedFiles.every(file => file instanceof File);


  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !transactionType || !user) {
      alert('Please fill in all required fields.');
      return;
    }
  
    // Validate uploaded files
    if (uploadedFiles.length !== dynamicRequirements.length || uploadedFiles.some(file => !file)) {
      alert('Please upload all required files.');
      return;
    }
  
    const requestId = uuidv4();
    const formatDateToMySQL = (date) => {
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    const requestDate = formatDateToMySQL(new Date());
    
    const appointmentDate = selectedDate.toISOString().split('T')[0];
  
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    };
  
    const appointmentTime = parseTime(selectedTimeSlot.split('-')[0].trim());
  
    // Optional: Convert files to base64 or handle upload separately
    const uploadedFileNames = uploadedFiles.map(file => file?.name || '').join(', ');
  
    const payload = {
      request_id: requestId,
      client_id: user.id,    // Ensure `user` has `id`
      user_id: user.id,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      transaction_type: transactionType,
      request_date: requestDate,
      status: 'pending',
      uploaded_files: uploadedFileNames, // Adjust based on how backend stores files
    };
  
    try {
      const response = await fetch('http://localhost:8080/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit appointment');
      }
  
      alert('Appointment successfully submitted!');
      
      // Optionally reset form or navigate to another page
      setStep(1);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setTransactionType('');
      setUploadedFiles([]);
      setDynamicRequirements([]);
      navigate('/appointments/confirmation'); // or any route
    } catch (error: any) {
      alert('Error submitting appointment: ' + error.message);
    }

    localStorage.setItem('appointmentData', JSON.stringify(payload));
    navigate('/appointments');

  };
  

  

  useEffect(() => {
    if (step === 2) {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      } else {
        navigate('/signin');
      }      
    }
  }, [step, navigate]);

  useEffect(() => {
    const requirements = transactionRequirements[transactionType] || [];
    setDynamicRequirements(requirements);
    setUploadedFiles(Array(requirements.length).fill(null));
  }, [transactionType]);

  

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDay = monthStart.getDay();
    const days = [];

    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);
    let day = new Date(monthStart);

    while (day <= monthEnd) {
      const currentDay = new Date(day);
      const formatted = format(currentDay, 'yyyy-MM-dd');
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
      const isDisabled = isBefore(currentDay, today);

      days.push(
        <div
          key={formatted}
          onClick={() => !isDisabled && setSelectedDate(new Date(currentDay))}
          className={`p-2 m-1 rounded text-center border text-sm ${
            isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-100 hover:bg-green-200 cursor-pointer'
          } ${isSelected ? 'ring-2 ring-green-600' : ''}`}
        >
          {format(currentDay, 'd')}
        </div>
      );

      day.setDate(day.getDate() + 1);
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderStep1 = () => (
    <div>
      <div className="flex gap-4">
  {/* Time Picker (25% fixed width) */}

  <div  className="w-1/4 min-h-full max-h-full space-y-2">
        <p>
          <strong>Date:</strong>{' '}
          {selectedDate ? format(selectedDate, 'MM/dd/yyyy') : ''}
        </p>
        <p>
          <strong>Time:</strong>{' '}
          {selectedTimeSlot || ''}
        </p>
        <div>
    {selectedDate ? (
      timeSlots.map(slot => (
        <button
          key={slot}
          onClick={() => setSelectedTimeSlot(slot)}
          className={`w-full p-2 border rounded text-sm ${
            selectedTimeSlot === slot
              ? 'bg-green-500 text-white'
              : 'bg-white hover:bg-green-100'
          }`}
        >
          {slot}
        </button>
      ))
    ) : (
      <div className="min-h-full max-h-full min-w-full max-w-full" /> // Optional empty filler
    )}
        </div>
      </div>


  {/* Calendar (75% fixed width) */}
  <div className="w-3/4">
    <div className="flex justify-between items-center mb-2">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
      <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
    </div>
    {renderCalendar()}
  </div>
</div>

    </div>
  );
  
  const renderStep2 = () => (
    <div>
      <p className="mb-2">Date: {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : '-'}</p>
      <p className="mb-4">Time: {selectedTimeSlot || '-'}</p>
  
      {user ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Personal Informations</h3>
          <div className="space-y-1 text-sm">
            <p><strong>First Name:</strong> {user.first_name ?? '-'}</p>
            <p><strong>Middle Initial:</strong> {user.middle_initial ?? '-'}</p>
            <p><strong>Last Name:</strong> {user.last_name ?? '-'}</p>
            <p><strong>Birthdate:</strong>{' '}
              {user.birthdate ? format(new Date(user.birthdate), 'yyyy-MM-dd') : '-'}
            </p>

            <p><strong>Contact Number:</strong> {user.contact_number ?? '-'}</p>
            <p><strong>LTMS Number:</strong> {user.ltms_number ?? '-'}</p>
            <p><strong>Email:</strong> {user.email ?? '-'}</p>
          </div>
        </div>
      ) : (
        <p className="text-red-600">User info not available.</p>
      )}
    </div>
  );
  

  const renderStep3 = () => (
    <div className="h-full">
      <h2 className="text-xl font-bold mb-2">Type of Transaction</h2>
      <select
        className="border p-2 w-full mb-2 text-md"
        value={transactionType}
        onChange={e => setTransactionType(e.target.value)}
      >
        <option value="">-- CHOOSE YOUR TRANSACTION --</option>
        {transactionOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
  
      <div className="text-sm text-gray-600">
        <p className="font-bold mb-2">Requirements:</p>
        <ul className="space-y-1">
          {dynamicRequirements.map((requirement, index) => (
            <li key={index} className="flex flex-col">

              <label className="flex items-center gap-1 cursor-pointer bg-white border border-gray-300 px-3 py-1 rounded shadow-sm text-sm hover:bg-gray-50">
                <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
                <span>
                  {uploadedFiles[index]?.name || requirement}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {uploadedFiles[index] && (
                <p className="text-green-600 text-xs mt-1">
                  Uploaded: {uploadedFiles[index]?.name}
                </p>
              )}
            </li>
          ))}
        </ul>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full">
  {/* Step Content (85%) */}
  <div className="h-[85%] p-4">
    {step === 1 && renderStep1()}
    {step === 2 && renderStep2()}
    {step === 3 && renderStep3()}
  </div>

  {/* Button Area (15%) */}
  <div className="h-[15%] w-full flex justify-end items-center px-4 py-2">
    <div className="min-w-1/4 max-w-1/4 flex justify-start items-center">
    </div>
    <div className="min-w-3/4 max-w-3/4 flex justify-end items-center">
    <div className="flex w-full">
    <button
      onClick={handleBack}
      disabled={step === 1}
      className={`w-1/2 py-2 rounded ${step === 1 ? 'bg-gray-300' : 'bg-gray-500 text-white'}`}
    >
      Back
    </button>

    {step === 1 && (
      <button
        onClick={handleNext}
        disabled={!isNextEnabledStep1}
        className={`w-1/2 py-2 rounded ${isNextEnabledStep1 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
      >
        Next
      </button>
    )}

    {step === 2 && (
      <button
        onClick={handleNext}
        disabled={!isNextEnabledStep2}
        className={`w-1/2 py-2 rounded ${isNextEnabledStep2 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
      >
        Next
      </button>
    )}

    {step === 3 && (
      <button
      onClick={handleSubmit}
      disabled={!isSubmitEnabled}
      className={`w-1/2 py-2 rounded text-white ${
        isSubmitEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
      }`}
    >
      Submit
    </button>
    
    )}
    </div>
    </div>
  </div>
</div>


  );
  
};

export default ClientDashboard;
