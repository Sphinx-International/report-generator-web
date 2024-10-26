import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Linechart from "../components/dashboard/Linechart";
import { useState, useEffect } from "react";
import { getWorkorderCount } from "../func/analyticsApis";
import { ThreeDots } from "react-loader-spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/Swiper.css";
import { projects } from "../assets/Projects";

type Analytics = {
  title: string;
  analytics_type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const Dashboard = () => {

  const analytics: Analytics[] = [
    {
      title: "Created WO",
      analytics_type: 0,
    },
    {
      title: "Assigned WO",
      analytics_type: 1,
    },
    {
      title: "Executed WO",
      analytics_type: 2,
    },
    {
      title: "Reports",
      analytics_type: 3,
    },
    {
      title: "Acceptance certificate",
      analytics_type: 4,
    },
    {
      title: "Return voucher",
      analytics_type: 5,
    },
    {
      title: "Closed WO",
      analytics_type: 6,
    },
  ];
  const [openProjectTypeDropDown, setOpenProjectTypeDropDown] =
    useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>("Workorders");
  const [analyticsTiming, setAnalyticsTiming] = useState<0 | 1 | 2 | 3 | 4>(3);

  const [counts, setCounts] = useState<number[]>([]); // Array to store counts

  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  const [performance, setPerformance] = useState<string[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: number[] = [];
      const performanceChanges: string[] = [];
      setAnalyticsLoading(true);

      for (const analytic of analytics) {
        const countResponse = await getWorkorderCount(
          analyticsTiming, // Use updated timing
          analytic.analytics_type
        );

        const currentCount =
          countResponse && countResponse.length > 0
            ? countResponse[countResponse.length - 1].count
            : 0;

        // Calculate previous count based on the timing
        const previousCount =
          countResponse && countResponse.length > 1
            ? countResponse[countResponse.length - 2].count
            : 0;

        newCounts.push(currentCount);

        // Calculate performance: (current - previous) / previous * 100
        if (previousCount > 0) {
          const change = ((currentCount - previousCount) / previousCount) * 100;
          const formattedChange =
            change > 0
              ? `${change.toFixed(1)}% Up from previous`
              : change < 0
              ? `${Math.abs(change).toFixed(1)}% Down from previous`
              : "No change from previous";
          performanceChanges.push(formattedChange); // Store the performance
        } else {
          performanceChanges.push("No data to compare");
        }
      }

      setCounts(newCounts);
      setPerformance(performanceChanges);
      setAnalyticsLoading(false);
    };

    fetchCounts(); // Fetch counts when timing changes
  }, [analyticsTiming]);

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] lg:pr-[30px] sm:px-[30px] px-[15px] md:pt-[32px] pt-[20px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here is some general information"
          searchBar={false}
        />
        <div className="flex flex-col gap-8 w-full">
          <div className="w-full flex flex-col items-start gap-3">
            <h1 className="text-primary font-semibold sm:text-[23px] text-[18px]">
              Dashboard
            </h1>
            <div className="w-full flex items-center justify-between">
              <h4 className="sm:text-[21px] text-n800 font-medium leading-5 lg:pl-0 pl-5">
                Statistics
              </h4>
              <div className="flex items-center gap-4">
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
                <div className="relative">
                  <svg
                    onClick={() => {
                      setOpenProjectTypeDropDown(!openProjectTypeDropDown);
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="11"
                    viewBox="0 0 18 11"
                    fill="none"
                    className="cursor-pointer"
                  >
                    <path
                      d="M18 1.99961L16.5 0.599609L9 7.99961L1.5 0.599609L0 1.99961L9 10.9996L18 1.99961Z"
                      fill="#666666"
                    />
                  </svg>
                  {openProjectTypeDropDown && (
                    <div className="absolute right-0 z-40 rounded-[15px] py-6 shadow-lg shadow-slate-300 bg-white flex flex-col items-start gap-4">
                      <h6 className="sm:text-[20px] text-[18px] text-n800 leading-[31px] font-semibold px-6">
                        Type
                      </h6>
                      <div className="flex flex-col items-start gap-1">
                        {projects.map((project, index) => {
                          return (
                            <span
                              key={index}
                              className={`sm:text-[17px] text-n600 font-medium text-nowrap py-1 px-6 hover:bg-slate-200 cursor-pointer w-full ${
                                selectedProject === project && "text-primary"
                              }`}
                              onClick={() => {
                                setSelectedProject(project);
                                setOpenProjectTypeDropDown(false);
                              }}
                            >
                              {project}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              navigation={true} // Enable navigation
              // pagination={{ clickable: true }} // Enable pagination
              modules={[Navigation, Pagination]} // Add Navigation and Pagination modules here
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="px-7"
            >
              {analytics.map((analytic, index) => (
                <SwiperSlide key={index}>
                  <div className="rounded-[16px] border-[1px] border-[#E6EDFF] p-4 flex items-start flex-col gap-[15px]">
                    <div className="flex flex-col items-start gap-[10px] w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[14px] text-primary font-medium">
                          {analytic.title}
                        </span>
                        <div className="flex items-center justify-center bg-sec rounded-full w-[31px] h-[31px] relative z-10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="18"
                            viewBox="0 0 14 18"
                            fill="none"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M9.49967 0.666016C9.79223 0.666023 10.0796 0.743037 10.333 0.889317C10.5863 1.0356 10.7967 1.24599 10.943 1.49935H11.9997C12.4417 1.49935 12.8656 1.67494 13.1782 1.9875C13.4907 2.30006 13.6663 2.72399 13.6663 3.16602V13.166C13.6663 14.2711 13.2274 15.3309 12.446 16.1123C11.6646 16.8937 10.6047 17.3327 9.49967 17.3327H1.99967C1.55765 17.3327 1.13372 17.1571 0.821163 16.8445C0.508602 16.532 0.333008 16.108 0.333008 15.666V3.16602C0.333008 2.72399 0.508602 2.30006 0.821163 1.9875C1.13372 1.67494 1.55765 1.49935 1.99967 1.49935H3.05634C3.20262 1.24599 3.41301 1.0356 3.66636 0.889317C3.91972 0.743037 4.20712 0.666023 4.49967 0.666016H9.49967ZM2.83301 3.16602H1.99967V15.666H9.49967C10.1627 15.666 10.7986 15.4026 11.2674 14.9338C11.7363 14.4649 11.9997 13.8291 11.9997 13.166V3.16602H11.1663C11.1663 3.60804 10.9907 4.03197 10.6782 4.34453C10.3656 4.65709 9.9417 4.83268 9.49967 4.83268H4.49967C4.05765 4.83268 3.63372 4.65709 3.32116 4.34453C3.0086 4.03197 2.83301 3.60804 2.83301 3.16602ZM10.5313 6.81518C10.6876 6.97146 10.7753 7.18338 10.7753 7.40435C10.7753 7.62532 10.6876 7.83724 10.5313 7.99352L6.40634 12.1185C6.25007 12.2747 6.03814 12.3625 5.81717 12.3625C5.5962 12.3625 5.38428 12.2747 5.22801 12.1185L3.46134 10.3502C3.31318 10.1924 3.23222 9.98319 3.23558 9.76678C3.23894 9.55038 3.32636 9.34377 3.47935 9.19068C3.63233 9.03758 3.83888 8.95002 4.05528 8.9465C4.27169 8.94299 4.48097 9.0238 4.63884 9.17185L5.81801 10.3502L9.35301 6.81518C9.50928 6.65896 9.7212 6.57119 9.94217 6.57119C10.1631 6.57119 10.3751 6.65896 10.5313 6.81518ZM9.49967 2.33268H4.49967V3.16602H9.49967V2.33268Z"
                              fill="#4A3AFF"
                            />
                          </svg>
                        </div>
                      </div>
                      <h6 className="text-n800 leading-[36px] text-[24px] font-medium">
                        {analyticsLoading ? (
                          <ThreeDots color="#4A3AFF" width="36" height="36" />
                        ) : (
                          counts[index]
                        )}
                      </h6>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23"
                        height="12"
                        viewBox="0 0 23 12"
                        fill="none"
                      >
                        <path
                          d="M16.1006 0L18.5774 2.29L13.2994 7.17L8.97323 3.17L0.958984 10.59L2.48396 12L8.97323 6L13.2994 10L20.1131 3.71L22.5899 6V0H16.1006Z"
                          fill="#4A3AFF"
                        />
                      </svg>
                      <p className="text-[12px] leading-[21px] text-550 font-medium">
                        {analyticsLoading ? (
                          <ThreeDots color="#4A3AFF" width="36" height="36" />
                        ) : (
                          performance[index]
                        )}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <Linechart title="Productivity"/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
