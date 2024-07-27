import React from 'react'
import  {UserDgraphInfoInterface} from "../../../services/ProfileService.ts";
import mediaService from "../../../services/MediaService.ts";
import ProfileIcon from "../../../assets/user_profile.svg";
import './MentionList.scss'



interface ComboboxChannelMemberList {
    person: UserDgraphInfoInterface
    ind: number
    selectItem: (ind: number) => void
    selectedIndex: number
}

const MentionMember: React.FC<ComboboxChannelMemberList> = ({person, selectItem, ind, selectedIndex}) => {
    const profileMedia = mediaService.getMediaURLForID(person.user_profile_object_key || '')


    if (profileMedia.isError || profileMedia.isLoading) {
        return(<></>)
    }


    return (

        <div
            className={`item ${ind === selectedIndex ? "is-selected" : ""} flex justify-center items-center`}
            onClick={() => selectItem(ind)}
        >
            <img
                src={profileMedia.mediaData?.url || ProfileIcon}
                alt="profile"
                className='rounded-full w-10 h-10'
            />

            <div className='flex-1 flex-col ml-2'>
                <div>{person.user_full_name}</div>
                <div className='text-xs'>@{person.user_name}</div>
            </div>
        </div>


    )
}

export default MentionMember
