import React from 'react';

interface LoginButtonProps {
  providerName: string;
  loading: boolean;
  onLogin: () => Promise<void>;
  iconUrl: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ providerName, loading, onLogin, iconUrl}) => {
  

  const handleClick = async () => {
    if (!loading) {
      await onLogin();
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className='py-3 px-4 md:px-8 md:py-4 border flex items-center gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-xl text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150'>
      <img className="w-7 md:w-10 md:mr-4" src={iconUrl} loading="lazy" alt={`${providerName} logo`} />
      <div className="text-md">{loading ? 'Logging in...' : `Login with ${providerName}`}</div>
    </button>
  );
};

export default LoginButton;
