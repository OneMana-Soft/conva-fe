import {Navigate} from 'react-router-dom';
import {
URL_LOGIN,
} from '../constants/routes/appNavigation';

import adminService from "../services/AdminService.ts";
import {closeAlertMsgPopup} from "../store/slice/popupSlice.ts";
import AlertMessageModal from "../components/Modals/AlertMessageModal.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/store.ts";

type Props = {
  children: JSX.Element;
};

const AuthLayout = ({ children }: Props) => {
    const adminSelfProfile = adminService.getSelfAdminProfile()
    const dispatch=useDispatch();
    const alertMessageModal = useSelector((state:RootState)=>state.popup.alertMessagePopup)

    if(adminSelfProfile.isError) {
        return (<Navigate to={URL_LOGIN} />)
    }



    return (
        <div className="flex h-screen overflow-hidden border-2 border-sky-500"> {/* Adjusted to h-screen to take full viewport height */}
            <div className=''>{children}</div>
            <AlertMessageModal
                setOpenState={()=>dispatch(closeAlertMsgPopup())}
                modalOpenState={alertMessageModal.isOpen}
                message={alertMessageModal.data.msg}
                btnText={alertMessageModal.data.btnText}
                msgTitle={alertMessageModal.data.msgTitle}
            />
        </div>
    );
};
export default AuthLayout;
