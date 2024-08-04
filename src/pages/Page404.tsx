import Header from "../components/Header";
import SideBar from "../components/SideBar";
const Page404 = () => {
  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="It's LooK Like You are loset .."
          searchBar={false}
        />
        <div className="flex flex-col items-center justify-center w-full flex-grow gap-[25px]">
          <div className="flex flex-col items-center justify-center">
            {" "}
            <img
              src="/astronaut/astronaut404.png"
              alt="astro"
              className="w-[350px] h-[240px]"
            />
            <h2 className="text-[36px] font-bold text-n800">Page Not Found</h2>
          </div>
          <p className="text-[22px] text-n800 font-medium w-[610px] text-center">we’re sorry. the page you requested could not be found
          Please go back </p>
        </div>
      </div>
    </div>
  );
};

export default Page404;
