interface Month {
  name: string;
  number: number;
}

const months: Month[] = [
  { name: "Jan", number: 1 },
  { name: "Feb", number: 2 },
  { name: "Mar", number: 3 },
  { name: "Apr", number: 4 },
  { name: "May", number: 5 },
  { name: "Jun", number: 6 },
  { name: "Jul", number: 7 },
  { name: "Aug", number: 8 },
  { name: "Sep", number: 9 },
  { name: "Oct", number: 10 },
  { name: "Nov", number: 11 },
  { name: "Dec", number: 12 },
];

interface MonthCalenderProps {
  setMonth: React.Dispatch<React.SetStateAction<unknown>>;
  selectedMonth: number;
  setYear: React.Dispatch<React.SetStateAction<unknown>>;
  selectedYear: number;
  setVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

const MonthCalender: React.FC<MonthCalenderProps> = ({
  setMonth,
  selectedMonth,
  setYear,
  selectedYear,
  setVisibility,
  setFilter,
}) => {
  return (
    <div className="absolute rounded-[15px] bg-white z-50 shadow-lg shadow-slate-300 right-0 top-12 p-3 w-[330px] flex flex-col items-center gap-3">
      <div className="flex items-center gap-[50px] w-full justify-center">
        <svg
          onClick={() => {
            setYear(++selectedYear);
          }}
          className="cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.628842 5.61168C0.464983 5.44762 0.372945 5.22523 0.372945 4.99335C0.372945 4.76148 0.464983 4.53908 0.628842 4.37502L3.92818 1.07452C4.09232 0.910447 4.31492 0.818305 4.54701 0.818359C4.77909 0.818414 5.00165 0.910661 5.16572 1.07481C5.32979 1.23896 5.42193 1.46156 5.42187 1.69364C5.42182 1.92572 5.32957 2.14828 5.16543 2.31235L2.48443 4.99335L5.16543 7.67435C5.32489 7.8393 5.41319 8.06029 5.41131 8.28971C5.40942 8.51914 5.31751 8.73864 5.15535 8.90095C4.99319 9.06326 4.77377 9.15539 4.54435 9.15749C4.31493 9.15959 4.09386 9.0715 3.92876 8.91219L0.628258 5.61227L0.628842 5.61168Z"
            fill="#4A3AFF"
          />
        </svg>
        <span className="text-primary text-[15px] font-medium">
          {selectedYear}
        </span>
        {selectedYear !== 2024 && (
          <svg
            onClick={() => {
              setYear(--selectedYear);
            }}
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.37116 4.38832C5.53502 4.55238 5.62706 4.77477 5.62706 5.00665C5.62706 5.23852 5.53502 5.46092 5.37116 5.62498L2.07182 8.92548C1.90768 9.08955 1.68508 9.1817 1.45299 9.18164C1.22091 9.18159 0.998352 9.08934 0.834283 8.92519C0.670213 8.76104 0.57807 8.53844 0.578125 8.30636C0.57818 8.07428 0.670427 7.85172 0.834574 7.68765L3.51557 5.00665L0.834574 2.32565C0.675106 2.1607 0.586806 1.93971 0.58869 1.71029C0.590575 1.48086 0.682494 1.26136 0.844651 1.09905C1.00681 0.936738 1.22623 0.844612 1.45565 0.842511C1.68507 0.84041 1.90614 0.928502 2.07124 1.08781L5.37174 4.38773L5.37116 4.38832Z"
              fill="#4A3AFF"
            />
          </svg>
        )}
      </div>
      <div className="w-full flex items-center gap-2 flex-wrap">
        {months.map((month, index) => {
          return (
            <span
              key={index}
              className={`p-1 text-[14px] hover:bg-slate-100 w-[23%] text-center cursor-pointer rounded-md ${
                selectedMonth === month.number
                  ? "text-primary font-medium"
                  : "text-n700"
              }`}
              onClick={() => {
                setVisibility(false);
                localStorage.setItem("selectedFilterForLos", "all");
                setFilter("all");
                if (selectedMonth === month.number) {
                  setMonth!(null);
                } else {
                  setMonth!(month.number);
                }
              }}
            >
              {month.name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalender;
