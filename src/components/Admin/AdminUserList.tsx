import React, {useEffect, useState} from "react";
import {UserPostgresInfoInterface} from "../../services/ProfileService.ts";
import {useTranslation} from "react-i18next";
import adminService from "../../services/AdminService.ts";
import AdminUser from "./AdminUser.tsx";


const AdminUserList: React.FC = () => {
    const [query, setQuery] = useState('')
    const allAdminUsers = adminService.getAllAdminProfile()
    const selfAdminProfile = adminService.getSelfAdminProfile()

    const {t} = useTranslation()
    const [memberList, setMemberList] = useState<UserPostgresInfoInterface[]>([{
        Id: "",
        email_id: "",
        user_name: "",
        CreatedAt: "",
        UpdatedAt: "",
        DeletedAt: "",

    }]);

    useEffect(() => {
        if (allAdminUsers.data && allAdminUsers.data.data) {
            setMemberList(allAdminUsers.data.data)

        }
    }, [allAdminUsers.data]);



    const filteredPeople =
        query === ''
            ? memberList
            : memberList.filter((person) =>
                person.email_id
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )


    const handleRemoveAdmin = async (user_uuid: string) => {
        await adminService.removeAdmin({user_uuid: user_uuid})

        allAdminUsers.mutate()
    }

    return (
        <div className="mb-3">
            <div className="text-m font-medium text-gray-900 mb-2 ">
                {t('adminUserLabel', {count: allAdminUsers.data?.data.length})}:
            </div>

            <div className="mb-1 mt-2 w-full">
                <input
                    type="text"
                    placeholder="Find Admin Users By EmailId"
                    className="w-full px-2 py-1 border-2 border-gray-300 rounded-full"
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>
            <div className="h-[60vh] mt-4  channel-members-list  overflow-y-auto">

                {filteredPeople.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                        {t('nothingFoundLabel')}
                    </div>
                ) : (filteredPeople.map((member) => (
                    <React.Fragment key={(member.Id)}>
                        <AdminUser
                            user_emailId={member.email_id}
                            removeAdmin = {()=>{handleRemoveAdmin(member.Id)}}
                            isSelf = {selfAdminProfile.data?.data.Id == member.Id}
                        />
                    </React.Fragment>
                )))}
            </div>
        </div>
    );
};

export default AdminUserList;
