import { TheUploadingFile } from "../assets/types/Mission";
import { formatFileSize } from "../func/formatFileSize";
import React, { Dispatch, SetStateAction, useState } from "react";
import { handleCancelUpload } from "../func/chunkUpload";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/store";

interface UploadingFilePopup extends TheUploadingFile {
  fileType?: "attachements" | "report" | "certificate" | "voucher" ;
  fetchFunc?: () => void;
  setFile?: Dispatch<SetStateAction<TheUploadingFile | undefined>>;
}

const UploadingFile: React.FC<UploadingFilePopup> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loadingCancel, setLoadingCancel] = useState(false);

  return (
    <div className="w-full flex flex-col items-start px-[12px] py-[1px] bg-white shadow-lg rounded-[15px]">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[7px] w-[90%]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="26"
            viewBox="0 0 22 26"
            fill="none"
          >
            <path
              opacity="0.2"
              d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
              fill="#6F6C8F"
            />
            <path
              d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
              fill="#6F6C8F"
            />
          </svg>
          <div className="flex flex-col items-start w-full">
            <span className="text-[13px] font-medium leading-[20px] text-n600 overflow-hidden w-[90%] text-ellipsis text-nowrap">
              {props.file!.name}
            </span>
            <span className="text-[12px] leading-[20px] text-n600">
              {formatFileSize(props.file!.size)}
            </span>
          </div>
        </div>

        {!loadingCancel && props.progress !== 100 && (
          <span
            className="px-[3px] rounded-[50%] text-white bg-550 text-[12px] cursor-pointer hover:scale-105"
            onClick={() => {
              handleCancelUpload(
                props.id!,
                dispatch,
                props.fileType,
                setLoadingCancel,
                props.fetchFunc,
                props.setFile
              );
            }}
          >
            🗙
          </span>
        )}
      </div>

      <div className="flex items-center gap-[13px] w-full">
        <div className="w-full border-[2.5px] border-n400 rounded-[25px] overflow-hidden">
          <div
            className="h-full rounded-[25px] border-[2.5px] border-primary transition-all duration-300 "
            style={{
              width: `${
                props.progress !== undefined ? `${props.progress}%` : `100%`
              }`,
            }}
          />
        </div>
        <span className="text-[10px] font-semibold leading-[20px] text-primary">
          {props.progress !== undefined
            ? `${props.progress.toFixed(2)}%`
            : "100%"}
        </span>
      </div>
    </div>
  );
};

export default UploadingFile;
