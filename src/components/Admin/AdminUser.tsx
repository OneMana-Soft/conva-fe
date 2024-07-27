import React from "react";
import {XMarkIcon} from "@heroicons/react/20/solid";

interface AdminUserInterface {
    user_emailId: string,
    removeAdmin: () => void
    isSelf: boolean

}

const AdminUser: React.FC<AdminUserInterface> = ({user_emailId, removeAdmin, isSelf}) => {



    return (
        <div className="mb-3">
            <div
                className="ml-2 mr-2 border-t pt-1 pb-1 flex justify-between mb-2 justify-center text-center items-center">
                <div>
                    {user_emailId}
                </div>

                <div className='ml-8 mr-8'>

                    {!isSelf && <div className="p-3 hover:cursor-pointer hover:bg-gray-300 rounded-lg" onClick={removeAdmin}>
                            <XMarkIcon fill='#fc0390' className='h-6 w-6'/>
                        </div>}

                </div>
            </div>
        </div>
    );
};

export default AdminUser;
