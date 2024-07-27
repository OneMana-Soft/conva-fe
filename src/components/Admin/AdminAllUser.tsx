import React from "react";
import {LazyLoadImage} from "react-lazy-load-image-component";
import ProfileIcon from "../../assets/user_profile.svg";
import mediaService from "../../services/MediaService.ts";

interface AdminUserInterface {
    user_emailId: string,
    user_full_name: string
    user_profile_key: string,
    activateOrDeactivateUser: () => void
    isDeactivated: boolean
    isSelf: boolean

}

const AdminAllUser: React.FC<AdminUserInterface> = ({user_emailId, activateOrDeactivateUser, isDeactivated, user_profile_key, user_full_name, isSelf}) => {

    const profileMediaRes = mediaService.getMediaURLForID(user_profile_key||'')


    return (
        <div className="mb-3">
            <div
                className="md:ml-2 md:mr-2 border-t pt-1 pb-1 flex flex-wrap justify-between mb-2 justify-center text-center items-center">
                <div className="flex justify-center text-center items-center">
                    <LazyLoadImage
                        src={profileMediaRes.mediaData?.url || ProfileIcon}
                        alt=""
                        className="m-2 rounded-full h-12 w-12 object-cover"
                    />
                    <div className=" text-left capitalize font-semibold w-28">{user_full_name}</div>
                </div>
                <div>
                    {user_emailId}
                </div>

                <div className='md:ml-8 md:mr-8'>

                    {!isSelf && <button
                        className={`${isDeactivated ? 'bg-red-700' : 'bg-green-600'} ml-4 text-white font-bold py-2 px-4 rounded-full p-2 pl-4 pr-4`}
                        onClick={activateOrDeactivateUser}
                    >
                        {isDeactivated ? "Deactivated": "Active"}
                    </button>}

                </div>
            </div>
        </div>
    );
};

export default AdminAllUser;
