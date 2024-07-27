import React from "react";
import Datepicker from "react-tailwindcss-datepicker";
import {DateValueType} from "react-tailwindcss-datepicker/dist/types";

interface ProfileFieldProps {
  label: string;
  name: string;
  value: string;
  type?: string; // Added type prop
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly: boolean,
  required: boolean,
}

const FormField: React.FC<ProfileFieldProps> = ({
  label,
  name,
  value,
  type = "text", // Set default type to "text"
  onChange,
  readOnly,
  required
}) => {

  const handleDateChange = (v: DateValueType) => {
    const changeEvent: React.ChangeEvent<HTMLInputElement> = {
      target: { value: v?.startDate , name: name} as HTMLInputElement,
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(changeEvent)

  }
  return (
    <div className="mb-3">
      <label htmlFor={name} className="block mb-2 text-m font-medium text-gray-900">
        {label}{required && (<span className='text-red-600'>*</span>)}:
      </label>
      {
        type == "date" ?
            <div className="pt-1">
            <Datepicker
                inputId={name}
                inputName={name}
                useRange={false}
                asSingle={true}
                value={{startDate: value, endDate: value}}
                onChange={handleDateChange}
                displayFormat={"DD/MM/YYYY"}
                popoverDirection="up"
                readOnly={readOnly}
                inputClassName='relative transition-all duration-300 py-2.5 pl-4 pr-14 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5'
            />
            </div>
            :
            <input
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                type={type} // Set input type dynamically
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                required={required}
            />

      }

    </div>
  );
};


export default FormField;
