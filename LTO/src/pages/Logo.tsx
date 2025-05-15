import React from 'react';
import LTOLogo from '../assets/LTO.png'; 

const Logo = () => {
  return (
    <div className="flex items-start space-x-4">
      <img src={LTOLogo} alt="App Logo" className="w-24 h-24" />
      <div className="leading-tight text-md text-gray-800 uppercase py-2">
        <p className="text-sm">Department of Transportation</p>
        <p className="font-bold">Land Transportation Office</p>
        <p>Naic, Cavite</p>
      </div>
    </div>
  );
};

export default Logo;
