import React from "react";

interface WorkOrderStatusProps {
  status: 0 | 1 | 2 | 3;
  styles: {
    fontSize: number;
    px: number;
    py: number;
  };
  setState?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LosStatus: React.FC<WorkOrderStatusProps> = ({
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
      }px] text-[11px] sm:px-[${styles.px}] px-[16px] sm:py-[${
        styles.py
      }] py-[7px] font-medium leading-[15px] ${
        status === 0
          ? "bg-[#F6FFF9] text-[#48C1B5]"
          : status === 1
          ? "bg-[#F6FFF9] text-[#48C1B5]"
          : status === 2
          ? "bg-n300 text-n600"
          : status === 3
          ? "bg-primary text-white"
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
        ? "Submitted"
        : "Uknown status"}
    </span>
  );
};

export default LosStatus;
