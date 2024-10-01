import React from "react";

interface PaginationProps {
  buttonTitle: string;
  buttonFunc: () => void;
  currentPage: number;
  totalPages: number;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  return (
    <div className="md:relative z-20 sticky bottom-0 bg-white sm:p-[20px] py-[20px] md:p-0 w-full flex flex-col gap-[20.5px] items-center ">
      <div className="flex items-center lg:gap-[36px] sm:gap-[26px] gap-[21px] ">
        <span         className={` font-medium text-primary sm:text-[14px] text-[11px] ${props.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}

        onClick={props.onFirstPage}>
          {"<< First"}
        </span>
        <div className="flex items-center lg:gap-[25px] sm:gap-[16px] gap-[13px]">
          <span 
          className={`font-medium text-primary sm:text-[14px] text-[11px] ${props.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={props.onPreviousPage}>
            {"< Previous"}
          </span>
          <span className="rounded-[9px] px-[18px] sm:px-[40px] lg:px-[50px] py-[7px] bg-[#F3F4F8] sm:text-[15px] text-[12px]">
          {props.currentPage}
          </span>
          <span 
          className={`font-medium text-primary sm:text-[14px] text-[11px] ${props.currentPage === props.totalPages || props.totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={props.onNextPage}>
            {"Next >"}
          </span>
        </div>
        <span 
        className={`font-medium text-primary sm:text-[14px] text-[11px] ${props.currentPage === props.totalPages || props.totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={props.onLastPage}>
          {"Last >>"}
        </span>
      </div>

      <button
        className="md:hidden capitalize flex items-center gap-[3px] text-center justify-center leading-[21px] font-semibold sm:w-[90%] w-[80%] xl:px-[20px] px-[16px]  py-[12px] text-white rounded-[21px] bg-primary"
        onClick={props.buttonFunc}
      >
        {props.buttonTitle}
      </button>
    </div>
  );
};

export default Pagination;
