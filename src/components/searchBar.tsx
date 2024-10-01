import React, { useState, SetStateAction, Dispatch } from "react";
import { handleOpenDialog } from "../func/openDialog";
import useWebSocketSearch from "../hooks/useWebSocketSearch";

interface SearchBarProps {
  openDialogRef: React.RefObject<HTMLDialogElement>;
  page: string;
  wsUrl:string;
  setSearchResult: Dispatch<SetStateAction<any[] | null>>;
  setLoaderSearch: Dispatch<SetStateAction<boolean>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ openDialogRef, page, wsUrl, setSearchResult,setLoaderSearch }) => {


  const [searchQuery, setSearchQuery] = useState("");

    
    if (wsUrl) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useWebSocketSearch({
        searchQuery: searchQuery,
        endpointPath: wsUrl,
        setResults: setSearchResult,
        setLoader: setLoaderSearch,
      });
    }


  return (
    <div className="w-full flex items-center gap-[8px]">
      <div className="relative flex-grow">
        <input
          type="search"
          name=""
          id=""
          className="w-full h-[44px] rounded-[40px] border-[1px] border-n300 shadow-md md:px-[54px] pl-[54px] pr-[15px] md:text-[14px] text-[12px]"
          placeholder={`Search for ${page}`}
          onChange={(e) => { setSearchQuery(e.target.value)  }}
          value={searchQuery}
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
            strokeWidth="1.5"
            fillOpacity="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
            stroke="#6F6C8F"
            strokeWidth="1.5"
            fillOpacity="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <button
        className="rounded-[30px] py-[12px] sm:px-[25px] px-[15px] bg-primary text-white sm:text-[14px] text-[12px] font-medium"
        onClick={() => {
          handleOpenDialog(openDialogRef);
        }}
      >
        {page === "groups" ?"Create group" : page === "mails" ?"Add email":null}
        
      </button>
    </div>
  );
};

export default SearchBar;
