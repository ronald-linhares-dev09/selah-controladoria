import { Outlet,NavLink } from "react-router-dom";
import { Sidebar } from "./AppSidebar"
import { useAuth } from "../contexts/AuthContext";
import { LogOut, PanelLeftClose, Menu } from "lucide-react";
import { useState } from "react";
import logo from '../assets/Videira (7).png'


export const AppLayout = () => {

    const { logout } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const handleToggle = () => setCollapsed(prev => !prev)

     
    return (
     <div className="flex h-screen bg-gray-950 ">
        
        <Sidebar collapsed={collapsed} onToggle={handleToggle} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
         <header className="h-16 border-b border-slate-50 flex shrink-0 px-3 py-3">
         <div className="flex items-center justify-between w-full gap-3">
            <button onClick={() => {
             handleToggle()}} className="mr-auto  text-sm transition-colors lex items-center px-3 py-1 rounded-md text-gray-400 hover:text-white">
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


         <main className="flex-1 overflow-y-auto bg-slate-50 relative">
            <img src={logo} className="w-32 h-32 absolute right-20" />
            <Outlet />
         </main>
        </div>
     </div>
    )
}

