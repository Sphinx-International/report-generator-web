import { losOrdersTabHeader } from "../../../assets/los";
import { calculateDistance } from "../../../func/los/geographicFunctions";
import { selectCGPS_toWorkWith } from "../../../func/los/orders";
import { resOfOneOrder } from "../../../assets/types/LosCommands";
import { CGPS } from "../../../pages/Los/OrderDetails";
import React from "react";
import { getRole } from "../../../func/getUserRole";

interface LosValidationLargeScreensProps {
  order: resOfOneOrder | null;
  setMarkers: React.Dispatch<React.SetStateAction<CGPS[]>>;
  isLoadingChoicingCGPS: boolean;
  setIsLoadingChoicingCGPS: React.Dispatch<React.SetStateAction<boolean>>;
  fetchOneLOS: () => Promise<void>;
}

const LosValidationLargeScreens: React.FC<LosValidationLargeScreensProps> = ({
  order,
  setMarkers,
  isLoadingChoicingCGPS,
  setIsLoadingChoicingCGPS,
  fetchOneLOS,
}) => {
  if (order) {
    return ( 
      <div className="lg:flex flex-col w-full hidden">
        <div className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4">
          {losOrdersTabHeader.map((header, index) => {
            return (
              <span
                key={index}
                className={`flex items-center justify-center text-[13px] text-n800 font-medium `}
                style={{ width: `${header.width}` }}
              >
                {header.title}
              </span>
            );
          })}
        </div>
        <div className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4">
          <div className="w-[10%] flex items-center justify-center">
            <span className="text-[12px] text-n800">
              {order.line_of_sight.near_end_location.site_code}
            </span>
          </div>
          <div className="w-[14%] flex items-center justify-center">
            <span className="text-[12px] text-n800">
              {order.line_of_sight.near_end_location.longitude.toFixed(6)}
            </span>
          </div>
          <div className="w-[14%] flex items-center justify-center">
            <span className="text-[12px] text-n800">
              {order.line_of_sight.near_end_location.latitude.toFixed(6)}
            </span>
          </div>
          <div className="w-[14%] flex items-center justify-center">
            <span className="text-[12px] text-n800">
              {order.line_of_sight.execution_cgps.longitude.toFixed(6)}
            </span>
          </div>
          <div className="w-[14%] flex items-center justify-center">
            <span className="text-[12px] text-n800">
              {order.line_of_sight.execution_cgps.latitude.toFixed(6)}
            </span>
          </div>

          <div className="w-[10%] flex items-center justify-center">
            <span className="text-[12px] text-n800">
              {calculateDistance(
                {
                  latitude: order.line_of_sight.near_end_location.latitude,
                  longitude: order.line_of_sight.near_end_location.longitude,
                },
                {
                  latitude: order.line_of_sight.execution_cgps.latitude,
                  longitude: order.line_of_sight.execution_cgps.longitude,
                }
              ).toFixed(2)}{" "}
              km
            </span>
          </div>
          <div className="w-[10%] flex items-center justify-center">
            <span
              className="p-[7px] rounded-full bg-sec cursor-pointer"
              onClick={() => {
                setMarkers([
                  {
                    id: Number(`${order.line_of_sight.id}.1`),
                    lat: order.line_of_sight.execution_cgps.latitude,
                    lng: order.line_of_sight.execution_cgps.longitude,
                    name: `${order.line_of_sight.near_end_location.site_code} (ENG)`,
                  },
                  {
                    id: order.line_of_sight.id,
                    lat: order.line_of_sight.near_end_location.latitude,
                    lng: order.line_of_sight.near_end_location.longitude,
                    name: ` ${order.line_of_sight.near_end_location.site_code} (DB)`,
                  },
                ]);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M14 2.23438L13.297 2.54688L9.9845 3.96837L6.172 2.53087L5.9845 2.46837L5.797 2.54688L2.297 4.04688L2 4.17188V13.7649L2.703 13.4524L6.0155 12.0309L9.828 13.4684L10.0155 13.5309L10.203 13.4524L13.703 11.9524L14 11.8274V2.23438ZM6.5 3.71837L9.5 4.84338V12.2814L6.5 11.1564V3.71837ZM5.5 3.74988V11.1719L3 12.2499V4.82788L5.5 3.74988ZM13 3.74988V11.1719L10.5 12.2499V4.82788L13 3.74988Z"
                  fill="#4A3AFF"
                />
              </svg>
            </span>
          </div>
          <div className="w-[14%] flex gap-[6px] items-center justify-center">
            <div className="items-center gap-[7px] hidden sm:flex">
              <input
                type="checkbox"
                id={`CGPS-${order.line_of_sight.id}`}
                className="hidden peer"
                checked={order.line_of_sight.execution_cgps.is_valid}
                disabled={getRole() === 3}
                onChange={(e) => {
                  if (!isLoadingChoicingCGPS) {
                    if (e.target.checked) {
                      selectCGPS_toWorkWith(
                        order.line_of_sight.id,
                        1,
                        "suggested",
                        setIsLoadingChoicingCGPS,
                        fetchOneLOS
                      );
                    } else {
                      selectCGPS_toWorkWith(
                        order.line_of_sight.id,
                        1,
                        "original",
                        setIsLoadingChoicingCGPS,
                        fetchOneLOS
                      );
                    }
                  }
                }}
              />
              <label
                htmlFor={`CGPS-${order.line_of_sight.id}`}
                className="w-[24px] h-[24px] rounded-full border-2 border-gray-400 peer-checked:bg-primary flex items-center justify-center cursor-pointer"
              >
                <svg
                  className="text-white hidden"
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="10"
                  viewBox="0 0 12 10"
                  fill="none"
                >
                  <path
                    d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z"
                    fill="white"
                  />
                </svg>
              </label>
            </div>
          </div>
        </div>
        {order.alternative_far_ends
          .filter((alt) => alt.los_status !== null)
          .map((alt, index) => {
            return (
              <div
                key={index}
                className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4"
              >
                <div className="w-[10%] flex items-center justify-center">
                  <span className="text-[12px] text-n800">
                    {alt.site_location.site_code}
                  </span>
                </div>
                <div className="w-[14%] flex items-center justify-center">
                  <span className="text-[12px] text-n800">
                    {alt.site_location.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="w-[14%] flex items-center justify-center">
                  <span className="text-[12px] text-n800">
                    {alt.site_location.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="w-[14%] flex items-center justify-center">
                  <span className="text-[12px] text-n800">
                    {alt.execution_cgps.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="w-[14%] flex items-center justify-center">
                  <span className="text-[12px] text-n800">
                    {alt.execution_cgps.latitude.toFixed(6)}
                  </span>
                </div>

                <div className="w-[10%] flex items-center justify-center">
                  <span className="text-[12px] text-n800">
                    {calculateDistance(
                      {
                        latitude: alt.site_location.latitude,
                        longitude: alt.site_location.longitude,
                      },
                      {
                        latitude: alt.execution_cgps.latitude,
                        longitude: alt.execution_cgps.longitude,
                      }
                    ).toFixed(2)}
                    km
                  </span>
                </div>
                <div className="w-[10%] flex items-center justify-center">
                  <span
                    className="p-[7px] rounded-full bg-sec cursor-pointer"
                    onClick={() => {
                      setMarkers([]); // Clear existing markers

                      setMarkers([
                        {
                          id: Number(`${alt.id}.1`),
                          lat: alt.execution_cgps.latitude,
                          lng: alt.execution_cgps.longitude,
                          name: `${alt.site_location.site_code} (ENG)`,
                        },
                        {
                          id: alt.id,
                          lat: alt.site_location.latitude,
                          lng: alt.site_location.longitude,
                          name: `${alt.site_location.site_code} (DB)`,
                        },
                      ]);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M14 2.23438L13.297 2.54688L9.9845 3.96837L6.172 2.53087L5.9845 2.46837L5.797 2.54688L2.297 4.04688L2 4.17188V13.7649L2.703 13.4524L6.0155 12.0309L9.828 13.4684L10.0155 13.5309L10.203 13.4524L13.703 11.9524L14 11.8274V2.23438ZM6.5 3.71837L9.5 4.84338V12.2814L6.5 11.1564V3.71837ZM5.5 3.74988V11.1719L3 12.2499V4.82788L5.5 3.74988ZM13 3.74988V11.1719L10.5 12.2499V4.82788L13 3.74988Z"
                        fill="#4A3AFF"
                      />
                    </svg>
                  </span>
                </div>
                <div className="w-[14%] flex gap-[6px] items-center justify-center">
                  <div className="items-center gap-[7px] hidden sm:flex">
                    <input
                      type="checkbox"
                      id={`CGPS-${alt.id}`}
                      className="hidden peer"
                      checked={alt.execution_cgps.is_valid}
                      disabled={getRole() === 3}
                      onChange={(e) => {
                        if (!isLoadingChoicingCGPS) {
                          if (e.target.checked) {
                            selectCGPS_toWorkWith(
                              alt.id,
                              2,
                              "suggested",
                              setIsLoadingChoicingCGPS,
                              fetchOneLOS
                            );
                          } else {
                            selectCGPS_toWorkWith(
                              alt.id,
                              2,
                              "original",
                              setIsLoadingChoicingCGPS,
                              fetchOneLOS
                            );
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor={`CGPS-${alt.id}`}
                      className="w-[24px] h-[24px] rounded-full border-2 border-gray-400 peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                    >
                      <svg
                        className="text-white hidden"
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                      >
                        <path
                          d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z"
                          fill="white"
                        />
                      </svg>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }
};

export default LosValidationLargeScreens;
