import SideBar from "../components/SideBar";
import Header from "../components/Header";
import CreateGroupPopup from "../components/mails/CreateGroupPopup";
import View_edit_groupPopup from "../components/mails/View_edit_groupPopup";
import { useRef } from "react";
import { handleOpenDialog } from "../func/openDialog";

const selectedGroups = [];

const Groups = () => {
  const createGroupDialogRef = useRef<HTMLDialogElement>(null);
  const view_edit_GroupDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here are information about mails groupes"
          searchBar={false}
        />
        <div className="w-full flex items-center gap-[8px]">
          <div className="relative flex-grow">
            <input
              type="search"
              name=""
              id=""
              className="w-full h-[44px] rounded-[40px] border-[1px] border-n300 shadow-md md:px-[54px] pl-[54px] pr-[15px] md:text-[14px] text-[12px]"
              placeholder="Search"
            />
            <svg
              className="absolute left-[20px] top-[50%] translate-y-[-50%]"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                stroke="#6F6C8F"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                stroke="#6F6C8F"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <button
            className="rounded-[30px] py-[12px] px-[25px] bg-primary text-white text-[14px] font-medium"
            onClick={() => {
              handleOpenDialog(createGroupDialogRef);
            }}
          >
            Create group
          </button>
        </div>

        <main className="w-full flex flex-col gap-[20px] rounded-[20px] border-n300 border-[1px] p-[25px]">
          <div className="w-full flex items-center justify-between py-[6px]">
            <h4 className="text-[20px] font-semibold text-n800 leading-[30px]">
              Groups
            </h4>
            <span
              //onClick={handleSpanClick}
              aria-disabled={selectedGroups.length === 0 ? true : false}
              className={`p-[8px] bg-n200 border-[1px] border-n400 rounded-[6px] ${
                selectedGroups.length === 0
                  ? " cursor-not-allowed"
                  : " cursor-pointer"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M18.412 6.5L17.611 20.117C17.5812 20.6264 17.3577 21.1051 16.9865 21.4551C16.6153 21.8052 16.1243 22.0001 15.614 22H8.386C7.87575 22.0001 7.38475 21.8052 7.0135 21.4551C6.64226 21.1051 6.41885 20.6264 6.389 20.117L5.59 6.5H3.5V5.5C3.5 5.36739 3.55268 5.24021 3.64645 5.14645C3.74021 5.05268 3.86739 5 4 5H20C20.1326 5 20.2598 5.05268 20.3536 5.14645C20.4473 5.24021 20.5 5.36739 20.5 5.5V6.5H18.412ZM10 2.5H14C14.1326 2.5 14.2598 2.55268 14.3536 2.64645C14.4473 2.74021 14.5 2.86739 14.5 3V4H9.5V3C9.5 2.86739 9.55268 2.74021 9.64645 2.64645C9.74021 2.55268 9.86739 2.5 10 2.5ZM9 9L9.5 18H11L10.6 9H9ZM13.5 9L13 18H14.5L15 9H13.5Z"
                  fill={`${
                    selectedGroups.length === 0 ? "#6F6C8F" : "#df0505"
                  }`}
                />
              </svg>
            </span>
          </div>

          <div className="flex items-center gap-[10px] flex-wrap w-full">
            {Array.from({ length: 8 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="w-[32%] cursor-pointer flex items-center gap-[11px] border-[#E6EDFF] border-[1px] rounded-[15px] p-[12px]"
                  onClick={() => {
                    handleOpenDialog(view_edit_GroupDialogRef);
                  }}
                >
                  <span className="rounded-[50%] p-[3px] bg-n300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M17.5 16.457C17.5 14.7154 16.1083 12.2337 14.1667 11.6845M12.5 16.457C12.5 14.2479 10.2617 11.457 7.5 11.457C4.73833 11.457 2.5 14.2479 2.5 16.457"
                        stroke="#514F6E"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.5 8.54102C8.88071 8.54102 10 7.42173 10 6.04102C10 4.6603 8.88071 3.54102 7.5 3.54102C6.11929 3.54102 5 4.6603 5 6.04102C5 7.42173 6.11929 8.54102 7.5 8.54102Z"
                        stroke="#514F6E"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12.5 8.54102C13.163 8.54102 13.7989 8.27762 14.2678 7.80878C14.7366 7.33994 15 6.70406 15 6.04102C15 5.37797 14.7366 4.74209 14.2678 4.27325C13.7989 3.80441 13.163 3.54102 12.5 3.54102"
                        stroke="#514F6E"
                        stroke-width="1.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[12px] leading-[18px] text-n800 font-medium">
                    Groupe 1
                  </span>
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <CreateGroupPopup ref={createGroupDialogRef} />
      <View_edit_groupPopup ref={view_edit_GroupDialogRef} />
    </div>
  );
};

export default Groups;
