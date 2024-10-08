import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Linechart from "../components/dashboard/Linechart";

const Dashboard = () => {
  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here is some general information"
          searchBar={false}
        />
        <div className="flex flex-col gap-8 w-full">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-primary font-semibold text-[23px]">
              Dashboard
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="11"
              viewBox="0 0 18 11"
              fill="none"
            >
              <path
                d="M18 1.99961L16.5 0.599609L9 7.99961L1.5 0.599609L0 1.99961L9 10.9996L18 1.99961Z"
                fill="#666666"
              />
            </svg>
          </div>
          <div className="w-full flex items-center gap-[9px] flex-wrap">
            {Array.from({ length: 4 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="rounded-[16px] border-[1px] border-[#E6EDFF] flex-grow p-5 flex items-start flex-col gap-[15px]"
                >
                  <div className="flex flex-col items-start gap-[10px] w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[14px] text-primary font-medium">
                        Total Workorders
                      </span>
                      <div className="flex items-center justify-center bg-sec rounded-full w-[31px] h-[31px] relative z-10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M12.5007 1.66602C12.7932 1.66602 13.0806 1.74304 13.334 1.88932C13.5873 2.0356 13.7977 2.24599 13.944 2.49935H15.0007C15.4427 2.49935 15.8666 2.67494 16.1792 2.9875C16.4917 3.30006 16.6673 3.72399 16.6673 4.16602V14.166C16.6673 15.2711 16.2283 16.3309 15.4469 17.1123C14.6655 17.8937 13.6057 18.3327 12.5007 18.3327H5.00065C4.55862 18.3327 4.1347 18.1571 3.82214 17.8445C3.50958 17.532 3.33398 17.108 3.33398 16.666V4.16602C3.33398 3.72399 3.50958 3.30006 3.82214 2.9875C4.1347 2.67494 4.55862 2.49935 5.00065 2.49935H6.05732C6.20359 2.24599 6.41398 2.0356 6.66734 1.88932C6.9207 1.74304 7.2081 1.66602 7.50065 1.66602H12.5007ZM5.83398 4.16602H5.00065V16.666H12.5007C13.1637 16.666 13.7996 16.4026 14.2684 15.9338C14.7373 15.4649 15.0007 14.8291 15.0007 14.166V4.16602H14.1673C14.1673 4.60804 13.9917 5.03197 13.6792 5.34453C13.3666 5.65709 12.9427 5.83268 12.5007 5.83268H7.50065C7.05862 5.83268 6.6347 5.65709 6.32214 5.34453C6.00958 5.03197 5.83398 4.60804 5.83398 4.16602ZM13.5323 7.81518C13.6885 7.97146 13.7763 8.18338 13.7763 8.40435C13.7763 8.62532 13.6885 8.83724 13.5323 8.99352L9.40732 13.1185C9.25104 13.2747 9.03912 13.3625 8.81815 13.3625C8.59718 13.3625 8.38526 13.2747 8.22898 13.1185L6.46232 11.3502C6.31416 11.1924 6.2332 10.9832 6.23656 10.7668C6.23992 10.5504 6.32734 10.3438 6.48033 10.1907C6.63331 10.0376 6.83986 9.95002 7.05626 9.9465C7.27266 9.94299 7.48194 10.0238 7.63982 10.1718L8.81898 11.3502L12.354 7.81518C12.5103 7.65896 12.7222 7.57119 12.9432 7.57119C13.1641 7.57119 13.376 7.65896 13.5323 7.81518ZM12.5007 3.33268H7.50065V4.16602H12.5007V3.33268Z"
                            fill="#4A3AFF"
                          />
                        </svg>
                      </div>
                    </div>
                    <h6 className="text-n800 leading-[36px] text-[24px] font-medium">
                      10209
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
                    <p className="text-[14px] leading-[21px] text-550 font-medium ">
                      {" "}
                      <span className="text-primary"></span> 8.5% Up from
                      yesterday
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

           <Linechart/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
