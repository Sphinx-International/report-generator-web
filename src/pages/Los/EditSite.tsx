import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getOneSite } from "../../func/los/Sites";
import { ResOfOneSite } from "../../assets/types/LosSites";
import { RotatingLines } from "react-loader-spinner";

const EditSite = () => {
  const { id } = useParams();

  const [openDivs, setOpenDivs] = useState<{ [key: string]: boolean }>({});
  const [site, setSite] = useState<ResOfOneSite | null>(null);
  const [loader, setLoader] = useState<boolean>(false);

  const toggleDiv = (id: string) => {
    setOpenDivs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  useEffect(() => {
    getOneSite(Number(id), setSite, setLoader);
    return () => {};
  }, []);
  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence={`Here are infromations about ${id}`}
          searchBar={false}
        />
        {loader ? (
          <div className="w-full flex items-center justify-center py-3">
            <RotatingLines strokeColor="#4A3AFF" width="60" />
          </div>
        ) : (
          <div className="w-full rounded-[20px] border-[1px] border-n400 p-[36px] flex flex-col items-start gap-[50px]">
            <div className="flex flex-col items-start gap-[35px] w-full">
              <div className="w-full flex items-center justify-between">
                <h2 className="text-[20px] text-n800 font-semibold">
                  Site information V2
                </h2>
                <button className="py-[6px] px-[20px] rounded-[20px] border-[2px] border-primary text-[12px] text-primary font-semibold">
                  Relocate site
                </button>
                <svg
                  className="cursor-pointer"
                  onClick={() => toggleDiv("div1")}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="10"
                  viewBox="0 0 24 15"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.6784 13.4286C13.2331 13.8734 12.6295 14.1232 12.0001 14.1232C11.3707 14.1232 10.7671 13.8734 10.3218 13.4286L1.36325 4.47327C0.917922 4.02773 0.66782 3.42353 0.667969 2.79359C0.668117 2.16364 0.918503 1.55956 1.36404 1.11423C1.80959 0.668899 2.41379 0.418797 3.04373 0.418945C3.67367 0.419094 4.27776 0.66948 4.72309 1.11502L12.0001 8.39202L19.2771 1.11502C19.7248 0.68218 20.3246 0.442507 20.9474 0.447623C21.5701 0.452739 22.1659 0.702234 22.6064 1.14237C23.047 1.58251 23.2971 2.17807 23.3028 2.80079C23.3085 3.42351 23.0693 4.02355 22.6369 4.47169L13.68 13.4302L13.6784 13.4286Z"
                    fill="#666666"
                  />
                </svg>
              </div>
              <div className="w-full pr-[82px] flex flex-col items-start gap-[25px]">
                <div className="w-full flex items-center justify-between">
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="site-code"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Site Code
                    </label>
                    <input
                      type="text"
                      id="site-code"
                      name="site-code"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="region"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Region
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                </div>
                <div className="w-full flex items-center justify-between">
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="wilaya"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Wilaya
                    </label>
                    <input
                      type="text"
                      id="wilaya"
                      name="wilaya"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="daira"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Daira
                    </label>
                    <input
                      type="text"
                      id="daira"
                      name="daira"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                </div>
                <div className="w-full flex items-center justify-between">
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="commune"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Commune
                    </label>
                    <input
                      type="text"
                      id="commune"
                      name="commune"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="type"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Type of site{" "}
                    </label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                </div>
                <div className="w-full flex items-center justify-between">
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="building-height"
                      className="text-[14px] text-n600 font-medium"
                    >
                      Building height
                    </label>
                    <input
                      type="text"
                      id="building-height"
                      name="building-height"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                  <div className="w-[40%] flex flex-col items-start gap-2">
                    <label
                      htmlFor="mast-height"
                      className="text-[14px] text-n600 font-medium"
                    >
                      MAST height
                    </label>
                    <input
                      type="text"
                      id="mast-height"
                      name="mast-height"
                      className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                      value={"BO9098"}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-[35px] w-full">
              <h2 className="text-[20px] text-n800 font-semibold">
                Cordonnées - GPS
              </h2>
              <div className="w-full pr-[82px] flex flex-col items-start gap-[28px]">
                <div className="flex flex-col items-start gap-4 w-full">
                  <label
                    htmlFor="latitude"
                    className="text-[14px] text-n600 font-medium"
                  >
                    Latitude
                  </label>
                  <div className="w-full flex items-center justify-between">
                    <input
                      type="text"
                      name="latitude-degrees"
                      id="latitude-degrees"
                      className="w-[30%] border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                    />
                    <input
                      type="text"
                      name="latitude-min"
                      id="latitude-min"
                      className="w-[30%] border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                    />
                    <input
                      type="text"
                      name="latitude-sec"
                      id="latitude-sec"
                      className="w-[30%] border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                    />
                    <div className="flex items-center gap-3 w-[6%]">
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            id="north"
                            className="hidden peer"
                            name="direction"
                            value="N"
                            /* checked={
                              editing
                                ? editingLatitude.direction === "N"
                                : latitude.direction === "N"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setEditingLatitude,
                                  true,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setformValues
                                );
                              }
                            }}  */
                          />
                          <label
                            htmlFor="north"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="north"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          N
                        </label>
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            name="direction"
                            id="south"
                            value="S"
                            className="hidden peer"
                            /* checked={
                              editing
                                ? editingLatitude.direction === "S"
                                : latitude.direction === "S"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setformValues
                                );
                              }
                            }} */
                          />
                          <label
                            htmlFor="south"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="south"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          S
                        </label>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="latitude-dec"
                    id="latitude-dec"
                    className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                  />
                </div>

                <div className="flex flex-col items-start gap-4 w-full">
                  <label
                    htmlFor="longitude"
                    className="text-[14px] text-n600 font-medium"
                  >
                    Longitude
                  </label>
                  <div className="w-full flex items-center justify-between">
                    <input
                      type="text"
                      name="longitude-degrees"
                      id="longitude-degrees"
                      className="w-[30%] border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                    />
                    <input
                      type="text"
                      name="longitude-min"
                      id="longitude-min"
                      className="w-[30%] border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                    />
                    <input
                      type="text"
                      name="longitude-sec"
                      id="longitude-sec"
                      className="w-[30%] border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                    />

                    <div className="flex items-center gap-3 w-[6%]">
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            id="east"
                            className="hidden peer"
                            name="direction"
                            value="E"
                            /* checked={
                              editing
                                ? editingLatitude.direction === "N"
                                : latitude.direction === "N"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setEditingLatitude,
                                  true,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setformValues
                                );
                              }
                            }}  */
                          />
                          <label
                            htmlFor="east"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="east"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          E
                        </label>
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            name="direction"
                            id="west"
                            value="W"
                            className="hidden peer"
                            /* checked={
                              editing
                                ? editingLatitude.direction === "S"
                                : latitude.direction === "S"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setformValues
                                );
                              }
                            }} */
                          />
                          <label
                            htmlFor="west"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="west"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          W
                        </label>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="longitude-dec"
                    id="longitude-dec"
                    className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSite;
