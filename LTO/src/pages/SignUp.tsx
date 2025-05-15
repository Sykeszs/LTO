import React, { useState, useRef } from 'react';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    birthdate: '',
    contactNumber: '',
    ltmsNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const firstNameRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only allow numbers for contactNumber and ltmsNumber
    if ((name === 'contactNumber' || name === 'ltmsNumber') && !/^\d*$/.test(value)) {
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(formData.password)) {
      alert(
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      );
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Sign up failed: Password and Confirm Password do not match.');

      // Clear only password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/signup', formData);
      alert(res.data.message || 'Sign up successful!');

      // Clear all fields on success
      setFormData({
        firstName: '',
        middleInitial: '',
        lastName: '',
        birthdate: '',
        contactNumber: '',
        ltmsNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Focus on the first input field after reset
      firstNameRef.current?.focus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Sign up failed');

      // Clear only password fields on failure
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-2 sm:p-1 md:p-2 rounded shadow-md w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl space-y-1 max-h-full"
      >
        <h1 className="text-xl font-bold text-start mb-2">Sign Up</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border px-2 py-1 text-sm rounded"
            required
            ref={firstNameRef}
          />
          <input
            type="text"
            name="middleInitial"
            placeholder="Middle Initial"
            value={formData.middleInitial}
            onChange={handleChange}
            className="w-full border px-2 py-1 text-sm rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border px-2 py-1 text-sm rounded"
            required
          />
          <input
            type="date"
            name="birthdate"
            placeholder="Birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className="w-full border px-2 py-1 text-sm rounded"
            required
          />
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm rounded"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm rounded"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm rounded"
              required
            />
            <small className="text-xs text-gray-500">
              Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
            </small>
          </div>
          <div className="col-span-1 md:col-span-2">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm rounded"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              name="ltmsNumber"
              placeholder="LTMS Number"
              value={formData.ltmsNumber}
              onChange={handleChange}
              className="w-full border px-2 py-1 text-sm rounded"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-700 mt-4"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default SignUp;
