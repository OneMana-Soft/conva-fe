import React, { useEffect, useState } from 'react';
import LogoDarkMode from '../../assets/logo_dark_mode.svg';
import LogoLightMode from '../../assets/logo_light_mode.svg';

interface LogoProps {
  width: string;
  height: string;
}

const Logo: React.FC<LogoProps> = ({ width, height }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const isDark = document.body.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    const handleDarkModeChange = () => {
      const isDark = document.body.classList.contains('dark');
      setDarkMode(isDark);
    };

    document.body.addEventListener('toggleDarkMode', handleDarkModeChange);

    return () => {
      document.body.removeEventListener('toggleDarkMode', handleDarkModeChange);
    };
  }, []);

  return (
    <img
      src={darkMode ? LogoDarkMode : LogoLightMode}
      alt="Logo"
      className={`w-${width} h-${height}`}
    />
  );
};

export default Logo;
