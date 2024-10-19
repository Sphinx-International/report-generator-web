import React from "react";

interface WorkOrderStatusProps {
  status: 0 | 1 | 2 | 3 | "acc" | "rep" | "vo" | "noRep" | "noAcc" | "noVo";
  styles: {
    fontSize: number;
    px: number;
    py: number;
  };
}

const WorkOrderStatus: React.FC<WorkOrderStatusProps> = ({
  status,
  styles,
}) => {
  return (
    <span
      className={`rounded-[100px] text-[${
        styles.fontSize
      }px] font-medium leading-[15px] ${
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
          : "bg-primary text-white"
      } `}
      style={{ padding: `${styles.py}px ${styles.px}px ` }}
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
        ? "Reported"
        : status === "acc"  || status === "noAcc"
        ? "Acceptance"
        : status === "vo"  || status === "noVo"
        ? "Return voucher"
        : "Uknown status"}
    </span>
  );
};

export default WorkOrderStatus;
