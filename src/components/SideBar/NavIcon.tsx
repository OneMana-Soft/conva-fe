import React from 'react';
import { useNavigate } from "react-router-dom";
import {URL_LOGOUT} from "../../constants/routes/appNavigation.ts";
import {useDispatch} from "react-redux";
import {updateSideBarState} from "../../store/slice/sidebarSlice.ts";

interface IconProps {
  children: JSX.Element;
  title?:string,
  path:string
}

const Icon: React.FC<IconProps> = ({ children,title,path }) => {

    const navigate=useNavigate();
    const dispatch=useDispatch();

    const handleClick = () => {

        if(path == URL_LOGOUT) {
            return
        }
        dispatch(updateSideBarState({active: true}))
        navigate(path)
    }

  return (
    <div onClick={handleClick}  className='flex flex-col gap-2 items-center '>
      <div className='flex c flex-col items-center justify-center w-full'>
        {children}
      </div>
      <div className='text-s md:text-xs font-medium text-black'>{title}</div>
    </div>
  );
};

export default Icon;
