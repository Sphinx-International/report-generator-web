import React, { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import MonthCalender from "./monthCalender";

type SecondaryFunc = {
  name: string;
  iconPath?: string;
};

type Functionalities = {
  primaryFunc?: SecondaryFunc;
  secondaryFuncs?: SecondaryFunc[];
  setState?: React.Dispatch<React.SetStateAction<unknown>>;
  State?: unknown;
  setState2?: React.Dispatch<React.SetStateAction<unknown>>;
  State2?: unknown;
};

interface MainProps {
  page: "workorders" | "accounts" | "modernisation" | "new site" | "los orders";
  flitration: string[];
  FiltrationFunc?: (offset: number, limit: number, status?: string) => void;
  subFilterFunc?: (
    offset: number,
    limit: number,
    report: boolean | null,
    certificate: boolean | null,
    voucher: boolean | null
  ) => void;
  functionalties?: Functionalities;
  children: ReactNode;
  handleAddPrimaryButtonClick?: () => void;
  handleSecondaryButtonClick?: () => void;
  setCurrentPage: (page: number) => void;
}

type ExcutedFilter = {
  title: string;
  report: boolean | null;
  certificate: boolean | null;
  voucher: boolean | null;
};

const excutedFilter: ExcutedFilter[] = [
  { title: "All", report: null, certificate: null, voucher: null },
  { title: "Missing reports", report: false, certificate: null, voucher: null },
  {
    title: "Missing acceptance certificate",
    report: null,
    certificate: false,
    voucher: null,
  },
  {
    title: "Missing return voucher",
    report: null,
    certificate: null,
    voucher: false,
  },
];
const Main: React.FC<MainProps> = (props) => {
  const getDefaultFilter = () => {
    const storedFilter =
      props.page === "accounts"
        ? localStorage.getItem("selectedFilterForUsers")
        : props.page === "los orders"
        ? localStorage.getItem("selectedFilterForLos")
        : localStorage.getItem("selectedFilterForWorkorders");
    if (storedFilter) {
      return storedFilter;
    }
    return ["0", "1"].includes(localStorage.getItem("role")!)
      ? "all"
      : props.page === "workorders"
      ? "To do"
      : "all";
  };
  const selectedExtension = useSelector((state: RootState) =>
    props.page === "workorders"
      ? state.selectedExtantions.workOrdersTab
      : props.page === "modernisation"
      ? state.selectedExtantions.modernisationsTab
      : props.page === "new site"
      ? state.selectedExtantions.newSitesTab
      : props.page === "los orders"
      ? state.selectedLosOrders.OrdersTab
      : null
  );
  const [selectedFilter, setSelectedFilter] =
    useState<string>(getDefaultFilter);
  const [isOpen, setIsOpen] = useState(false);

  const [visibleExcutedPopup, setVisibleExcutedPopup] =
    useState<boolean>(false);

  const [selectedExcutedFilter, setSelectedExcutedFilter] = useState(
    localStorage.getItem("selectedSubExecutedFilter") &&
      localStorage.getItem("selectedFilterForWorkorders") === "executed"
      ? `${localStorage.getItem("selectedSubExecutedFilter")}`
      : ""
  );

  const [visibleMonthCalender, setVisibleMonthCalender] =
    useState<boolean>(false);

  const handleFilterClick = (item: string) => {
    if (
      item === "Missing reports" ||
      item === "Missing acceptance certificate" ||
      item === "Missing return voucher"
    ) {
      setSelectedFilter("executed");
    } else {
      setSelectedFilter(item);
      localStorage.removeItem("selectedSubExecutedFilter");
    }
    props.page === "accounts"
      ? localStorage.setItem("selectedFilterForUsers", item.toLowerCase())
      : props.page === "los orders"
      ? localStorage.setItem("selectedFilterForLos", item.toLowerCase())
      : item === "Missing reports" ||
        item === "Missing acceptance certificate" ||
        item === "Missing return voucher"
      ? localStorage.setItem("selectedFilterForWorkorders", "executed")
      : localStorage.setItem("selectedFilterForWorkorders", item.toLowerCase());

    props.setCurrentPage(1);
    const limit = props.page === "accounts" ? 4 : 6;

    switch (item) {
      case "all":
        props.FiltrationFunc!(0, limit);
        break;
      case "to do":
        props.FiltrationFunc!(0, limit, "assigned");
        break;
      case "all-executed":
        props.FiltrationFunc!(0, limit, "executed");
        break;

      case "Missing reports":
        props.subFilterFunc!(0, limit, false, null, null);
        break;

      case "Missing acceptance certificate":
        props.subFilterFunc!(0, limit, null, false, null);
        break;

      case "Missing return voucher":
        props.subFilterFunc!(0, limit, null, null, false);
        break;

      default:
        props.FiltrationFunc!(0, limit, item.toLowerCase());

        break;
    }
  };

  return (
    <main className="flex items-center flex-col  gap-[10px] lg:pr-[16px] w-full h-fit">
      <div className="pl-[24px] lg:flex items-center justify-between w-full hidden">
        <div className="flex items-center xl:gap-[21px] gap-[15px]">
          {props.flitration.map((item, index) => (
            <div key={index} className="relative">
              <span
                className={`${
                  selectedFilter === item.toLowerCase()
                    ? "text-primary border-b-[2px] border-primary"
                    : "text-n600"
                } leading-[36px] cursor-pointer text-[15px] flex items-center gap-[6px] relative`}
                onClick={() => {
                  if (item === "Executed" && props.page !== "los orders") {
                    setVisibleExcutedPopup(!visibleExcutedPopup);
                  } else {
                    handleFilterClick(item.toLowerCase());
                    setSelectedExcutedFilter("");
                    setVisibleExcutedPopup(false);
                    if (props.functionalties && props.functionalties.setState) {
                      props.functionalties.setState(null);
                    }
                  }
                }}
              >
                {item}
                {item === "Executed" && props.page !== "los orders" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="7"
                    viewBox="0 0 11 7"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M9.00212 0L5.09068 4.10187L1.211 0L0.0205562 1.24839L5.08101 6.59865L10.1829 1.24839L9.00212 0Z"
                      fill="#6E7191"
                    />
                  </svg>
                )}
              </span>
              {item === "Executed" &&
                visibleExcutedPopup &&
                props.page !== "los orders" && (
                  <div className="absolute rounded-[20px] z-40 p-5 bg-white shadow-md shadow-slate-200 flex flex-col items-start gap-[15px]">
                    {excutedFilter.map((filter, index) => {
                      // Only render if the page is not "new site" and filter.title is not "Missing return voucher"
                      if (
                        !(
                          props.page === "new site" &&
                          filter.title === "Missing return voucher"
                        )
                      ) {
                        return (
                          <span
                            key={index}
                            className={`text-[14px] text-nowrap cursor-pointer ${
                              selectedExcutedFilter === filter.title
                                ? "text-primary"
                                : "text-n600"
                            }`}
                            onClick={() => {
                              // Handle the filter click logic
                              if (filter.title === "All") {
                                handleFilterClick("executed");
                              } else {
                                handleFilterClick(filter.title);
                              }
                              setSelectedExcutedFilter(filter.title);
                              setVisibleExcutedPopup(false);
                              localStorage.setItem(
                                "selectedSubExecutedFilter",
                                filter.title
                              );
                            }}
                          >
                            {filter.title}
                          </span>
                        );
                      }
                      // Return null if the condition is not met
                      return null;
                    })}
                  </div>
                )}
            </div>
          ))}
        </div>
        {["0", "1"].includes(localStorage.getItem("role")!) && (
          <div className="flex items-center gap-[7px]">
            {props.functionalties &&
            props.functionalties.secondaryFuncs &&
            localStorage.getItem("role") === "0"
              ? props.functionalties.secondaryFuncs.map((button, index) => {
                  return (
                    <button
                      key={index}
                      className={`flex items-center gap-[3px] text-[14px] font-medium leading-[21px] xl:px-[18px] px-[15px] xl:py-[8px] py-[6.5px] border-[1.2px] rounded-[21px] ${
                        selectedExtension?.length === 0
                          ? "text-n600 border-n400"
                          : button.name === "Delete"
                          ? "cursor-pointer text-[#DB2C2C] border-[#DB2C2C] bg-[#FFECEC]"
                          : "text-n600 border-n400"
                      }`}
                      aria-disabled={
                        selectedExtension?.length === 0 &&
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
            {props.functionalties && props.functionalties.primaryFunc && (
              <div className="relative">
                <button
                  className={`flex items-center gap-[3px] text-[14px] leading-[21px] font-medium xl:px-[18px] px-[15px] xl:py-[8px] py-[6.5px] ${
                    props.page === "los orders"
                      ? "text-primary border-[2px] border-primary"
                      : "text-white bg-primary"
                  }  rounded-[21px] `}
                  onClick={() => {
                    if (props.page === "los orders") {
                      setVisibleMonthCalender(!visibleMonthCalender);
                    }
                    props.handleAddPrimaryButtonClick;
                  }}
                >
                  {props.functionalties.primaryFunc.name}
                </button>
                {props.page === "los orders" && visibleMonthCalender && (
                  <MonthCalender
                    setMonth={props.functionalties.setState!}
                    selectedMonth={props.functionalties.State as number}
                    setYear={props.functionalties.setState2!}
                    selectedYear={props.functionalties.State2 as number}
                    setVisibility={setVisibleMonthCalender}
                    setFilter={setSelectedFilter}
                  />
                )}
              </div>
            )}
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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.3405 0.215332L5.42905 4.266L1.54938 0.215332L0.358935 1.44815L5.41939 6.73163L10.5213 1.44815L9.3405 0.215332Z"
                fill="#4A3AFF"
              />
            </svg>
          </h3>

          {isOpen && (
            <ul className="absolute sm:w-[300px] w-[270px] bg-white rounded-[30px] shadow-lg mt-2 z-30">
              {props.flitration.map((option) => (
                <div className="relative" key={option}>
                  <li
                    className={`px-[18px] py-[10px] flex items-center gap-3 text-n600 sm:text-[16px] text-[14px] cursor-pointer hover:bg-gray-100 ${
                      option === selectedFilter ? "bg-gray-100" : ""
                    }`}
                    onClick={() => {
                      if (
                        option === "Executed" &&
                        props.page !== "los orders"
                      ) {
                        setVisibleExcutedPopup(!visibleExcutedPopup);
                      } else {
                        setSelectedFilter(option);
                        setIsOpen(false);
                        handleFilterClick(option.toLowerCase());
                        setSelectedExcutedFilter("");
                      }
                    }}
                  >
                    {option}
                    {option === "Executed" && props.page !== "los orders" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="9"
                        height="6"
                        viewBox="0 0 9 6"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M7.6591 0.0488281L4.33048 3.24385L1.03362 0.0488281L0.0205562 1.02123L4.32081 5.18865L8.66249 1.02123L7.6591 0.0488281Z"
                          fill="#6F6C8F"
                        />
                      </svg>
                    )}
                  </li>
                  {option === "Executed" && props.page !== "los orders" && (
                    <div
                      className={`flex flex-col items-start gap-2 transition-all duration-1000 overflow-hidden ${
                        visibleExcutedPopup ? "h-[145px]" : "h-0"
                      }`}
                    >
                      {excutedFilter.map((filter, index) => {
                        if (
                          !(
                            props.page === "new site" &&
                            filter.title === "Missing return voucher"
                          )
                        ) {
                          return (
                            <sub
                              key={`sub-${index}`}
                              className={`w-full px-[28px] py-[14px] ${
                                selectedExcutedFilter === filter.title
                                  ? "text-primary"
                                  : "text-n600"
                              } sm:text-[16px] text-[14px] cursor-pointer hover:bg-gray-100 text-nowrap`}
                              onClick={() => {
                                if (filter.title === "All") {
                                  handleFilterClick("executed");
                                } else {
                                  handleFilterClick(filter.title);
                                }
                                setSelectedExcutedFilter(filter.title);
                                setIsOpen(false);
                                localStorage.setItem(
                                  "selectedSubExecutedFilter",
                                  filter.title
                                );
                              }}
                            >
                              {filter.title}
                            </sub>
                          );
                        }
                        return null; // Don't render anything for this filter
                      })}
                    </div>
                  )}
                </div>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 flex-row-reverse">
          {props.functionalties && props.functionalties.primaryFunc && (
            <div className="relative">
              <button
                className={`hidden md:inline-block capitalize lg:hidden text-[14px] items-center gap-[3px] text-center justify-center leading-[21px] font-semibold xl:px-[18px] px-[15px] xl:py-[8px] py-[6.5px] rounded-[21px] ${
                  props.page === "los orders"
                    ? "text-primary border-[2px] border-primary"
                    : "text-white bg-primary"
                }`}
                onClick={() => {
                  if (props.page === "los orders") {
                    setVisibleMonthCalender(!visibleMonthCalender);
                  }
                  props.handleAddPrimaryButtonClick;
                }}
              >
                {props.functionalties && props.functionalties.primaryFunc.name}
              </button>
              {props.page === "los orders" && visibleMonthCalender && (
                <MonthCalender
                  setMonth={props.functionalties.setState!}
                  selectedMonth={props.functionalties.State as number}
                  setYear={props.functionalties.setState2!}
                  selectedYear={props.functionalties.State2 as number}
                  setVisibility={setVisibleMonthCalender}
                  setFilter={setSelectedFilter}
                />
              )}
            </div>
          )}

          {props.functionalties &&
            props.functionalties.secondaryFuncs?.some(
              (func) => func.name === "Delete"
            ) &&
            localStorage.getItem("role") === "0" && (
              <button
                className={`flex capitalize lg:hidden items-center gap-[3px] text-[14px] font-medium leading-[21px] xl:px-[18px] px-[15px] xl:py-[8px] py-[6.5px] border-[1.2px] rounded-[21px] ${
                  selectedExtension?.length === 0
                    ? "text-n600 border-n400"
                    : "cursor-pointer text-[#DB2C2C] border-[#DB2C2C] bg-[#FFECEC]"
                }`}
                onClick={props.handleSecondaryButtonClick}
              >
                Delete
              </button>
            )}
        </div>
      </div>

      {props.children}
    </main>
  );
};
export default Main;
