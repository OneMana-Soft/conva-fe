import React, {Fragment, useEffect, useState} from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import {useTranslation} from "react-i18next";
import adminService from "../../services/AdminService.ts";
import ComboboxMember from "../Modals/ComboboxMember.tsx";
import {openAlertMsgPopup} from "../../store/slice/popupSlice.ts";
import {useDispatch} from "react-redux";


const AdminAddUserCombobox: React.FC = () => {

    const allUserList = adminService.getAllUsersList()
    const allAdminUsers = adminService.getAllAdminProfile()
    const {t} = useTranslation()
    const dispatch = useDispatch()


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

    useEffect(() => {
        if (allUserList.data) {

            setUsersList([...allUserList.data.data])

        }
    }, [allUserList.data]);


    if (allUserList.isError || allUserList.isLoading) {
        return(<></>)
    }


    const memberValid = selected.user_uuid !== ""
    const handleAddAdmin = async (user_uuid: string) => {


        for(const adminUser of  (allAdminUsers.data?.data || [])) {
            console.log("allAdminUsers.data?.data", adminUser.Id )
            console.log("user_uuid", user_uuid)
            if(adminUser.Id == user_uuid) {
                setSelected({} as UserDgraphInfoInterface)
                dispatch(openAlertMsgPopup({
                    msg: "User is already admin",
                    btnText: "Ok",
                    msgTitle: "Error"
                }))

                return
            }
        }
        const resp = await adminService.createAdmin({user_uuid: user_uuid})

        if(resp.status == 200) {
            await allAdminUsers.mutate()
        }
    }

    const filteredPeople =
        query === ''
            ? usersList
            : usersList.filter((person) =>
                person.user_email_id
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )

    return (
        <div className="mb-3 w-full">
            <div className='text-m font-medium text-gray-900 mb-2 '> Add admin (by email):</div>
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

                                    autoComplete="off"
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
                                    className="combobox-options absolute max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
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
                    onClick={() => handleAddAdmin(selected.user_uuid)}
                    disabled={!memberValid}
                >
                    {"Add admin"}
                </button>


            </div>
        </div>
    )
}

export default AdminAddUserCombobox
