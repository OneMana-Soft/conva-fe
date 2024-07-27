import { Outlet, Navigate } from 'react-router-dom';
import { URL_LOGIN, URL_CHANNEL } from '../constants/routes/appNavigation';
import profileService from "../services/ProfileService.ts";
import {checkRefreshCookieExists} from "./Helper.ts";

function OnboardingRoutes() {

  const refreshTokenExist  = checkRefreshCookieExists()

  if(!refreshTokenExist) {
    return (<Navigate to={URL_LOGIN} />)
  }


  const {userData, isLoading, isError} = profileService.getBasicSelfUserProfile()

  if(isLoading) {
    return(
        <div>LOADING</div>
    )
  }

  return (
      (isError === undefined && userData !== undefined && userData.data.postgres.Id !== '' )? (userData?.data.postgres.user_name == '' ? <Outlet /> : <Navigate to={URL_CHANNEL}/> ) : <Navigate to={URL_LOGIN} />
  );
}

export default OnboardingRoutes;