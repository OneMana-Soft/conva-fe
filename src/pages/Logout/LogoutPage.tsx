import { useNavigate} from 'react-router-dom';
import profileService from "../../services/ProfileService.ts";
import React from "react";


const LogoutPage: React.FC = () => {


  const navigate = useNavigate()
  profileService.logout()
  localStorage.clear();
  sessionStorage.clear();

  navigate("/")


  return (<></>)
};

export default LogoutPage;
