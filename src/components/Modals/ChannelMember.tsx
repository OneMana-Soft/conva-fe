import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CrownIcon from "../../assets/crown.svg?react";
import ExitIcon from "../../assets/exit.svg?react";
import ProfileIcon from "../../assets/user_profile.svg";
import mediaService from "../../services/MediaService.ts";
import profileService from "../../services/ProfileService.ts";

interface ChannelMemberInterface {
    profileKey: string;
    memberName: string;
    memberAdmin: boolean;
    isChannelCreator: boolean;
    memberUUD: string;
    userAdmin: boolean
    handleCrownClick: (memberAdmin: boolean, memberUUD: string) => void;
    handleExitClick: ( memberUUD: string) => void;
}

const ChannelMember: React.FC<ChannelMemberInterface> = ({
                                                             profileKey,
                                                             isChannelCreator,
                                                             memberAdmin,
                                                             memberName,
                                                             memberUUD,
                                                             userAdmin,
                                                             handleCrownClick,
                                                             handleExitClick
                                                         }) => {
    const profileMediaRes = mediaService.getMediaURLForID(  profileKey || "");
    const selfProfile = profileService.getSelfUserProfile();


    if (
        profileMediaRes.isError ||
        profileMediaRes.isLoading ||
        selfProfile.isError ||
        selfProfile.isLoading
    ) {
        return <></>;
    }

    const canShowExit = (userAdmin || memberUUD === selfProfile.userData?.data.dgraph.user_uuid) && !isChannelCreator;

    return (
        <div className="ml-2 mr-2 border-t pt-1 pb-1 flex justify-between mb-2 justify-center text-center items-center">
            <div className="flex justify-center text-center items-center">
                <LazyLoadImage
                    src={profileMediaRes.mediaData?.url || ProfileIcon}
                    alt=""
                    className="m-2 rounded-full h-12 w-12 object-cover"
                />
                <div className=" text-left capitalize font-semibold w-28">{memberName}</div>
            </div>
            <div
                onClick={!isChannelCreator && userAdmin ? ()=>{handleCrownClick(memberAdmin, memberUUD)} : undefined}
                className={`ml-8 mr-8 p-1 ${!isChannelCreator && userAdmin ? "hover:cursor-pointer hover:bg-gray-300" : ""} rounded-lg`}>
                {memberAdmin ? (
                    <CrownIcon fill="#fcba03" className="h-8 w-8"/>
                ) : (
                    <CrownIcon fill="#e3dfd3" className="h-8 w-8"/>
                )}
            </div>


            <div className="ml-8 mr-8 ">
                {canShowExit?
                    <div className="p-3 hover:cursor-pointer hover:bg-gray-300 rounded-lg" onClick={() => {handleExitClick( memberUUD)}}>
                        <ExitIcon className="h-4 w-4"/>
                    </div> :
                    <div className="p-3"><div className="h-4 w-4 "/></div>
                }
            </div>
        </div>
    );
};

export default ChannelMember;
