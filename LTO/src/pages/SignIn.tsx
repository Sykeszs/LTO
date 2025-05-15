import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignIn = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send sign-in request to server
      const res = await axios.post('http://localhost:8080/signin', { email, password });

      // Store the JWT token and user info in localStorage
      localStorage.setItem('token', res.data.token);

      // Get user info after login using the userId returned by the sign-in request
      const userRes = await axios.get(`http://localhost:8080/users/${res.data.userId}`, {
        headers: {
          Authorization: `Bearer ${res.data.token}`,
        },
      });      

      // Store user information in localStorage or context
      localStorage.setItem('user', JSON.stringify(userRes.data));

      // Call the onLogin callback to update authentication state
      onLogin();

      // Navigate to the profile page
      navigate('/Dashboard');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSignIn} className=" rounded w-full max-w-4xl mx-auto">
      <h1 className="text-md font-bold text-start">Sign In</h1>

      <div className="flex flex-col md:flex-row gap-1 items-start justify-start">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-gray-300 text-sm rounded w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 border border-gray-300 text-sm rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-gray-900 text-white px-6 rounded hover:bg-gray-700 whitespace-nowrap"
        >
          Login
        </button>
      </div>

      {message && <p className="text-center mt-4 text-red-500">{message}</p>}
    </form>
  );
};

export default SignIn;
