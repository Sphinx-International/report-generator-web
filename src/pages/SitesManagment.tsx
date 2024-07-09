import SideBar from '../components/SideBar'
import Header from '../components/Header'
//import Main from '../components/Main'

const SitesManagment = () => {
  return (
    <div className='w-full flex h-[100vh]'>
        <SideBar/>
        <div className="pl-[33px] pt-[60px] pr-[56px] pb-[38px] flex flex-col gap-[32px] w-full h-full overflow-auto">
          <Header pageSentence='Here are information about alls sites' searchBar={true}/>

        </div>
    </div>
  )
}

export default SitesManagment