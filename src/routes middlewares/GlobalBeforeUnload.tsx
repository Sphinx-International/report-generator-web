import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";

const GlobalBeforeUnload = ({ children }: { children: React.ReactNode }) => {
  const uploadingFiles = useSelector(
    (state: RootState) => state.uploadingFiles
  );
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasOngoingUploads =
        uploadingFiles.attachFiles.length +
          uploadingFiles.reportFiles.length +
          uploadingFiles.acceptenceFiles.length + uploadingFiles.voucherFiles.length >
        0;

      if (hasOngoingUploads) {
        setShowAlert(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploadingFiles]);

  useEffect(() => {
    if (showAlert) {
      const confirmLeave = window.confirm("You have ongoing uploads. Are you sure you want to leave?");
      if (!confirmLeave) {
        // Cancel the page unload
        window.history.forward();
      }
    }
  }, [showAlert]);

  return <>{children}</>;
};

export default GlobalBeforeUnload;