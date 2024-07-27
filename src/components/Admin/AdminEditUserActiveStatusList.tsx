import React, {useEffect, useState} from "react";
import {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import {useTranslation} from "react-i18next";
import adminService from "../../services/AdminService.ts";
import AdminAllUser from "./AdminAllUser.tsx";
import {isZeroEpoch} from "../../utils/Helper.ts";


const AdminEditUserActiveStatusList: React.FC = () => {
    const [query, setQuery] = useState('')
    const allUsers = adminService.getAllUsersList()
    const selfAdminProfile = adminService.getSelfAdminProfile()

    const {t} = useTranslation()
    const [memberList, setMemberList] = useState<UserDgraphInfoInterface[]>([{
        user_name: "",
        user_uuid: "",
        user_email_id: "",
        user_created_at: "",
        user_profile_object_key: "",
        user_full_name: "",
        user_title: "",
        user_birthday: "",
        user_hobbies: ""

    }]);

    useEffect(() => {
        if (allUsers.data && allUsers.data.data) {
            setMemberList(allUsers.data.data)

        }
    }, [allUsers.data]);

    const handleActivateOrDeactivateUser = async (user_uuid:string, isDeactivated:boolean) => {
        if(isDeactivated) {
            await adminService.activateUser({user_uuid: user_uuid})
        } else {
            await adminService.deactivateUser({user_uuid: user_uuid})
        }
        allUsers.mutate()
    }


    const filteredPeople =
        query === ''
            ? memberList
            : memberList.filter((person) =>
                person.user_email_id
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )


    return (
        <div className="mb-3">
            <div className="text-m font-medium text-gray-900 mb-2 ">
                {t('userCountLabel', {count: allUsers.data?.data.length})}:
            </div>

            <div className="mb-1 mt-2 w-full">
                <input
                    type="text"
                    placeholder="Find Users By EmailId"
                    className="w-full px-2 py-1 border-2 border-gray-300 rounded-full"
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>
            <div className="h-[60vh] mt-4  channel-members-list  overflow-y-auto">

                {filteredPeople.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                        {t('nothingFoundLabel')}
                    </div>
                ) : (filteredPeople.map((member) => {
                    const isDeleted =  !isZeroEpoch(member.user_deleted_at || '')
                    return(<React.Fragment key={(member.user_uuid)}>
                        <AdminAllUser
                            user_emailId={member.user_email_id}
                            user_full_name={member.user_full_name}
                            user_profile_key={member.user_profile_object_key}
                            isDeactivated={isDeleted}
                            activateOrDeactivateUser = {()=>handleActivateOrDeactivateUser(member.user_uuid, isDeleted)}
                            isSelf = {member.user_uuid == selfAdminProfile.data?.data.Id}
                        />
                    </React.Fragment>)
                }))}
            </div>
        </div>
    );
};

export default AdminEditUserActiveStatusList;
