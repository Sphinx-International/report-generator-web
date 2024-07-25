import { useDispatch } from "react-redux";
import { openSidebar} from "../Redux/slices/sideBarSlice";
import { AppDispatch } from "../Redux/store";


interface headerProps {
  pageSentence: string;
  searchBar: boolean;
}

const Header: React.FC<headerProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="flex flex-col gap-[18px] h-[20%]">
      <img
        src="/logo.png"
        alt="logo"
        className="sm:w-[100px] w-[86px] md:hidden"
      />
      <div className="pl-[7px] flex flex-col-reverse md:flex-row items-start gap-[10px] md:gap-0 justify-between w-full">
        <div className="flex flex-col md:gap-[4px] items-start">
          <h1 className="text-n800 lg:text-[25px] md:text-[24px] sm:text-[20px] leading-[34px] font-semibold">
            Welcome Back, Meriem
          </h1>
          <span className="text-n500 md:text-[14px] sm:text-[13px] text-[11px]">
            {props.pageSentence}
          </span>
        </div>
        <div className="flex items-center md:gap-[32px] md:justify-end justify-between md:w-fit w-full">
          <svg
            className="hidden md:inline-block"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6.8499 8.9999C6.8499 7.68101 7.29049 6.38991 8.1352 5.43961C8.96601 4.50496 10.2306 3.8499 11.9999 3.8499C13.7693 3.8499 15.0338 4.50496 15.8646 5.43961C16.7093 6.38991 17.1499 7.68101 17.1499 8.9999C17.1499 10.2595 17.7765 11.1981 18.2541 11.9136L18.2927 11.9714C18.8109 12.7488 19.1499 13.2937 19.1499 13.9999C19.1499 14.9742 18.4562 15.7577 17.0163 16.3362C15.5989 16.9057 13.7184 17.1499 11.9999 17.1499C10.2814 17.1499 8.4009 16.9057 6.98347 16.3362C5.54363 15.7577 4.8499 14.9742 4.8499 13.9999C4.8499 13.3064 5.17412 12.8296 5.69801 12.0753C6.20164 11.3503 6.8499 10.4078 6.8499 8.9999ZM11.9999 2.1499C9.76925 2.1499 8.0338 2.99485 6.86461 4.31019C5.70932 5.60989 5.1499 7.31879 5.1499 8.9999C5.1499 9.83343 4.79817 10.3909 4.30179 11.1055L4.23206 11.2056C3.76246 11.8784 3.1499 12.756 3.1499 13.9999C3.1499 16.0257 4.6784 17.2421 6.34968 17.9136C8.04336 18.5941 10.1628 18.8499 11.9999 18.8499C13.837 18.8499 15.9564 18.5941 17.6501 17.9136C19.3214 17.2421 20.8499 16.0257 20.8499 13.9999C20.8499 12.7403 20.2233 11.8017 19.7457 11.0862L19.7071 11.0284C19.1889 10.251 18.8499 9.70612 18.8499 8.9999C18.8499 7.31879 18.2905 5.60989 17.1352 4.31019C15.966 2.99485 14.2306 2.1499 11.9999 2.1499ZM9.52841 19.2927C9.91593 19.0343 10.4384 19.1362 10.7009 19.5192L10.7073 19.5277C10.7163 19.5396 10.734 19.562 10.7602 19.5914C10.8131 19.651 10.8969 19.7351 11.0099 19.8199C11.2334 19.9876 11.5589 20.1499 11.9999 20.1499C12.4409 20.1499 12.7664 19.9876 12.9899 19.8199C13.1029 19.7351 13.1867 19.651 13.2396 19.5914C13.2658 19.562 13.2835 19.5396 13.2925 19.5277L13.2989 19.5192C13.5614 19.1362 14.0839 19.0343 14.4714 19.2927C14.862 19.5531 14.9675 20.0808 14.7071 20.4714L13.9999 19.9999C14.7071 20.4714 14.7069 20.4717 14.7067 20.472L14.7063 20.4727L14.7053 20.4741L14.7032 20.4773L14.6982 20.4846L14.6848 20.5037C14.6744 20.5183 14.6611 20.5366 14.6448 20.558C14.6122 20.6008 14.5674 20.6565 14.5102 20.7209C14.3964 20.8488 14.2302 21.0147 14.0099 21.1799C13.5668 21.5122 12.8922 21.8499 11.9999 21.8499C11.1076 21.8499 10.433 21.5122 9.9899 21.1799C9.76961 21.0147 9.60336 20.8488 9.4896 20.7209C9.43243 20.6565 9.38763 20.6008 9.35504 20.558C9.33871 20.5366 9.32537 20.5183 9.315 20.5037L9.30164 20.4846L9.2966 20.4773L9.2945 20.4741L9.29354 20.4727L9.29309 20.472C9.29287 20.4717 9.29266 20.4714 9.9999 19.9999L9.29266 20.4714C9.03226 20.0808 9.13781 19.5531 9.52841 19.2927Z"
              fill="#170F49"
            />
            <path
              d="M24 2C24 3.10457 23.1046 4 22 4C20.8954 4 20 3.10457 20 2C20 0.895431 20.8954 0 22 0C23.1046 0 24 0.895431 24 2Z"
              fill="#FF3B30"
            />
          </svg>


          <svg
        onClick={() => {
         dispatch(openSidebar());
        }}
        className="md:hidden inline-block relative"
        xmlns="http://www.w3.org/2000/svg"
        width="39"
        height="39"
        viewBox="0 0 39 39"
        fill="none"
      >
        <rect
          opacity="0.8"
          x="0.5"
          y="0.5"
          width="38"
          height="38"
          rx="19"
          fill="white"
          stroke="#8E92BC"
        />
        <path
          d="M11.5226 15.0684H27.4772"
          stroke="#8E92BC"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M11.5226 19.5H27.4772"
          stroke="#8E92BC"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M11.5226 23.9321H27.4772"
          stroke="#8E92BC"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>


          <div className="flex items-center gap-[12px]">
            <img src="/avatar.png" alt="avatar" className="w-[35px] rounded-[50%]" />
            <div className="lg:flex items-center gap-[6px] text-n800 hidden text-[14px]">
              Mariem Boukennouche
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.39886 9.39886C6.73081 9.06692 7.269 9.06692 7.60094 9.39886L11.9999 13.7978L16.3989 9.39886C16.7308 9.06692 17.269 9.06692 17.6009 9.39886C17.9329 9.73081 17.9329 10.269 17.6009 10.6009L12.6009 15.6009C12.269 15.9329 11.7308 15.9329 11.3989 15.6009L6.39886 10.6009C6.06692 10.269 6.06692 9.73081 6.39886 9.39886Z"
                  fill="#170F49"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {props.searchBar && (
        <div className="md:pr-[16px] relative">
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
      )}
    </div>
  );
};

export default Header;
