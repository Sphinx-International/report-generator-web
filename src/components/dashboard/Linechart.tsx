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

const data = [
  { name: "Jan", productivity: 20 },
  { name: "Feb", productivity: 40 },
  { name: "Mar", productivity: 45 },
  { name: "Apr", productivity: 80 },
  { name: "May", productivity: 50 },
  { name: "June", productivity: 50 },
  { name: "July", productivity: 60 },
  { name: "Aug", productivity: 80 },
  { name: "Sep", productivity: 55 },
  { name: "Oct", productivity: 0 },
  { name: "Nov", productivity: 20 },
  { name: "Dec", productivity: 50 },

  // ...other data points
];

const Linechart = () => (
  <div className="flex flex-col gap-[50px] w-full px-7 py-10 border-[1px] border-[#E6EDFF] rounded-[20px]">
    <div className="flex items-center justify-between w-full">
      <h4 className="text-[21px] text-n800 font-medium leading-5">
        Productivity
      </h4>
      <select
        name="timing"
        id="timing"
        className="p-[10px] border-[1px] border-[#D5D5D5] rounded-[4px] text-[12px] text-n500 font-medium"
        defaultValue={"mt"}
      >
        <option value="yr">Yearly</option>
        <option value="mt">monthly</option>
        <option value="wk">Weekly</option>
      </select>
    </div>
    <ResponsiveContainer width="100%" height={320}>
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
          dataKey="productivity"
          stroke="#3366ff"
          fill="url(#gradient)"
        />

        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />

        {/* Add dots to each value */}
        <Line
          type="monotone"
          dataKey="productivity"
          stroke="#3366ff"
          dot={{ r: 6, stroke: "#3366ff", fill: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default Linechart;
