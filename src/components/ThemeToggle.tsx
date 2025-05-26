import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  onUpdateTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onUpdateTheme }) => {
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      case 'system':
        return <Monitor size={18} />;
    }
  };

  const getNextTheme = () => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      case 'system':
        return 'light';
    }
  };

  return (
    <button
      onClick={() => onUpdateTheme(getNextTheme())}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;