import {
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
} from "recharts";
import {
  getWorkorderCount,
  getUserPerformance,
} from "../../func/analyticsApis";
import { useEffect, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { RotatingLines } from "react-loader-spinner";
import { User } from "../../assets/types/User";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
type WoOptions = {
  name: string;
  value: string;
  analytics_type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};
const woTypes: WoOptions[] = [
  {
    name: "Created",
    value: "cr",
    analytics_type: 0,
  },
  {
    name: "Assigned",
    value: "as",
    analytics_type: 1,
  },
  {
    name: "Executed",
    value: "ex",
    analytics_type: 2,
  },
  {
    name: "Report Uploaded",
    value: "ru",
    analytics_type: 3,
  },
  {
    name: "Accepted",
    value: "ac",
    analytics_type: 4,
  },
  {
    name: "Return Voucher",
    value: "rv",
    analytics_type: 5,
  },
  {
    name: "Closed",
    value: "cl",
    analytics_type: 6,
  },
];

type LinechartProps = {
  title: string;
  user?: User;
};

const Linechart: React.FC<LinechartProps> = ({ title, user }) => {
  const [analyticsTiming, setAnalyticsTiming] = useState<0 | 1 | 2 | 3 | 4>(3);
  const [selectedOption, setSelectedOption] = useState<WoOptions>({
    name: "Created",
    value: "cr",
    analytics_type: 0,
  });
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const countResponse =
          title === "Productivity"
            ? await getWorkorderCount(
                analyticsTiming,
                selectedOption.analytics_type,
                setIsLoading
              )
            : title === "User performance"
            ? await getUserPerformance(analyticsTiming, user!.id, setIsLoading)
            : null;
        setData(countResponse);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [analyticsTiming, selectedOption, user]);

  return (
    <div className="flex flex-col gap-[50px] w-full lg:px-7 pr-5 py-10 border-[1px] border-[#E6EDFF] rounded-[20px] h-[500px]">
      <div className="flex flex-col items-start gap-3 lg:pl-0 pl-5">
        <div className="flex sm:items-center sm:flex-row flex-col sm:gap-0 gap-2 justify-between w-full ">
          <h4 className="sm:text-[21px] text-n800 font-medium leading-5">
            {title}
          </h4>
          <div className="flex items-center gap-3">
            {title === "Productivity" && (
              <select
                name="type-wo"
                id="type-wo"
                className="sm:p-[10px] p-[8px] border-[1px] border-[#D5D5D5] sm:rounded-[4px] rounded-[8px] ms:text-[12px] text-[10px] text-n500 font-medium"
                defaultValue={"all"}
                onChange={(e) => {
                  const selected = woTypes.find(
                    (option) => option.value === e.target.value
                  );
                  setSelectedOption(selected!);
                }}
              >
                {woTypes.map((option, index) => {
                  return (
                    <option key={index} value={option.value}>
                      {option.name}
                    </option>
                  );
                })}
              </select>
            )}

            <select
              name="timing"
              id="timing"
              className="sm:p-[10px] p-[8px] border-[1px] border-[#D5D5D5] sm:rounded-[4px] rounded-[8px] ms:text-[12px] text-[10px] text-n500 font-medium"
              value={
                analyticsTiming === 1
                  ? "dy"
                  : analyticsTiming === 2
                  ? "wk"
                  : analyticsTiming === 3
                  ? "mt"
                  : "yr"
              }
              onChange={(e) => {
                const value = e.target.value;
                switch (value) {
                  case "dy":
                    setAnalyticsTiming(1);

                    break;
                  case "wk":
                    setAnalyticsTiming(2);

                    break;
                  case "mt":
                    setAnalyticsTiming(3);

                    break;
                  case "yr":
                    setAnalyticsTiming(4);

                    break;
                  default:
                    setAnalyticsTiming(0);
                    break;
                }
              }}
            >
              <option value="dy">Daily</option>
              <option value="wk">Weekly</option>
              <option value="mt">Monthly</option>
              <option value="yr">Yearly</option>
            </select>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <h6 className="font-semibold text-n800 sm:text-[18px] text-[15px]">User:</h6>
          <span className="font-medium text-n600 sm:text-[16px] text-[13px]">
            {user.first_name} {user.last_name}
          </span>
          </div>

        )}
      </div>

      {isLoading ? (
        <div className="w-full flex items-center justify-center">
          <RotatingLines strokeColor="#4A3AFF" width="40" />
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height="80%"
          style={{ overflowX: "hidden" }}
        >
          <AreaChart data={data}>
            <defs>
              {/* Define the gradient */}
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3366ff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3366ff" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Add Area with gradient */}
            <Area
              type="monotone"
              dataKey={title === "Productivity" ? "count" : "score"}
              stroke="#3366ff"
              fill="url(#gradient)"
            />

            <XAxis
              dataKey="date"
              tickFormatter={(tick) => {
                let date;
                if (typeof tick === "string") {
                  date = parseISO(tick);
                } else if (tick instanceof Date) {
                  date = tick;
                } else {
                  date = new Date(tick);
                }

                // Validate if `date` is a valid Date object
                if (!isValid(date)) {
                  console.error("Invalid date:", tick);
                  return tick;
                }

                if (analyticsTiming === 1) {
                  return format(date, "d");
                }

                // Weekly: Format as '1, Oct - 7, Oct'
                if (analyticsTiming === 2) {
                  const startOfWeek = format(date, "d MMM");
                  const endOfWeek = format(
                    new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000),
                    "d MMM"
                  );
                  return `${startOfWeek} - ${endOfWeek}`;
                }

                if (analyticsTiming === 3) {
                  return monthNames[date.getMonth()];
                }

                if (analyticsTiming === 4) {
                  return format(date, "yyyy");
                }

                return tick;
              }}
            />
            <YAxis
              domain={
                analyticsTiming === 4
                  ? [0, 500]
                  : analyticsTiming === 3
                  ? [0, 150]
                  : analyticsTiming === 2
                  ? [0, 80]
                  : [0, 10]
              }
            />
            <Tooltip />
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />

            {/* Add dots to each value */}
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3366ff"
              dot={{ r: 6, stroke: "#3366ff", fill: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Linechart;
