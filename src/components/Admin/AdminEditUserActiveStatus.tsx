import React from 'react';
import AdminEditUserActiveStatusList from "./AdminEditUserActiveStatusList.tsx";

const AdminEditUserActiveStatus: React.FC = () => {


    return (
        <div className='flex flex-col justify-center w-full p-4 '>
            <div className='m-2 mb-4'>
                <AdminEditUserActiveStatusList/>

            </div>

        </div>
    );
};

export default AdminEditUserActiveStatus;
