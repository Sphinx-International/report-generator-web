import React, { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";

type SecondaryFunc = {
  name: string;
  iconPath?: string;
};

type Functionalities = {
  primaryFunc: SecondaryFunc;
  secondaryFuncs?: SecondaryFunc[];
};

interface HeaderProps {
  flitration: string[];
  functionalties: Functionalities;
  children: ReactNode;
  handleAddPrimaryButtonClick: () => void;
  handleSecondaryButtonClick?: () => void;
}

const Main: React.FC<HeaderProps> = (props) => {
  const selectedWorkorders = useSelector(
    (state: RootState) => state.selectedWorkorders.workOrdersTab
  );
  const [selectedFilter, setSelectedFilter] = useState<string>(
    ["0", "1"].includes(localStorage.getItem("role")!) ? "All" : "To do"
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="flex items-center flex-col gap-[10px] lg:pr-[16px] w-full">
      <div className="pl-[24px] lg:flex items-center justify-between w-full hidden ">
        <div className="flex items-center xl:gap-[27px] gap-[15px]">
          {props.flitration.map((item, index) => {
            return (
              <span
                key={index}
                className={`${
                  selectedFilter === item
                    ? "text-primary border-b-[2px] border-primary"
                    : "text-n600"
                } leading-[36px] cursor-pointer text-[15px]`}
                onClick={() => {
                  setSelectedFilter(item);
                }}
              >
                {item}
              </span>
            );
          })}
        </div>
        {["0", "1"].includes(localStorage.getItem("role")!) && (
          <div className="flex items-center gap-[7px]">
            {props.functionalties.secondaryFuncs  && localStorage.getItem("role") ==="0"
              ? props.functionalties.secondaryFuncs.map((button) => {
                  return (
                    <button
                      className={`flex items-center gap-[3px] text-[14px] font-medium leading-[21px] xl:px-[18px] px-[15px] xl:py-[8px] py-[6.5px] border-[1.2px] rounded-[21px] ${selectedWorkorders.length === 0
                         ?"text-n600 border-n400" : button.name === "Delete" ?"cursor-pointer text-[#DB2C2C] border-[#DB2C2C] bg-[#FFECEC]" :"text-n600 border-n400"}`}
                      aria-disabled={
                        selectedWorkorders.length === 0 &&
                        button.name === "Delete"
                          ? true
                          : false
                      }
                      onClick={props.handleSecondaryButtonClick}
                    >
                      {button.name}
                      {button.iconPath ? (
                        <img src={button.iconPath} alt="icon" />
                      ) : null}
                    </button>
                  );
                })
              : null}

            <button
              className="flex items-center gap-[3px] text-[14px] leading-[21px] font-medium xl:px-[18px] px-[15px] xl:py-[8px] py-[6.5px] text-white rounded-[21px] bg-primary"
              onClick={props.handleAddPrimaryButtonClick}
            >
              {props.functionalties.primaryFunc.name}
            </button>
          </div>
        )}
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
          {props.functionalties.primaryFunc.name}
        </button>
      </div>

      {props.children}
    </main>
  );
};
export default Main;
