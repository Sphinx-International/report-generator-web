import SideBar from "../components/SideBar";
import Header from "../components/Header";
const MissionDetails = () => {
  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className=" md:pt-[60px] pt-[20px] pr-[60px] pl-[36px] md:pb-[38px] flex flex-col gap-[58px] w-full h-full overflow-auto">
        <Header pageSentence="Mission details" searchBar={false} />
        <div className="flex flex-col w-full gap-[24px] ">
          <div className="flex flex-col items-start gap-[14px] pl-[6px]">
            <h1 className="text-primary font-semibold text-[24px] leading-[36px]">
              Mission title
            </h1>
            <p className="text-[18px] leading-[30px] text-n600">
              Certainly elsewhere my do allowance at. The address farther six
              hearted hundred towards husband. Are securing off occasion
              remember daughter replying. Held that feel his see own yet.
              Strangers ye to he sometimes propriety in. She right plate seven
              has. Bed who perceive judgment did marianne Bed who perceive
              judgment did marianne Bed who perceive judgment did marianne Bed
              who perceive judgment did marianne:
            </p>
            <div className="flex flex-col items-start gap-[10px]">
              <h5 className="text-n700 text-[18px] leading-[27px] font-medium">Engineer</h5>
              <span className="py-[6px] px-[15px] bg-[#EAE3FF] rounded-[50%] text-primary font-semibold text-[21px] cursor-pointer hover:bg-n400">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionDetails;
