import React from 'react';
import AdminUserList from "./AdminUserList.tsx";
import AdminAddUserCombobox from "./AdminAddUserCombobox.tsx";

const AdminEditAdminUser: React.FC = () => {


    return (
        <div className='flex flex-col justify-center w-full p-4 '>
            <div className='m-2 mb-4'>
                <AdminAddUserCombobox/>

            </div>
            <AdminUserList/>

        </div>
    );
};

export default AdminEditAdminUser;
