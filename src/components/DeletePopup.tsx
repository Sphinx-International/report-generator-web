import { forwardRef, useState, MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { deleteSelectedUsers } from "../Redux/slices//selectedUsersSlice";
import { deleteSelectedWorkorders } from "../Redux/slices/selectedWorkordersSlice";
import { AppDispatch } from "../Redux/store";
import { RotatingLines } from "react-loader-spinner";

interface DeletePopUpProps {
  deleteItems: string[];
  deleteUrl: string
  jsonTitle:string
  fetchUrl: string;
  fetchFunc: (offset: number, limit: number,status?:string | null) => Promise<{ total: number; current_offset: number}>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: number;
}

const DeletePopup = forwardRef<HTMLDialogElement, DeletePopUpProps>(
  (props, ref) => {

    const dispatch = useDispatch<AppDispatch>();

    const [isLoading, setIsLoading] = useState(false);

    const closeDialog = (
      eo: MouseEvent<HTMLButtonElement> | React.FormEvent
    ) => {
      eo.preventDefault();
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.close();
        ref.current.style.display = "none";
      }
    };

    const handleDeleteItems = async (e: React.FormEvent) => {
      e.preventDefault();
    
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }
      setIsLoading(true);
    
      try {
        // Fetch current users to determine if deletion will empty the current page
        const initialResponse = await fetch(`${props.fetchUrl}?offset=${(props.currentPage - 1) * props.limit}&limit=${props.limit}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
    
        if (!initialResponse.ok) {
          console.error("Failed to fetch users before deletion");
          throw new Error("Failed to fetch users before deletion");
        }
    
        const initialData = await initialResponse.json();
        const initialUserCount = initialData.data.length;
    
        // Perform deletion
        const response = await fetch(`${props.deleteUrl}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            [props.jsonTitle]: props.deleteItems,
          }),
        });
    
        if (!response.ok) {
          console.error("Error deleting users:", await response.text());
          alert("Failed to delete users");
          return;
        }
    
        // Determine if the current page is empty after deletion
        const newUserCount = initialUserCount - props.deleteItems.length;
        if (localStorage.getItem("selectedFilter") === "all" || !localStorage.getItem("selectedFilter") ) {
          if (newUserCount === 0 && props.currentPage > 1) {
            await props.fetchFunc((props.currentPage - 2) * props.limit, props.limit);
            props.setCurrentPage(props.currentPage - 1);
          } else {
            await props.fetchFunc((props.currentPage - 1) * props.limit, props.limit);
          }
        }else{
          if (newUserCount === 0 && props.currentPage > 1) {
            await props.fetchFunc((props.currentPage - 2) * props.limit, props.limit,localStorage.getItem("selectedFilter"));
            props.setCurrentPage(props.currentPage - 1);
          } else {
            await props.fetchFunc((props.currentPage - 1) * props.limit, props.limit,localStorage.getItem("selectedFilter"));
          }
        }


      } catch (error) {
        console.error("Error deleting users:", error);
        alert("Failed to delete items");
      } finally {
        setIsLoading(false);
        closeDialog(e);
        dispatch(deleteSelectedUsers());
        dispatch(deleteSelectedWorkorders());

      }
    };
    
    

    return (
      <dialog
        ref={ref}
        id="User-popup"
        className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-[26px] pb-[35px] pt-[25px]  flex-col items-center gap-[27px] rounded-[20px] w-[30vw]`}
      >
        <div className="flex items-center flex-col gap-[17px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46"
            height="46"
            viewBox="0 0 46 46"
            fill="none"
          >
            <path
              d="M23.0002 42.1666C12.4144 42.1666 3.8335 33.5857 3.8335 22.9999C3.8335 12.4142 12.4144 3.83325 23.0002 3.83325C33.5859 3.83325 42.1668 12.4142 42.1668 22.9999C42.1668 33.5857 33.5859 42.1666 23.0002 42.1666ZM23.0002 38.3333C27.0668 38.3333 30.9669 36.7178 33.8425 33.8422C36.718 30.9667 38.3335 27.0666 38.3335 22.9999C38.3335 18.9333 36.718 15.0332 33.8425 12.1576C30.9669 9.28206 27.0668 7.66659 23.0002 7.66659C18.9335 7.66659 15.0334 9.28206 12.1579 12.1576C9.2823 15.0332 7.66683 18.9333 7.66683 22.9999C7.66683 27.0666 9.2823 30.9667 12.1579 33.8422C15.0334 36.7178 18.9335 38.3333 23.0002 38.3333ZM23.0002 13.4166C23.5085 13.4166 23.996 13.6185 24.3555 13.978C24.7149 14.3374 24.9168 14.8249 24.9168 15.3333V24.9166C24.9168 25.4249 24.7149 25.9124 24.3555 26.2719C23.996 26.6313 23.5085 26.8333 23.0002 26.8333C22.4918 26.8333 22.0043 26.6313 21.6449 26.2719C21.2854 25.9124 21.0835 25.4249 21.0835 24.9166V15.3333C21.0835 14.8249 21.2854 14.3374 21.6449 13.978C22.0043 13.6185 22.4918 13.4166 23.0002 13.4166ZM23.0002 32.5833C22.4918 32.5833 22.0043 32.3813 21.6449 32.0219C21.2854 31.6624 21.0835 31.1749 21.0835 30.6666C21.0835 30.1583 21.2854 29.6707 21.6449 29.3113C22.0043 28.9519 22.4918 28.7499 23.0002 28.7499C23.5085 28.7499 23.996 28.9519 24.3555 29.3113C24.7149 29.6707 24.9168 30.1583 24.9168 30.6666C24.9168 31.1749 24.7149 31.6624 24.3555 32.0219C23.996 32.3813 23.5085 32.5833 23.0002 32.5833Z"
              fill="#F24E1E"
            />
          </svg>
          <p className="text-[18px] font-semibold text-center text-[#25282B]">
            Are you sure you want to delete this {props.jsonTitle}?
          </p>
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            className="text-white px-[56px] py-[12.5px] rounded-[86px] bg-[#FF3B30] text-[14px] flex items-center"
            onClick={(e) => {
              handleDeleteItems(e);
            }}
          >
            {isLoading ? <RotatingLines strokeColor="white" width="20"/> : "Yes"}
            
          </button>
          <button
            className="text-n600 px-[56px] py-[12.5px] rounded-[86px] bg-n300 text-[14px] border-[1px] border-n400"
            onClick={(e) => {
              closeDialog(e);
            }}
          >
            No{" "}
          </button>
        </div>
      </dialog>
    );
  }
);

export default DeletePopup;
