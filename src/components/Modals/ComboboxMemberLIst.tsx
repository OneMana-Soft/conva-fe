import React, {Fragment, useEffect, useState} from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import profileService, {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import channelService from "../../services/ChannelService.ts";
import ComboboxMember from "./ComboboxMember.tsx";
import {useTranslation} from "react-i18next";


interface ComboboxChannelMemberList {
    channelId: string
}

const ComboboxChannelMemberList: React.FC<ComboboxChannelMemberList> = ({channelId}) => {

    const channelInfo = channelService.getChannelInfo(channelId)
    const {t} = useTranslation()


    const [usersList, setUsersList] = useState<UserDgraphInfoInterface[]>([{
        user_name: "",
        user_uuid: "",
        user_email_id: "",
        user_created_at: "",
        user_profile_object_key: "",
        user_full_name: "",
        user_title: "",
        user_birthday: "",
        user_hobbies: ""
    }])
  const [selected, setSelected] = useState<UserDgraphInfoInterface>({
      user_name: "",
      user_uuid: "",
      user_email_id: "",
      user_created_at: "",
      user_profile_object_key: "",
      user_full_name: "",
      user_title: "",
      user_birthday: "",
      user_hobbies: ""
})
  const [query, setQuery] = useState('')
    const usersListRes = profileService.getUsersListWhoDontExistInChannel(channelId)

    useEffect(() => {
        if (usersListRes.data) {

            setUsersList([...usersListRes.data.users])

        }
    }, [usersListRes.data]);


    if (usersListRes.isError || usersListRes.isLoading) {
       return(<></>)
    }


    const memberValid = selected.user_uuid !== ""
  const handleAddMember = async (memberUUID: string) => {
       await channelService.AddMemberToChannel({user_id: memberUUID, channel_id: channelId})

    setSelected({
        user_name: "",
        user_uuid: "",
        user_email_id: "",
        user_created_at: "",
        user_profile_object_key: "",
        user_full_name: "",
        user_title: "",
        user_birthday: "",
        user_hobbies: ""
    })
      await channelInfo.mutate()
  }

  const filteredPeople =
    query === ''
      ? usersList
      : usersList.filter((person) =>
          person.user_full_name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  return (
    <div className="mb-3 w-full">
        <div className='text-m font-medium text-gray-900 mb-2 '> {t('addMembersLabel')}:</div>
        <div className='flex justify-start items-center '>
            <div className='w-70'>


                <Combobox value={selected} onChange={setSelected}>
                    <div className="relative mt-1">
                        <div
                            className="relative w-full cursor-default overflow-hidden rounded-lg border-2 text-left sm:text-sm focus-within:border-slate-500">
                            <Combobox.Input
                                className="w-full bg-gray-50 py-2 pl-3 pr-10 text-sm text-gray-900 outline-none"
                                displayValue={(person: UserDgraphInfoInterface) => person.user_full_name}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                    fill='#3d3d3d'
                                />
                            </Combobox.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery('')}
                        >
                            <Combobox.Options
                                className="combobox-options absolute mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                                {filteredPeople.length === 0 && query !== '' ? (
                                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                        {t('nothingFoundLabel')}
                                    </div>
                                ) : (
                                    filteredPeople.map((person) => (

                                        <ComboboxMember
                                            person={person}
                                            key={person.user_uuid}
                                        />
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    </div>
                </Combobox>
            </div>
            <button
                className={`${!memberValid ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-700'} ml-4 text-white font-bold py-2 px-4 rounded-full p-2 pl-4 pr-4`}
                onClick={() => handleAddMember(selected.user_uuid)}
                disabled={!memberValid}
            >
                {t('addLabel')}
            </button>


        </div>
    </div>
  )
}

export default ComboboxChannelMemberList
