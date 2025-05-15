import LTOLogo from '../assets/LTO.png'; // Adjust path as needed

const Logo = () => {
  return (
    <div className="flex items-center justify-between w-full px-10">
      <div className="flex items-center space-x-4">
        <img src={LTOLogo} alt="App Logo" className="w-20 h-20" />
        <div className="leading-tight text-md text-gray-800 uppercase py-2">
          <p className="text-sm">Department of Transportation</p>
          <p className="font-bold">Land Transportation Office</p>
          <p>Naic, Cavite</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800">
        <p>LTO NAIC ONLINE APPOINTMENT</p>
      </div>
    </div>
  );
};

export default Logo;
