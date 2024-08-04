import React from "react";

interface WorkOrderPriorityProps {
  priority: 0 | 1 | 2 | 3;
  styles: {
    fontSize: number;
    px: number;
    py: number;
  };
}

const WorkOrderpriority: React.FC<WorkOrderPriorityProps> = ({
  priority,
  styles,
}) => {
  return (
    <span
      className={`rounded-[100px] text-[${
        styles.fontSize
      }px] font-medium leading-[15px] bg-[#FEF6FF] ${
        priority === 0
          ? "text-primary"
          : priority === 1
          ? "text-[#DB2C9F]"
          : priority === 2
          ? "text-[#FFAA29]"
          : "text-[#DB2C2C]"
      }`}
      style={{ padding: `${styles.py}px ${styles.px}px ` }}
    >
      {priority === 0
        ? "Low"
        : priority === 1
        ? "Medium"
        : priority === 2
        ? "High"
        : "Urgent"}
    </span>
  );
};

export default WorkOrderpriority;
