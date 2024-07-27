import { Outlet, Navigate } from 'react-router-dom';
import { URL_LOGIN } from '../constants/routes/appNavigation';
import profileService from "../services/ProfileService.ts";
import {checkRefreshCookieExists} from "./Helper.ts";

function ProtectedRoutes() {

//   const selector = useSelector((state) => state.user);

//   const isAuthenticated = !!(selector.id && selector.name && selector.email && selector.phoneNumber);
  // const isAuthenticated = localStorage.getItem("isAuthenticated", 'true');
  // console.log(isAuthenticated, 'is auth');


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
    // for now its accessible by hardcoading locally
      ( isError === undefined && userData !== undefined && userData.data.postgres.user_name !== '') ? <Outlet /> : <Navigate to={URL_LOGIN} />
  );
}

export default ProtectedRoutes;