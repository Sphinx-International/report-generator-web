import React from "react";

interface WorkOrderStatusProps {
  status:
    | 0
    | 1
    | 2
    | 3
    | "acc"
    | "rep"
    | "vo"
    | "noRep"
    | "noAcc"
    | "noVo"
    | "unneededAcc"
    | "unneededVo"
    | "onUpRep"
    | "onUpAcc"
    | "onUpVo";
  styles: {
    fontSize: number;
    px: number;
    py: number;
  };
  setState?: React.Dispatch<React.SetStateAction<boolean>>;
}

const WorkOrderStatus: React.FC<WorkOrderStatusProps> = ({
  status,
  styles,
  setState,
}) => {
  const handleClick = () => {
    if (setState) {
      setState((prevState) => !prevState); // Toggle the boolean state
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`rounded-[100px] cursor-pointer text-nowrap sm:text-[${
        styles.fontSize
      }px] text-[11px] sm:px-[${styles.px}] px-[16px] sm:py-[${styles.py}] py-[7px] font-medium leading-[15px] ${
        status === 0
          ? "bg-[#F6FFF9] text-[#48C1B5]"
          : status === 1
          ? "bg-[#F6FFF9] text-[#48C1B5]"
          : status === 2
          ? "bg-n300 text-n600"
          : status === 3
          ? "bg-primary text-white"
          : status === "acc" || status === "rep" || status === "vo"
          ? "bg-[#C8ECE98A] text-[#48C1B5]"
          : status === "noAcc" || status === "noRep" || status === "noVo"
          ? "bg-[#F8D7DA8A] text-[#D9534F]"
          : status === "unneededAcc" || status === "unneededVo"
          ? "bg-[#E0E0E0] text-[#A0A0A0]"
          : status === "onUpRep" || status === "onUpAcc" || status === "onUpVo"
          ? "bg-[#E0F7FA] text-[#0288D1]"
          : "bg-primary text-white"
      } `}
     // style={{ padding: `${styles.py}px ${styles.px}px ` }}
    >
      {status === 0
        ? "created"
        : status === 1
        ? "assigned"
        : status === 2
        ? "executed"
        : status === 3
        ? "Closed"
        : status === "rep" || status === "noRep"
        ? "Reported" : status === "onUpRep" ? "Uploading Report.."
        : status === "acc" || status === "noAcc" || status === "unneededAcc" 
        ? "Acceptance" : status === "onUpAcc" ? "Uploading Acceptance.."
        : status === "vo" || status === "noVo" || status === "unneededVo" 
        ? "Return voucher" : status === "onUpVo" ? "Uploading Voucher.."
        : "Uknown status"}
    </span>
  );
};

export default WorkOrderStatus;
