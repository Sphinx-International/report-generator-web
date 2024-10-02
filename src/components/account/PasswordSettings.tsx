import ChangePassPopup from "../ChangePassPopup";
import { handleOpenDialog } from "../../func/openDialog";
import { useRef } from "react";


const PasswordSettings = () => {
  const forgetPassRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
        Change password
      </h3>
      <span
        className="cursor-pointer text-[15px] leading-[22.5px] text-primary"
        onClick={() => {
          handleOpenDialog(forgetPassRef);
        }}
      >
        {" "}
        Change your password
      </span>
      <ChangePassPopup ref={forgetPassRef} />
    </>
  );
};

export default PasswordSettings;
