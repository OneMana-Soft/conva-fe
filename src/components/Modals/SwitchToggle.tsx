import { Switch } from "@headlessui/react";

interface SwitchToggleProps {
  label: string;
  name: string;
  value: boolean;
  onChange: (name: string, value: boolean) => void;
}

const SwitchToggle: React.FC<SwitchToggleProps> = ({
  label,
  name,
  value,
  onChange,
}) => {
  const handleOnChange = (newVal: boolean) => {
    onChange(name, newVal);
  };

  return (
    <div className="">
      <div className="mb-0.5 text-m font-medium text-gray-900">{label}:</div>
      <div className="">

      
      <Switch
        checked={value}
        onChange={handleOnChange}
        className={`${
          value ? "bg-sky-400" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span
          className={`${
            value ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
      </div>
    </div>
  );
};

export default SwitchToggle;
