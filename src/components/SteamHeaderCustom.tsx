
import React from 'react';
import SteamLogo from './SteamLogo';

const SteamHeaderCustom = () => {
  return (
    <header className="bg-[#171a21]/70 backdrop-blur-sm w-full py-4 shadow-md z-10">
      <div className="container mx-auto flex justify-between items-center px-4">
        <SteamLogo />
        
        <div className="flex space-x-4 text-sm">
          <a href="#" className="text-white/80 hover:text-white">Mağaza</a>
          <a href="#" className="text-white/80 hover:text-white">Topluluk</a>
          <a href="#" className="text-white/80 hover:text-white">Destek</a>
        </div>
      </div>
    </header>
  );
};

export default SteamHeaderCustom;
