import { useState } from "react";

interface CustomSelectProps {
  options: string[]; // Array of options passed as props
  defaultValue?: string; // Optional default value
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, defaultValue }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Hidden select for accessibility */}
      <select
        id="type"
        className="hidden"
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Custom Dropdown */}
      <div
        className="w-full rounded-[46px] h-[52px] shadow-md px-[24px] bg-white text-n700 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Selected Value */}
        {selectedValue}

        {/* Arrow Icon */}
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
};

export default CustomSelect;
