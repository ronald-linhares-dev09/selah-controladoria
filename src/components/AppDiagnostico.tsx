import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { PanelLeftClose, LogOut, Menu } from "lucide-react"
import { Outlet, useParams } from "react-router-dom"
import { NavLink } from "react-router-dom"
import { Sidebar } from "./AppSidebar"
import { StepperIndicadores } from "../ux/StepperIndicadores"
import logo from "../assets/Videira (7).png"

export const AppDiagnostico = () => {

    const { logout } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const handleToggle = () => setCollapsed(prev => !prev)
    const {empresa} = useParams()


    return (
    <div className="flex h-screen bg-gray-950 ">
        
        <Sidebar collapsed={collapsed} onToggle={handleToggle} />
        
      <div className="flex flex-col flex-1 overflow-hidden">
         <header className="h-16 border-b border-slate-50 flex shrink-0 px-3 py-3">
          <div className="flex items-center justify-between w-full gap-4 ">
            <button onClick={() => {
             handleToggle()}} className="mr-auto  text-sm transition-colors flex items-center px-3 py-1 rounded-md text-gray-400 hover:text-white">
             <PanelLeftClose className="h-5 w-5"/>
            </button>
            <NavLink
                  to={"/menu"}
                  className="flex items-center  rounded-lg bg-emerald-400 px-3 py-1 text-sm text-gray-950 hover:bg-emerald-700 hover:text-white transition-colors gap-2" >
                    <Menu className="h-4 w-4"></Menu>
                    <p>Menu</p>
            </NavLink>

            <button
                  onClick={logout}
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white rounded-lg border border-gray-300/50 transition-colors text-left flex gap-2 items-center" >
                    <LogOut className="h-4 w-4"></LogOut>
                    <p>Sair</p>
            </button>
           </div>
         </header>


        <main  className="flex-1 overflow-y-auto bg-slate-50">
            <div className="flex justify-between items-center px-16 mt-6 relative w-full ">
                <div className="flex flex-col items-start">
                    <h3 className="font-extralight font-serif tracking-widest text-[10px]">Empresa</h3>
                    <h1 className="text-gray-950 font-bold font-serif text-4xl mt-1">{empresa}</h1> 
                </div>

                <StepperIndicadores />
                <img className="w-28 h-28" src={logo} />
            </div>            

            <Outlet />
        </main>
        
      </div>
    </div>
    )
}

export default AppDiagnostico;