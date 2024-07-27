import React from "react";
import {Tab} from "@headlessui/react";
import AdminEditAdminUser from "../../components/Admin/AdminEditAdminUser.tsx";
import AdminEditUserActiveStatus from "../../components/Admin/AdminEditUserActiveStatus.tsx";

const AdminPage: React.FC = () => {


    const TABS = ["Add/Remove Admin", "Activate/Deactivate User"]


    return (
        <div className="flex w-[100vw] h-full flex-col items-center justify-center dark:bg-gray-800 dark:text-slate-200 p-8 pb-2 pt-2 overflow-y-auto">
            <Tab.Group>
                <Tab.List className="flex max-h-[10vh] space-x-1 text-m rounded-l justify-left pb-2 pt-2">
                    {TABS.map((tab, index) => (
                        <Tab
                            key={index}
                            className={({ selected }) =>
                                `bg-gray-300 p-3 capitalize hover:cursor-pointer hover:bg-gray-400 rounded-xl text-center ${
                                    selected ? "bg-gray-400" : "text-gray-600"
                                }`
                            }
                        >
                            {tab}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    <Tab.Panel className="flex flex-col">
                        <AdminEditAdminUser/>
                    </Tab.Panel>
                    <Tab.Panel className="flex flex-col">
                        <AdminEditUserActiveStatus/>
                    </Tab.Panel>

                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default AdminPage;
