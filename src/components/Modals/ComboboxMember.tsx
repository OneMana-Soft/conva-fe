import React from 'react'
import { Combobox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import  {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import mediaService from "../../services/MediaService.ts";
import ProfileIcon from "../../assets/user_profile.svg";


interface ComboboxChannelMemberList {
    person: UserDgraphInfoInterface
    key: string
}

const ComboboxChannelMember: React.FC<ComboboxChannelMemberList> = ({person}) => {
    const profileMedia = mediaService.getMediaURLForID(person.user_profile_object_key || '')


    if (profileMedia.isError || profileMedia.isLoading) {
        return(<></>)
    }




    return (


                <Combobox.Option
                    key={person.user_uuid}
                    className={({active}) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 hover:cursor-pointer ${
                            active ? 'bg-gray-400 text-white' : 'text-gray-900'
                        }`
                    }
                    value={person}
                >
                    {({selected, active}) => (
                                    <>
                        <span
                        className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                        }`}
                        >
                            <div className='flex justify-center items-center'>

                                    <img
                                        src ={profileMedia.mediaData?.url || ProfileIcon }
                                        alt="profile"
                                        className='rounded-full w-10 h-10'
                                    />

                                <div className='flex-1 flex-col ml-2'>
                                    <div>{person.user_full_name}</div>
                                    <div className='text-xs'>@{person.user_name}</div>
                                </div>

                            </div>
                        </span>
                                        {selected ? (
                                            <span
                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                    active ? 'text-white' : 'text-gray-400'
                                                }`}
                                            >
                        <CheckIcon className="h-5 w-5" aria-hidden="true"/>
                        </span>
                                        ) : null}
                                    </>
                    )}
                </Combobox.Option>

    )
}

export default ComboboxChannelMember
