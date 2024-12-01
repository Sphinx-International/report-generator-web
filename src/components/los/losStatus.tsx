import React from "react";

interface WorkOrderStatusProps {
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
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

  // Define colors for each status
  const customColors: Record<number, { bg: string; text: string }> = {
    0: { bg: "#F6FFF9", text: "#48C1B5" }, // Created
    1: { bg: "#F6FFF9", text: "#48C1B5" }, // Assigned
    2: { bg: "#E3E3E3", text: "#595959" }, // Executed
    3: { bg: "#0052CC", text: "#FFFFFF" }, // Submitted
    4: { bg: "#E8F4FF", text: "#007BFF" }, // Generated
    5: { bg: "#FFF5F5", text: "#FF5A5A" }, // Rejected
    6: { bg: "#E5F7E8", text: "#4CAF50" }, // Approved
    7: { bg: "#F3F3F3", text: "#888888" }, // Closed
  };

  // Default fallback if status is not found
  const { bg, text } = customColors[status] || {
    bg: "#FFFFFF",
    text: "#000000",
  };

  return (
    <span
      onClick={handleClick}
      className="rounded-[100px] cursor-pointer text-nowrap font-medium leading-[15px]"
      style={{
        backgroundColor: bg,
        color: text,
        fontSize: `${styles.fontSize}px`,
        padding: `${styles.py}px ${styles.px}px`,
      }}
    >
      {status === 0
        ? "Created"
        : status === 1
        ? "Assigned"
        : status === 2
        ? "Executed"
        : status === 3
        ? "Submitted"
        : status === 4
        ? "Generated"
        : status === 5
        ? "Rejected"
        : status === 6
        ? "Approved"
        : status === 7
        ? "Closed"
        : "Unknown status"}
    </span>
  );
};

export default LosStatus;
