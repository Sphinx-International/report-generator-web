import { User } from "../../assets/types/User";
import { getRole } from "../../func/getUserRole";
import { emailMetuSettings } from "../../assets/emailSetting";
import { useState, useEffect } from "react";
import { MutedMail } from "../../assets/types/Mails&Notifications";
import "../../styles/CustomCheckbox.css";

const baseUrl = import.meta.env.VITE_BASE_URL;

const EmailSettings = () => {
  const user: User = JSON.parse(localStorage.getItem("user")!);
  const [loading, setLoading] = useState<boolean>(false); // Add loading state

  const [mutedMails, setMutedMails] = useState<MutedMail[]>([]);

  const fetchMutedMails = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const url = `${baseUrl}/mail/get-muted-mails`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      // Check if the response is empty
      if (text) {
        const data = JSON.parse(text);
        setMutedMails(data);
      } else {
        setMutedMails([]);
      }
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const muteMail = async (type: number) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const url = `${baseUrl}/mail/mute-mail/${type}`;
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (response.ok) {
        fetchMutedMails();
      } else console.log("error" + response.status);
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const unmuteMail = async (type: number) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const url = `${baseUrl}/mail/unmute-mail/${type}`;
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (response.ok) {
        fetchMutedMails();
      } else console.log("error" + response.status);
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutedMails();
  }, []);

  return (
    <>
      <div className="flex flex-col items-start gap-[40px]">
        <div className="flex flex-col items-start gap-4">
          <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
            My email address
          </h3>
          <div className="flex items-center gap-[14px]">
            <span className="rounded-[50%] bg-n300 p-[8px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 23 23"
                fill="none"
              >
                <path
                  d="M16.1471 3.50879H6.78602C3.97769 3.50879 2.10547 4.91296 2.10547 8.18934V14.7421C2.10547 18.0185 3.97769 19.4227 6.78602 19.4227H16.1471C18.9555 19.4227 20.8277 18.0185 20.8277 14.7421V8.18934C20.8277 4.91296 18.9555 3.50879 16.1471 3.50879ZM16.5871 9.20971L13.6571 11.55C13.0392 12.0461 12.2529 12.2895 11.4666 12.2895C10.6802 12.2895 9.88455 12.0461 9.27608 11.55L6.34605 9.20971C6.0465 8.96632 5.99969 8.51698 6.23372 8.21743C6.47711 7.91787 6.91708 7.86171 7.21664 8.10509L10.1467 10.4454C10.8581 11.0164 12.0657 11.0164 12.7771 10.4454L15.7072 8.10509C16.0067 7.86171 16.4561 7.90851 16.6901 8.21743C16.9335 8.51698 16.8867 8.96632 16.5871 9.20971Z"
                  fill="#4A3AFF"
                />
              </svg>
            </span>
            <span className="sm:text-[16px] text-[15px] text-n700 leading-[27px]">
              {user?.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
            Email notification
          </h3>
          <div className="flex flex-col items-start gap-2">
            {getRole() === 0
              ? emailMetuSettings.map((email, index) => {
                  if (email.access === "admin" || email.access === "all") {
                    return (
                      <div className="flex items-center gap-2" key={index}>
                        <input
                          type="checkbox"
                          name="email"
                          id="email"
                          // className="custom-checkbox"
                          className="w-[15px] h-[15px] cursor-pointer"
                          checked={
                            !mutedMails.some(
                              (mutedMail) => mutedMail.type === email.type
                            )
                          }
                          onChange={(e) => {
                            if (!loading) {
                              // Prevent changes when loading is true
                              if (e.target.checked) {
                                unmuteMail(email.type); // Call the unmute function
                              } else {
                                muteMail(email.type); // Call the mute function
                              }
                            }
                          }}
                          disabled={loading}
                        />
                        <span className="text-n700">{email.title}</span>
                      </div>
                    );
                  }
                  return null; // Ensure the map function always returns something
                })
              : getRole() === 1
              ? emailMetuSettings.map((email, index) => {
                  if (email.access === "coord" || email.access === "all") {
                    return (
                      <div className="flex items-center gap-2" key={index}>
                        <input
                          type="checkbox"
                          name="email"
                          id="email"
                          className="w-[15px] h-[15px] cursor-pointer"
                          checked={
                            !mutedMails.some(
                              (mutedMail) => mutedMail.type === email.type
                            )
                          }
                          onChange={(e) => {
                            if (!loading) {
                              // Prevent changes when loading is true
                              if (e.target.checked) {
                                unmuteMail(email.type); // Call the unmute function
                              } else {
                                muteMail(email.type); // Call the mute function
                              }
                            }
                          }}
                          disabled={loading} // Disable the checkbox while loading
                        />
                        <span className="text-n700">{email.title}</span>
                      </div>
                    );
                  }
                  return null;
                })
              : emailMetuSettings.map((email, index) => {
                  if (email.access === "eng" || email.access === "all") {
                    return (
                      <div className="flex items-center gap-2" key={index}>
                        <input
                          type="checkbox"
                          name="email"
                          id="email"
                          className="w-[15px] h-[15px] cursor-pointer"
                          checked={
                            !mutedMails.some(
                              (mutedMail) => mutedMail.type === email.type
                            )
                          }
                          onChange={(e) => {
                            if (!loading) {
                              // Prevent changes when loading is true
                              if (e.target.checked) {
                                unmuteMail(email.type); // Call the unmute function
                              } else {
                                muteMail(email.type); // Call the mute function
                              }
                            }
                          }}
                          disabled={loading} // Disable the checkbox while loading
                        />
                        <span className="text-n700">{email.title}</span>
                      </div>
                    );
                  }
                  return null; // Ensure the map function always returns something
                })}
          </div>
        </div>
        {getRole() === 0 && (
          <div className="flex flex-col items-start gap-4">
            <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
              Report
            </h3>
            <div className="flex items-center gap-[14px]">
              <span className="text-n700">Report notification</span>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={
                    !mutedMails.some((mutedMail) => mutedMail.type === 306)
                  }
                  onChange={(e) => {
                    if (!loading) {
                      // Prevent changing the toggle when loading is true
                      if (e.target.checked) {
                        unmuteMail(306);
                      } else {
                        muteMail(306);
                      }
                    }
                  }}
                  disabled={loading}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 dark:peer-focus:ring-n700 rounded-full peer dark:bg-n500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A3AFF]"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmailSettings;
