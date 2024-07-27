import React, {Fragment, useState} from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import {useTranslation} from "react-i18next";


interface ComboboxChannelMemberList {
    selectedLang: string
    updateLang: (lang:string) => void
}

interface langInterface {
    name: string
    code: string
}

interface langListInterface {
    [code: string]: langInterface;
}

const ComboboxAppLangList: React.FC<ComboboxChannelMemberList> = ({selectedLang, updateLang}) => {

    const {t} = useTranslation()

    const appLangList:langListInterface = {
        'am': {
            name: "Arabic",
            code: "am"
        },
        'be': {
            name: "Belarusian",
            code: "be"
        },
        'bg': {
            name: "Bulgarian",
            code: "bg"
        },
        'ca': {
            name: "Catalan",
            code: "ca"
        },
        'cs': {
            name: "Czech",
            code: "cs"
        },
        'da': {
            name: "Danish",
            code: "da"
        },
        'de': {
            name: "German",
            code: "de"
        },
        'el': {
            name: "Greek",
            code: "el"
        },
        'en-AU': {
            name: "Australian English",
            code: "en-AU"
        },
        'en': {
            name: "English-US",
            code: "en"
        },
        'es': {
            name: "Spanish",
            code: "es"
        },
        'et': {
            name: "Estonian",
            code: "et"
        },
        'eu': {
            name: "Basque",
            code: "eu"
        },
        'fi': {
            name: "Finnish",
            code: "fi"
        },
        'fr': {
            name: "French",
            code: "fr"
        },
        'he': {
            name: "Hebrew",
            code: "he"
        },
        'hi': {
            name: "Hindi",
            code: "hi"
        },
        'it': {
            name: "Italian",
            code: "it"
        },
        'ja': {
            name: "Japanese",
            code: "ja"
        },
        'nl': {
            name: "Dutch",
            code: "nl"
        },
        'pt': {
            name: "Portuguese",
            code: "pt"
        },
        'ru': {
            name: "Russian",
            code: "ru"
        },
        'sv': {
            name: "Swedish",
            code: "sv"
        }
    }


    const [selected, setSelected] = useState(appLangList[selectedLang])
    const [query, setQuery] = useState('')


    const handleUpdateLang = (langInfo: langInterface) => {
        setSelected(langInfo)
        updateLang(langInfo.code)
    }

    const filteredLang =
        query === ''
            ? appLangList
            :  Object.keys(appLangList).filter(key  =>
                appLangList[key].name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            ).reduce((obj: langListInterface, key) => {
                obj[key] = appLangList[key];
                return obj;
            }, {});

    return (
        <div className="mb-3 w-full">
            <div className='text-m font-medium text-gray-900 mb-2 '> {t('appLangLabel')}:</div>
            <div className='flex justify-start items-center '>
                <div className='w-70'>


                    <Combobox value={selected} onChange={handleUpdateLang}>
                        <div className="relative mt-1">
                            <div
                                className="relative w-full cursor-default overflow-hidden rounded-lg border-2 text-left sm:text-sm focus-within:border-slate-500">
                                <Combobox.Input
                                    className="w-full bg-gray-50 py-2 pl-3 pr-10 text-sm text-gray-900 outline-none"
                                    displayValue={(lang: langInterface | null) => lang?.name || ''}
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
                                    {Object.keys(filteredLang).length === 0 && query !== '' ? (
                                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                            {t('nothingFoundLabel')}
                                        </div>
                                    ) : (
                                        Object.keys(filteredLang).map((key) => (
                                            <Combobox.Option
                                                key={key}
                                                className={({active, selected}) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 hover:cursor-pointer ${
                                                        (active || selected) ? 'bg-gray-400 text-white' : 'text-gray-900'
                                                    }`
                                                }
                                                value={appLangList[key]}
                                            >
                                                    {appLangList[key].name}

                                            </Combobox.Option>
                                        ))
                                    )}
                                </Combobox.Options>
                            </Transition>
                        </div>
                    </Combobox>
                </div>


            </div>
        </div>
    )
}

export default ComboboxAppLangList
