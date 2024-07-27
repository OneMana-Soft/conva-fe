import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import profileService from "../../services/ProfileService.ts";
import {useNavigate} from "react-router-dom";
import {XMarkIcon} from "@heroicons/react/20/solid";


interface editChannelModalProps {
  modalOpenState: boolean;
  setOpenState: (state: boolean) => void;
  message: string;
  msgTitle: string,
  btnText: string
}


const AlertMessageModal: React.FC<editChannelModalProps> = ({
                                                                    modalOpenState,
                                                                    setOpenState,
                                                                    message,
                                                                    msgTitle,
                                                                    btnText,
                                                                  }) => {

  const navigate = useNavigate()


  // Add a focusable element, such as a button, to the Dialog component
  const handleCancel = () => {

    setOpenState(false);
  };

  const btnClick = async () => {
    if(btnText == 'Logout') {
      localStorage.clear();
      sessionStorage.clear();
      await profileService.logout()
      navigate("/")
    }
    handleCancel()
  }

  return (
      <>
        <Transition appear show={modalOpenState} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleCancel}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                    >
                      <div className="flex flex-grow">
                        <div className="flex-1">{msgTitle}</div>
                        <div className="hover:cursor-pointer" onClick={handleCancel}>
                          <XMarkIcon height="1.5rem" width="1.5rem"/>
                        </div>
                      </div>

                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {message}
                      </p>
                    </div>

                    <div className="mt-4">
                      <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                          onClick={btnClick}
                      >
                        {btnText}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>
  );
};

export default AlertMessageModal;