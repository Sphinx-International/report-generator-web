import {
  resOfOneOrder,
  NearEndLocation,
} from "../../../assets/types/LosCommands";
import { losAltTabHeader } from "../../../assets/los";
import { handleOpenDialog } from "../../../func/openDialog";
import {
  calculateAzimuths,
  calculateDistance,
} from "../../../func/los/geographicFunctions";
import { updateLosResult, losResult } from "../../../func/los/orders";
import { getRole } from "../../../func/getUserRole";
import { get } from "node:http";

interface LosOrdersLargeScreensProps {
  order: resOfOneOrder | null;
  setSelectedSiteInfo: React.Dispatch<
    React.SetStateAction<{
      losId: number | null;
      altId: number | null;
      site_type: 1 | 2 | null;
      site_location: NearEndLocation | null;
      losStatus: 1 | 2 | 3 | null;
      accessibility: boolean;
      image_count: number | null;
      siteIndex?: number;
      secondSiteCode: string | null;
    }>
  >;
  executeLosPopupRef: React.RefObject<HTMLDialogElement>;
  openDropdownIndex: number | null;
  setOpenDropdownIndex: React.Dispatch<React.SetStateAction<number | null>>;
  isLosStatusLoading: boolean;
  setIsLosStatusLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchOneLOS: () => Promise<void>;
}

