import { NavLink } from "react-router-dom"
import logo from "../assets/Videira (9).png"
import { useAuth } from "../contexts/AuthContext"
import { Timeline, ChartLine, UserPen} from "lucide-react"


interface SidebarProps {
    collapsed : boolean
    onToggle : () => void
}

export const SidebarFinanceiro = ({ collapsed = false} : SidebarProps) => {

    const { user } = useAuth()

    return (
        <div className={`flex flex-col border-r pl-4 pr-2 border-gray-900 transition-all duration-300 ${
            collapsed ? "w-16": "w-56"
        }`}>
        
        { collapsed ? (
            <div className="flex justify-center items-center mb-2 mt-4">
             <img src={logo} className="h-10 w-10" />
            </div>
        ) : (
            <div className="flex justify-start mt-4">
             <img src={logo} className="h-16 w-16" />
             <div className="flex flex-col justify-center items-center">
                <h3 className="text-xl font-mono font-semibold text-white uppercase tracking-widest">Selah</h3>
                <span className="flex gap-1 text-[9px] font-semibold text-emerald-400">Controladoria<strong className="text-white">Estratégica</strong></span>
             </div>
            </div>
        )}

        {!collapsed && (
            <p className="text-white font-sans text-sm text-center mt-3">Bem Vindo, {user?.nome}!</p>
        )}

        { collapsed ? (
            <nav className="flex flex-col gap-2 mt-3">
                <NavLink to={"/financeiro/pipeline"} className={({isActive}) => `flex justify-center px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 
                ${isActive ? "text-white bg-gray-800" : "hover:bg-gray-800 hover:text-white"}`}>
                 <Timeline className="w-4 h-4 text-white" />
                </NavLink>

                <NavLink to={"/financeiro/contratos"} className={({isActive}) => `flex justify-center px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 
                ${isActive ? "text-white bg-gray-800" : "hover:bg-gray-800 hover:text-white"}`}>
                 <UserPen className="w-4 h-4 text-white" />
                </NavLink>

                <NavLink to={"/financeiro/dashboards"} className={({isActive}) => `flex justify-center px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8
                ${isActive ? "text-white bg-gray-800" : "hover:bg-gray-800 hover:text-white"}`}>
                 <ChartLine className="w-4 h-4 text-white" />
                </NavLink>
            </nav>

        ) : (

            <nav className="flex flex-col gap-2 mt-2">
                <NavLink to={"/financeiro/pipeline"} className={({isActive}) => `px-2 py-1 mr-auto mt-3 mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 flex items-center justify-start
                ${isActive ? "text-white bg-gray-800" : "hover:bg-gray-800 hover:text-white"}`}>
                 <Timeline className="w-4 h-4 text-white" />
                 <p className="text-gray-200">Pipeline</p>
                </NavLink>

                <NavLink to={"/financeiro/contratos"} className={({isActive}) => `px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 flex items-center justify-start
                ${isActive ? "text-white bg-gray-800" : "hover:bg-gray-800 hover:text-white"}`}>
                 <UserPen className="w-4 h-4 text-white" />
                 <p className="text-gray-200">Contratos</p>
                </NavLink>

                <NavLink to={"/financeiro/dashboards"} className={({isActive}) => `px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 flex items-center justify-start
                ${isActive ? "text-white bg-gray-800" : "hover:bg-gray-800 hover:text-white"}`}>
                 <ChartLine className="w-4 h-4 text-white" />
                 <p className="text-gray-200">Dashboards</p>
                </NavLink>
            </nav>

        )}
        </div>
    )
}