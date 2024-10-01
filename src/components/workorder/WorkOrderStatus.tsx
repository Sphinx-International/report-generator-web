import React from 'react';

interface WorkOrderStatusProps {
    status: 0 | 1 | 2 | 3 | 4 | 5;
    styles:{
        fontSize:number
        px:number,
        py:number,
    }
}

const WorkOrderStatus: React.FC<WorkOrderStatusProps> = ({ status,styles }) => {
    return (
        <span
        className={`rounded-[100px] text-[${styles.fontSize}px] font-medium leading-[15px] ${
          status === 0
            ? "bg-[#F6FFF9] text-[#48C1B5]"
            : status === 1
            ? "bg-[#F6FFF9] text-[#48C1B5]"
            : status === 2
            ? "bg-n300 text-n600"
            : status === 3
            ? "bg-[#FEF6FF] text-primary"
            : status === 4
            ? "bg-[#F6FFF9] text-[#48C1B5]"
            : "bg-primary text-white"
        } `}
        style={{padding: `${styles.py}px ${styles.px}px `}}
      >
        {status === 0
          ? "created"
          : status === 1
          ? "assigned"
          : status === 2
          ? "executed"
          : status === 3
          ? "validated"
          : status === 4
          ? "Acceptance"
        
          : status === 5
          ? "Closed"
          : status === 6 ?  "Update Requested" : "Uknown status"}
      </span>
    );
}

export default WorkOrderStatus;
