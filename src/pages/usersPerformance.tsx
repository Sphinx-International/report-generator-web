import Header from "../components/Header";
import SideBar from "../components/SideBar";
const usersPerformance = () => {
  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] lg:pr-[30px] sm:px-[30px] px-[15px] md:pt-[32px] pt-[20px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here is info about users performance"
          searchBar={false}
        />
      </div>
    </div>
  );
};

export default usersPerformance;
