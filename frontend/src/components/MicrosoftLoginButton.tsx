import React from 'react';
import { FaMicrosoft } from 'react-icons/fa';

interface MicrosoftLoginButtonProps {
  className?: string;
}

const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({ className = '' }) => {
  const handleLogin = () => {
    // Redirect to backend endpoint which handles the OAuth flow
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    if (!apiUrl.endsWith('/api')) {
      apiUrl += '/api';
    }
    window.location.href = `${apiUrl}/auth/microsoft`;
  };

  return (
    <button
      onClick={handleLogin}
      className={`w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white py-3 px-4 rounded-xl font-semibold transition-all border border-gray-700 hover:border-gray-500 ${className}`}
    >
      <FaMicrosoft className="text-xl" />
      <span>Continue with Microsoft</span>
    </button>
  );
};

export default MicrosoftLoginButton;
