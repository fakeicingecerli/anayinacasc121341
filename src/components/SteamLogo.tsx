
import React from 'react';

interface SteamLogoProps {
  className?: string;
}

const SteamLogo: React.FC<SteamLogoProps> = ({ className = "" }) => {
  return (
    <img 
      src="/lovable-uploads/dd61aa68-1534-4089-b154-6d063758d1a1.png" 
      alt="Steam Logo" 
      className={`h-12 ${className}`}
    />
  );
};

export default SteamLogo;
