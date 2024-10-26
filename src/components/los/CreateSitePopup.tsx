import { forwardRef, useState } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import CustomSelect from "../CustomSelect";

const CreateSitePopup = forwardRef<HTMLDialogElement>((_, ref) => {
  const [currPage, setCurrPage] = useState<1 | 2>(1);

  return (
    <dialog
      ref={ref}
      className="bg-white rounded-[40px] p-[32px] hidden flex-col items-center gap-[20px] sm:w-[55%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
    >
      {currPage === 1 ? (
        <div className="flex flex-col gap-8 items-end">
          <div className="flex flex-col w-full gap-[25px]">
            <div className="flex items-center gap-5 w-full">
              <div className="flex flex-col items-start gap-[7px] w-[50%]">
                <label
                  htmlFor="site-code"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Site Code
                </label>
                <input
                  type="text"
                  id="site-code"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="Enter site code"
                />
              </div>
              <div className="flex flex-col items-start gap-[7px] w-[50%]">
                <label
                  htmlFor="region"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Region
                </label>
                <CustomSelect options={["Select region","Other options"]}/>

              </div>
            </div>
            <div className="flex items-center gap-5 w-full">
              <div className="flex flex-col items-start gap-[7px] w-[33%%]">
                <label
                  htmlFor="wilaya"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Wilaya
                </label>
                <input
                  type="text"
                  id="wilaya"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="Enter wilaya"
                />
              </div>
              <div className="flex flex-col items-start gap-[7px] w-[33%]">
                <label
                  htmlFor="daira"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Daira
                </label>
                <input
                  type="text"
                  id="daira"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="select daira"
                />
              </div>
              <div className="flex flex-col items-start gap-[7px] w-[33%]">
                <label
                  htmlFor="baladia"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Baladia
                </label>
                <input
                  type="text"
                  id="baladia"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="select baladia"
                />
              </div>
            </div>
            <div className="flex items-end gap-5 w-full">
              <div className="flex flex-col items-start gap-[7px] w-[33%%]">
                <label
                  htmlFor="longitude-1"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude-1"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="BO9098"
                />
              </div>
              <input
                type="text"
                id="longitude-2"
                className="rounded-[46px] h-[52px] shadow-md px-[24px] w-[33%]"
                placeholder="BO9098"
              />
              <input
                type="text"
                id="longitude-3"
                className="rounded-[46px] h-[52px] shadow-md px-[24px] w-[33%]"
                placeholder="BO9098"
              />
            </div>
            <div className="flex items-end gap-5 w-full">
              <div className="flex flex-col items-start gap-[7px] w-[33%%]">
                <label
                  htmlFor="latitude-1"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Latitude
                </label>
                <input
                  type="text"
                  id="longitude-1"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="BO9098"
                />
              </div>
              <input
                type="text"
                id="latitude-2"
                className="rounded-[46px] h-[52px] shadow-md px-[24px] w-[33%]"
                placeholder="BO9098"
              />
              <input
                type="text"
                id="latitude-3"
                className="rounded-[46px] h-[52px] shadow-md px-[24px] w-[33%]"
                placeholder="BO9098"
              />
            </div>
          </div>
          <div className="flex items-center gap-[6px]">
            <button
              className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-n400 bg-n300 text-[14px] text-n600 font-semibold"
              onClick={() => {
                handleCloseDialog(ref);
              }}
            >
              Cancel
            </button>
            <button
              className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-primary bg-primary text-[14px] text-white font-semibold"
              onClick={() => {
                setCurrPage(2);
              }}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 items-end w-full">
          <div className="flex flex-col w-full gap-[25px]">
            <div className="flex items-center gap-5 w-full">
              <div className="flex flex-col items-start gap-[7px] w-[50%]">
                <label
                  htmlFor="building-height"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Building height
                </label>
                <input
                  type="text"
                  id="building-height"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="XX m"
                />
              </div>
              <div className="flex flex-col items-start gap-[7px] w-[50%]">
                <label
                  htmlFor="gm-height"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  GM/MAST Height (m)
                </label>
                <input
                  type="text"
                  id="gm-height"
                  className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
                  placeholder="XX m"
                />
              </div>
            </div>
            <div className="flex items-center gap-5 w-full">
              <div className="flex flex-col items-start gap-[7px] w-full">
                <label
                  htmlFor="type"
                  className="text-[15px] text-550 leading-[20px] font-medium"
                >
                  Type of Site
                </label>
                <CustomSelect options={["Building Rooftop (RT)","Other options"]}/>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[6px]">
            <button
              className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-n400 bg-n300 text-[14px] text-n600 font-semibold"
              onClick={() => {
                setCurrPage(1);
              }}
            >
              previous
            </button>
            <button className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-primary bg-primary text-[14px] text-white font-semibold">
              Create
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
});

export default CreateSitePopup;
