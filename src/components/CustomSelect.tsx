import { Dispatch, SetStateAction, useState } from "react";

interface CustomSelectProps<T> {
  options: string[];
  setState: Dispatch<SetStateAction<T>>;
  onChangeCallback?: (value: T) => void; // Callback after selection
  defaultValue?: string;
}

function CustomSelect<T>({ options, setState, onChangeCallback, defaultValue }: CustomSelectProps<T>) {
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);

    // Cast value to T and update state
    const newValue = options.indexOf(value) + 1 as T; // Convert index to match 1-based enums
    setState(newValue);
    if (onChangeCallback) onChangeCallback(newValue);
  };
  

  return (
    <div className="relative w-full">
      <div
        className="w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] bg-white text-n700 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValue}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-md z-10">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
