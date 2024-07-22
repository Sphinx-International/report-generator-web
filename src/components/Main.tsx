import React, { ReactNode, useState } from "react";

type Functionalities = {
  primaryFunc: string;
  secondaryFuncs?: string[];
};

interface HeaderProps {
  flitration: string[];
  functionalties: Functionalities;
  children: ReactNode;
  handleAddPrimaryButtonClick: () => void;
}

const Main: React.FC<HeaderProps> = (props) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(
    ["0", "1"].includes(localStorage.getItem("role")!) ? "All" : "To do"
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="flex items-center flex-col gap-[20px] lg:pr-[16px] w-full">
      <div className="pl-[24px] lg:flex items-center justify-between w-full hidden ">
        <div className="flex items-center xl:gap-[40px] gap-[16px]">
          {props.flitration.map((item, index) => {
            return (
              <span
                key={index}
                className={`${
                  selectedFilter === item
                    ? "text-primary border-b-[2px] border-primary"
                    : "text-n600"
                } leading-[46px] cursor-pointer`}
                onClick={() => {
                  setSelectedFilter(item);
                }}
              >
                {item}
              </span>
            );
          })}
        </div>
        {["0", "1"].includes(localStorage.getItem("role")!) && 
        <div className="flex items-center gap-[7px]">
          {props.functionalties.secondaryFuncs && (
            <>
              <button className="flex items-center gap-[3px] font-semibold leading-[21px] xl:px-[20px] px-[16px] xl:py-[9.5px] py-[7px] text-n600 border-[1.3px] border-n400 rounded-[21px]">
                CSV
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2.66675 11.3334V12.6667C2.66675 13.0204 2.80722 13.3595 3.05727 13.6096C3.30732 13.8596 3.64646 14.0001 4.00008 14.0001H12.0001C12.3537 14.0001 12.6928 13.8596 12.9429 13.6096C13.1929 13.3595 13.3334 13.0204 13.3334 12.6667V11.3334M4.66675 7.33341L8.00008 10.6667M8.00008 10.6667L11.3334 7.33341M8.00008 10.6667V2.66675"
                    stroke="#6F6C8F"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button className="flex items-center gap-[3px] font-semibold leading-[21px] xl:px-[20px] px-[16px] xl:py-[9.5px] py-[7px] text-n600 border-[1.3px] border-n400 rounded-[21px]">
                Upload
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2.66675 11.3334V12.6667C2.66675 13.0204 2.80722 13.3595 3.05727 13.6096C3.30732 13.8596 3.64646 14.0001 4.00008 14.0001H12.0001C12.3537 14.0001 12.6928 13.8596 12.9429 13.6096C13.1929 13.3595 13.3334 13.0204 13.3334 12.6667V11.3334M4.66675 6.00008L8.00008 2.66675M8.00008 2.66675L11.3334 6.00008M8.00008 2.66675V10.6667"
                    stroke="#6F6C8F"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          <button
            className="flex items-center gap-[3px] leading-[21px] font-semibold xl:px-[20px] px-[16px] xl:py-[9.5px] py-[7px] text-white rounded-[21px] bg-primary"
            onClick={props.handleAddPrimaryButtonClick}
          >
            {props.functionalties.primaryFunc}
          </button>
        </div>        
        }

      </div>

      <div className="flex items-center justify-between w-full">
        <div className="relative lg:hidden">
          <h3
            className="text-[20px] font-medium leading-[30px] text-primary flex items-center gap-[5px]"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {selectedFilter}
            <svg
              className="w-[11px] h-[7px]  md:w-[15px] md:h-[10px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 11 7"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.3405 0.215332L5.42905 4.266L1.54938 0.215332L0.358935 1.44815L5.41939 6.73163L10.5213 1.44815L9.3405 0.215332Z"
                fill="#4A3AFF"
              />
            </svg>
          </h3>

          {isOpen && (
            <ul className="absolute sm:w-[300px] w-[190px] bg-white rounded-[30px] shadow-lg mt-2 z-10">
              {props.flitration.map((option) => (
                <li
                  key={option}
                  className={`px-[18px] py-[10px] text-n600 sm:text-[16px] text-[14px] cursor-pointer hover:bg-gray-100 ${
                    option === selectedFilter ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setSelectedFilter(option);
                    setIsOpen(false);
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className=" hidden md:inline-block capitalize lg:lg:hidden text-[14px] items-center gap-[3px] text-center justify-center leading-[21px] font-semibold xl:px-[20px] px-[16px]  py-[12px] text-white rounded-[21px] bg-primary"
          onClick={props.handleAddPrimaryButtonClick}
        >
          {props.functionalties.primaryFunc}
        </button>
      </div>

      {props.children}
    </main>
  );
};
export default Main;
