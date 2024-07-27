import React, {useEffect, useState} from "react";
import channelService from "../../services/ChannelService.ts";
import ChannelMember from "./ChannelMember.tsx";
import profileService, {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import {useNavigate} from "react-router-dom";
import {URL_CHANNEL} from "../../constants/routes/appNavigation.ts";
import {useTranslation} from "react-i18next";

interface ChannelMemberListInterface {
    channelId: string;
    handleClose: () => void
}

const ChannelMemberList: React.FC<ChannelMemberListInterface> = ({
                                                                     channelId,
                                                                     handleClose
                                                                 }) => {
    const [query, setQuery] = useState('')
    const channelInfo = channelService.getChannelInfo(channelId);
    const userProfile = profileService.getSelfUserProfile();
    const usersListRes = profileService.getUsersListWhoDontExistInChannel(channelId)
    const [userModerator, setUserModerator] = useState(false)
    const {t} = useTranslation()
    const [memberList, setMemberList] = useState<UserDgraphInfoInterface[]>([{
        uid: "",
        user_birthday: "",
        user_created_at: "",
        user_deleted_at: "",
        user_email_id: "",
        user_full_name: "",
        user_hobbies: "",
        user_moderator: false,
        user_name: "",
        user_profile_object_key: "",
        user_title: "",
        user_updated_at: "",
        user_uuid: ""

    }]);
    const navigate = useNavigate()

    useEffect(() => {
        setUserModerator(false)
        if (channelInfo.data && channelInfo.data.channel_info.ch_members) {
            setMemberList(channelInfo.data.channel_info.ch_members)
            for(let ind = 0; ind< channelInfo.data.channel_info.ch_members.length; ind++) {
                if(channelInfo.data.channel_info.ch_members[ind].user_uuid === userProfile.userData?.data.dgraph.user_uuid && channelInfo.data.channel_info.ch_members[ind].user_moderator) {
                    setUserModerator(true)
                    break
                }
            }

        }
    }, [channelInfo.data]);



    if (
        channelInfo.isError ||
        channelInfo.isLoading ||
        userProfile.isError ||
        userProfile.isLoading
    ) {
        return <></>;
    }



    const handleCrownClick = async (memberAdmin:boolean, memberUUID:string) => {
        let MemberAdminRes
        if(!memberAdmin){
            MemberAdminRes = await channelService.MakeMemberAdmin({user_id: memberUUID, channel_id:channelId})
        } else {
            MemberAdminRes=  await channelService.RemoveMemberAdmin({user_id: memberUUID, channel_id:channelId})
        }
        if( MemberAdminRes.status == 200 && channelInfo.data?.channel_info.ch_members) {
            // for(let ind=0; ind<channelInfo.data.channel_info.ch_members.length; ind++) {
            //     if(channelInfo.data.channel_info.ch_members[ind].user_uuid === memberUUID) {
            //         channelInfo.data.channel_info.ch_members[ind].user_moderator = !memberAdmin
            //         console.log("changed")
            //     }
            // }
            await channelInfo.mutate()
        }
    }

    const handleExitClick = async (memberUUID:string) => {
            const removeMemberRes = await channelService.RemoveMemberFromChannel({user_id: memberUUID, channel_id: channelId})
            if(removeMemberRes.status == 200 &&  channelInfo.data?.channel_info.ch_members) {
                channelInfo.data.channel_info.ch_members = channelInfo.data.channel_info.ch_members.filter(member => member.user_uuid !== memberUUID);
                await channelInfo.mutate(channelInfo.data)

                if(userProfile.userData?.data.postgres.Id === memberUUID) {
                    handleClose()
                    await channelInfo.mutate()
                    navigate(URL_CHANNEL)
                }
                await usersListRes.mutate()
            }
    }

    const filteredPeople =
        query === ''
            ? memberList
            : memberList.filter((person) =>
                person.user_full_name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )



    return (
        <div className="mb-3">
            <div className="text-m font-medium text-gray-900 mb-2 ">
                {t('memberLabel', {count: channelInfo.data?.channel_info.ch_members?.length})}:
            </div>

            <div className="mb-1 mt-2 w-full">
                <input
                    type="text"
                    placeholder={t('findMemberPlaceHolder')}
                    className="w-full px-2 py-1 border-2 border-gray-300 rounded-full"
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>
            <div className="h-[60vh] channel-members-list flex flex-col overflow-y-auto">
                {filteredPeople.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                        {t('nothingFoundLabel')}
                    </div>
                ) : (filteredPeople.map((member) => (
                    <React.Fragment key={(member.user_uuid)}>
                        <ChannelMember
                            profileKey={member.user_profile_object_key || ""}
                            memberName={member.user_full_name}
                            memberAdmin={member.user_moderator || false}
                            isChannelCreator={
                                member.user_uuid === channelInfo.data?.channel_info.ch_created_by.user_uuid
                            }
                            memberUUD={member.user_uuid}
                            userAdmin={userModerator}
                            handleCrownClick={handleCrownClick}
                            handleExitClick={handleExitClick}
                        />
                    </React.Fragment>
                )))}
            </div>
        </div>
    );
};

export default ChannelMemberList;
