// LoginPage.tsx
import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import LoginButton from '../../components/Buttons/LoginButton';
import Logo from '../../components/Logos/OrganizationLogo';

import {URL_CHANNEL, URL_ONBOARDING} from "../../constants/routes/appNavigation.ts";
import { Navigate } from 'react-router-dom';
import profileService from "../../services/ProfileService.ts";
import {checkRefreshCookieExists} from "../../utils/Helper.ts";
import {useDispatch, useSelector} from "react-redux";
import {updateRefreshTokenStatus} from "../../store/slice/refreshSlice.ts";
import {RootState} from "../../store/store.ts";


const LoginPage: React.FC = () => {


  const dispatch=useDispatch();
  dispatch(updateRefreshTokenStatus({exist: checkRefreshCookieExists()}))

  const refreshTokenExist  = useSelector((state:RootState)=>state.refresh.exist)

  const [loading, setLoading] = useState(false);

  if(refreshTokenExist) {
    const {userData, isLoading, isError} = profileService.getBasicSelfUserProfile()

    if(isLoading) {
      return(
          <div>LOADING</div>
      )
    }

    if(isError === undefined &&  userData !== undefined && userData.data.postgres.Id !== '' && userData.data.postgres.user_name === '') {
      return ( <Navigate to={URL_ONBOARDING}/>)
    }

    if(isError === undefined && userData !== undefined && userData.data.postgres.Id !== '' && userData.data.postgres.user_name !== '') {
      return ( <Navigate to={URL_CHANNEL}/>)
    }
  }


  const providers: {
    [key: string]: {
      name: string;
      action: () => Promise<void>;
      iconUrl: string;
    };
  } = {
    google: {
      name: 'Google',
      action: AuthService.loginWithGoogle,
      iconUrl: 'https://www.svgrepo.com/show/475656/google-color.svg',
    },
    github: {
      name: 'Github',
      action: AuthService.loginWithGithub,
      iconUrl: 'https://www.svgrepo.com/show/452211/github.svg',
    },
  };

  const handleLogin = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
    } catch (error) {
      console.error('Error logging in:', error);
      // Handle error, show error message, etc.
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='flex flex-col items-center justify-center h-screen dark:bg-gray-800 dark:text-slate-200 p-10'>
      <div className='mb-20 md:mb-14'>
        <Logo width='1' height='1' />
      </div>
      {Object.entries(providers).map(([providerKey, provider]) => (
        <div key={providerKey} className='mb-7'>
          <LoginButton
            providerName={provider.name}
            loading={loading}
            onLogin={() => handleLogin(provider.action)}
            iconUrl={provider.iconUrl}
          />
        </div>
      ))}
    </div>
  );
};

export default LoginPage;
