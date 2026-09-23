import { NavLink, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/Videira (9).png"
import { Database,UserSearch, Waypoints } from "lucide-react"
import { useEffect, useState } from "react";

interface SidebarProps {
    collapsed: boolean
    onToggle : () => void
}

interface DadosQuestionario {

    pilaresLiberados : number[]
    respostas : {
        [pilar : number] : {
            nota : number
        }
    }
}

export const Sidebar = ({ collapsed = false} : SidebarProps) => {

    const { user } = useAuth()
    const { empresa } = useParams()
    const [ pilares, setPilares] = useState<number[]>([])
    const { pathname } = useLocation()


    useEffect(() => {
        if (!empresa) return;

        const salvo = localStorage.getItem(`Questionario${empresa}`)
        if (!salvo) return;

        const item = JSON.parse(salvo) as DadosQuestionario

        if (item.pilaresLiberados) {
            setPilares(item.pilaresLiberados)
        }
    },[empresa,pathname])

    return (
    <div className={`flex flex-col  border-r pl-4 pr-2 border-gray-800 transition-all duration-300 ${
            collapsed ? "w-16" : "w-60"
        }`}>


        { collapsed ? (
           <div className="flex items-center justify-center mb-2 mt-4">
              <img src={logo} className="h-10 w-10" />
            </div>
        ) : (
            <div className="flex justify-start mt-4">
              <img src={logo} className="h-16 w-16" />
              <div className="flex flex-col justify-center items-center">
              <h3 className="text-xl font-semibold text-white font-mono tracking-widest uppercase">Selah</h3>
              <span className="text-[9px] font-semibold  text-emerald-400">Controladoria <strong className="text-white">Estratégica</strong></span>
              </div>
            </div>
        )
        }

        {!collapsed && (
             <p className="text-white font-sans text-sm text-left ml-2 mt-3">Bem Vindo, {user?.nome}!</p>
        )}

        { collapsed ? ( 
            <nav className="flex flex-col gap-2 mt-3" >
                <NavLink to={"/clientes/dados"}
                className={({ isActive }) => 
                `flex justify-center px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 ${
                    isActive ? "text-gray-300 bg-gray-800" : "hover:bg-gray-800 hover:text-white"}
                `} 
                >
                <Database className="w-4 h-4 text-white" />
                </NavLink>

                <NavLink to={"/clientes/view"}
                className={({ isActive }) => 
                `flex justify-center px-2 py-1 mr-auto mb-1 rounded-xl w-full text-sm font-medium transition-colors gap-8 ${
                    isActive ? "text-gray-300 bg-gray-800" : "hover:bg-gray-800 hover:text-white"
                }`}
                >
                <UserSearch className="w-4 h-4 text-white" />
                </NavLink>

                <div 
                 className={`flex justify-center px-2 py-1 mr-auto  rounded-xl w-full text-sm font-medium transition-opacity gap-8 
                    ${pilares.length > 0 ? "text-gray-300 bg-gray-800 opacity-1" : "opacity-0"}`}
                >
                <Waypoints className="w-4 h-4 text-white" />
                </div>
            </nav>
                
            ) : (
            <nav className="flex flex-col gap-1 mt-2">
                <NavLink to={"/clientes/dados"}
                className={({ isActive }) => 
                `px-2 py-1 mr-auto mt-3  rounded-xl w-full text-sm font-medium transition-colors gap-8 flex items-center justify-start ${
                    isActive ? "text-gray-300 bg-gray-800" : "hover:bg-gray-800 hover:text-white"}
                `} 
                >
                <Database className="w-4 h-4 text-white" />
                <p className="text-gray-200">Cadastro de Clientes</p>
                </NavLink>

                <NavLink to={"/clientes/view"}
                className={({ isActive }) => 
                `px-2 py-1 mr-auto mt-3  rounded-xl w-full text-sm font-medium transition-colors gap-8 flex items-center justify-start ${
                    isActive ? "text-gray-300 bg-gray-800" : "hover:bg-gray-800 hover:text-white"
                }`}
                >
                <UserSearch className="w-4 h-4 text-white" />
                <p className="text-gray-200">Clientes</p>
                </NavLink>

                {(pilares.length > 0 && pathname.includes("form")) && ( 
                    <div 
                    className= "px-2 py-1 mr-auto mt-3  rounded-xl w-full text-sm font-medium transition-opacity gap-8 flex items-center justify-start  text-gray-300 bg-gray-800">
                     <Waypoints className="w-4 h-4 text-white" />
                     <p className="text-gray-200">Questionário</p>
                    </div>
                )}

                {pathname.includes('diagnostico') && (
                    <div 
                      className= "px-2 py-1 mr-auto mt-3  rounded-xl w-full text-sm font-medium transition-opacity gap-8 flex items-center justify-start text-gray-300 bg-gray-800 opacity-1">
                      <Waypoints className="w-4 h-4 text-white" />
                      <p className="text-gray-200">Diagnóstico</p>
                    </div>
                )}
            </nav>)}

    </div>
    )
}