const LosOrdersLargeScreens: React.FC<LosOrdersLargeScreensProps> = ({
  order,
  setSelectedSiteInfo,
  executeLosPopupRef,
  openDropdownIndex,
  setOpenDropdownIndex,
  isLosStatusLoading,
  setIsLosStatusLoading,
  fetchOneLOS,
}) => {
  if (order) {
    return (
      <div className="lg:flex flex-col w-full px-[25px] hidden">
        <div className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4 ">
          {losAltTabHeader.map((header, index) => {
            return (
              <span
                key={index}
                className={`flex items-center justify-center text-[14px] text-n800 font-medium w-[${header.width}]`}
              >
                {header.title}
              </span>
            );
          })}
        </div>
        {order.alternative_far_ends.map((alt, index) => {
          return (
            <div
              key={index}
              className={`flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4 ${
                !order.line_of_sight.execute_with_all_alternatives &&
                index !== 0 &&
                (order.alternative_far_ends[index - 1].los_status === null ||
                  order.alternative_far_ends[index - 1].los_status === 1)
                  ? "cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <div className="w-[17%] flex items-center justify-center">
                <span
                  className={`relative flex items-center justify-between rounded-[25px] px-[22px] py-[5px] text-[14px] group  ${
                    !order.line_of_sight.execute_with_all_alternatives &&
                    index !== 0 &&
                    (order.alternative_far_ends[index - 1].los_status ===
                      null ||
                      order.alternative_far_ends[index - 1].los_status === 1)
                      ? "bg-n300 text-n500"
                      : order.line_of_sight.near_end_accessibility
                      ? alt.executed.near_end
                        ? "bg-[#48C1B521] text-[#48C1B5] cursor-pointer"
                        : "bg-[#FFC46B42] text-[#FFAA29] cursor-pointer"
                      : "bg-[#DB2C2C1A] text-[#DB2C2C] cursor-pointer"
                  }`}
                  onClick={() => {
                    if ([0, 1, 2].includes(getRole()!)) {
                      setSelectedSiteInfo(() => ({
                        losId: order.line_of_sight.id,
                        altId: alt.id,
                        site_type: 1,
                        site_location: order.line_of_sight.near_end_location,
                        losStatus: alt.los_status,
                        accessibility:
                          order.line_of_sight.near_end_accessibility,
                        image_count: alt.image_count.near_end,
                        siteIndex: index,
                        secondSiteCode: alt.site_location.site_code,
                      }));

                      handleOpenDialog(executeLosPopupRef);
                    }
                  }}
                >
                  <span className="truncate">
                    {order.line_of_sight.near_end_location.site_code}
                  </span>

                  {/* Gallery Icon and Image Count */}
                  <div className="absolute right-[-20px] top-[7px] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1 text-gray-700 p-1 rounded-full bg-n300 shadow-lg transition-opacity duration-300">
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[14px] h-[14px]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 20H3V4h18v16zM5 18h14V6H5v12zm7-8c-1.38 0-2.5-1.12-2.5-2.5S10.62 5 12 5s2.5 1.12 2.5 2.5S13.38 10 12 10zm0-1c.83 0 1.5-.67 1.5-1.5S12.83 6 12 6s-1.5.67-1.5 1.5S11.17 9 12 9zm-5 9l3.5-4.5 2.5 3 4-6 5 7H7z" />
                    </svg>
                    <span className="text-[11px] font-medium">
                      {alt.image_count.near_end || 0}
                    </span>
                  </div>
                </span>
              </div>
              <div className="w-[17%] flex items-center justify-center">
                <span
                  className={`relative rounded-[25px] px-[22px] py-[5px]  text-[14px] group  ${
                    !order.line_of_sight.execute_with_all_alternatives &&
                    index !== 0 &&
                    (order.alternative_far_ends[index - 1].los_status ===
                      null ||
                      order.alternative_far_ends[index - 1].los_status === 1)
                      ? "bg-n300 text-n500"
                      : alt.far_end_accessibility
                      ? alt.executed.far_end
                        ? "bg-[#48C1B521] text-[#48C1B5] cursor-pointer"
                        : "bg-[#FFC46B42] text-[#FFAA29] cursor-pointer"
                      : "bg-[#DB2C2C1A] text-[#DB2C2C] cursor-pointer"
                  }`}
                  onClick={() => {
                    if ([0, 1, 2].includes(getRole()!)) {
                      setSelectedSiteInfo(() => ({
                        losId: order.line_of_sight.id,
                        altId: alt.id,
                        site_type: 2,
                        site_location: alt.site_location,
                        losStatus: alt.los_status,
                        accessibility: alt.far_end_accessibility,
                        image_count: alt.image_count.far_end,
                        secondSiteCode:
                          order.line_of_sight.near_end_location.site_code,
                      }));
                      handleOpenDialog(executeLosPopupRef);
                    }
                  }}
                >
                  {alt.site_location.site_code}

                  {/* Gallery Icon and Image Count */}
                  <div className="absolute right-[-20px] top-[7px] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1 text-gray-700 p-1 rounded-full bg-n300 shadow-lg transition-opacity duration-300">
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[14px] h-[14px]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 20H3V4h18v16zM5 18h14V6H5v12zm7-8c-1.38 0-2.5-1.12-2.5-2.5S10.62 5 12 5s2.5 1.12 2.5 2.5S13.38 10 12 10zm0-1c.83 0 1.5-.67 1.5-1.5S12.83 6 12 6s-1.5.67-1.5 1.5S11.17 9 12 9zm-5 9l3.5-4.5 2.5 3 4-6 5 7H7z" />
                    </svg>
                    <span className="text-[11px] font-medium">
                      {alt.image_count.far_end || 0}
                    </span>
                  </div>
                </span>
              </div>
              <div className="w-[17%] flex items-end gap-3 justify-center">
                <span
                  className={`text-[15px] ${
                    alt.los_status === 1
                      ? "text-[#48C1B5]"
                      : alt.los_status === 2
                      ? "text-[#F5A623]"
                      : alt.los_status === 3
                      ? "text-[#DB2C2C]"
                      : "text-n500"
                  } `}
                >
                  {alt.los_status === 1
                    ? "Positive"
                    : alt.los_status === 2
                    ? "Critical"
                    : alt.los_status === 3
                    ? "Negative"
                    : "unknown"}
                </span>
                <div className="relative">
                  <svg
                    className={`${[0,1,2].includes(getRole()!) && "cursor-pointers"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    onClick={() => {
                      if ([0, 1, 2].includes(getRole()!)) {
                        setOpenDropdownIndex(
                          openDropdownIndex === index ? null : index
                        );
                      }
                    }}
                  >
                    <g clip-path="url(#clip0_3005_9269)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.70855 10.7063C8.52105 10.8935 8.26689 10.9987 8.00189 10.9987C7.73689 10.9987 7.48272 10.8935 7.29522 10.7063L3.52322 6.9356C3.33571 6.748 3.23041 6.4936 3.23047 6.22836C3.23053 5.96313 3.33596 5.70878 3.52355 5.52127C3.71115 5.33376 3.96555 5.22845 4.23079 5.22852C4.49603 5.22858 4.75038 5.334 4.93789 5.5216L8.00189 8.5856L11.0659 5.5216C11.2544 5.33935 11.507 5.23844 11.7692 5.24059C12.0314 5.24274 12.2822 5.34779 12.4677 5.53312C12.6532 5.71844 12.7585 5.9692 12.7609 6.2314C12.7633 6.4936 12.6626 6.74625 12.4806 6.93493L8.70922 10.7069L8.70855 10.7063Z"
                        fill="#A0A3BD"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3005_9269">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  {openDropdownIndex === index && (
                    <div className="absolute flex flex-col items-center gap-[10px] z-40 bg-white shadow-lg shadow-slate-300 rounded-[22px] p-4">
                      {alt.los_status !== 1 && (
                        <span
                          className="text-[14px] text-[#48C1B5] cursor-pointer"
                          aria-disabled={isLosStatusLoading}
                          onClick={() => {
                            {
                              alt.los_status
                                ? updateLosResult(
                                    alt.id,
                                    1,
                                    setIsLosStatusLoading,
                                    setOpenDropdownIndex,
                                    fetchOneLOS
                                  )
                                : losResult(
                                    alt.id,
                                    1,
                                    setIsLosStatusLoading,
                                    setOpenDropdownIndex,
                                    fetchOneLOS
                                  );
                            }
                          }}
                        >
                          Positive
                        </span>
                      )}
                      {alt.los_status !== 2 && (
                        <span
                          className="text-[14px] text-[#F5A623] cursor-pointer"
                          onClick={() => {
                            {
                              alt.los_status
                                ? updateLosResult(
                                    alt.id,
                                    2,
                                    setIsLosStatusLoading,
                                    setOpenDropdownIndex,
                                    fetchOneLOS
                                  )
                                : losResult(
                                    alt.id,
                                    2,
                                    setIsLosStatusLoading,
                                    setOpenDropdownIndex,
                                    fetchOneLOS
                                  );
                            }
                          }}
                        >
                          Critical
                        </span>
                      )}
                      {alt.los_status !== 3 && (
                        <span
                          className="text-[14px] text-[#DB2C2C] cursor-pointer"
                          onClick={() => {
                            {
                              alt.los_status
                                ? updateLosResult(
                                    alt.id,
                                    3,
                                    setIsLosStatusLoading,
                                    setOpenDropdownIndex,
                                    fetchOneLOS
                                  )
                                : losResult(
                                    alt.id,
                                    3,
                                    setIsLosStatusLoading,
                                    setOpenDropdownIndex,
                                    fetchOneLOS
                                  );
                            }
                          }}
                        >
                          Negative
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-[16%] flex items-center justify-center">
                <span
                  className={`text-[14px]  ${
                    !order.line_of_sight.execute_with_all_alternatives &&
                    index !== 0 &&
                    (order.alternative_far_ends[index - 1].los_status ===
                      null ||
                      order.alternative_far_ends[index - 1].los_status === 1)
                      ? "text-n500"
                      : "text-n800"
                  }`}
                >
                  {
                    calculateAzimuths(
                      {
                        latitude:
                          order.line_of_sight.near_end_location.latitude,
                        longitude:
                          order.line_of_sight.near_end_location.longitude,
                      },
                      {
                        latitude: alt.site_location.latitude,
                        longitude: alt.site_location.longitude,
                      }
                    ).azimuthNEToFE
                  }
                  °
                </span>
              </div>
              <div className="w-[16%] flex items-center justify-center">
                <span
                  className={`text-[14px]  ${
                    !order.line_of_sight.execute_with_all_alternatives &&
                    index !== 0 &&
                    (order.alternative_far_ends[index - 1].los_status ===
                      null ||
                      order.alternative_far_ends[index - 1].los_status === 1)
                      ? "text-n500"
                      : "text-n800"
                  }`}
                >
                  {" "}
                  {
                    calculateAzimuths(
                      {
                        latitude: alt.site_location.latitude,
                        longitude: alt.site_location.longitude,
                      },
                      {
                        latitude:
                          order.line_of_sight.near_end_location.latitude,
                        longitude:
                          order.line_of_sight.near_end_location.longitude,
                      }
                    ).azimuthFEToNE
                  }
                  °
                </span>
              </div>
              <div className="w-[16%] flex items-center justify-center">
                <span
                  className={`text-[14px]  ${
                    !order.line_of_sight.execute_with_all_alternatives &&
                    index !== 0 &&
                    (order.alternative_far_ends[index - 1].los_status ===
                      null ||
                      order.alternative_far_ends[index - 1].los_status === 1)
                      ? "text-n500"
                      : "text-n800"
                  }`}
                >
                  {" "}
                  {calculateDistance(
                    {
                      latitude: alt.site_location.latitude,
                      longitude: alt.site_location.longitude,
                    },
                    {
                      latitude: order.line_of_sight.near_end_location.latitude,
                      longitude:
                        order.line_of_sight.near_end_location.longitude,
                    }
                  ).toFixed(2)}
                  km
                </span>
              </div>{" "}
            </div>
          );
        })}
      </div>
    );
  }
};

export default LosOrdersLargeScreens;
