import { NavLink } from "react-router-dom"
import { Handshake, CircleDollarSign } from "lucide-react"

const Menu = () => {

    return (
        <div className="bg-gray-950 min-h-screen flex flex-col items-center justify-center">

            <div className="text-center mb-12">
                <h1 className="font-sans font-semibold text-3xl text-white uppercase tracking-widest mb-3">Menu</h1>
                <p className="font-normal text-sm text-gray-400">Selecione o módulo que deseja acessar</p>
            </div>

            <div className="flex gap-5">
                
             <NavLink to={"/clientes/dados"}
                className="group w-64 rounded-2xl p-8  border  border-slate-900 bg-gray-100 flex flex-col 
                items-center justify-center gap-4 hover:border-emerald-200 transition-all hover:translate-y-1 hover:shadow-lg hover:shadow-emerald-500/50">
                
                <div className="w-12 h-12 flex items-center justify-center
                 rounded-lg bg-emerald-500/10">
                    <Handshake className="w-6 h-6 text-emerald-400" />                
                </div>

                <div className="text-center font-serif">
                    <p className="font-serif font-sm mb-1 font-semibold text-gray-900">Área de Clientes</p>
                    <p className="font-xs text-gray-500 leading-relaxed">Anamese e gestão de clientes</p>
                </div>
             </NavLink>

             <NavLink to={"/financeiro/pipeline"}
                className="group w-64 rounded-2xl p-8  border border-slate-900 bg-gray-100 flex flex-col 
                items-center justify-center gap-4 hover:border-emerald-200 transition-all hover:translate-y-1 hover:shadow-lg hover:shadow-emerald-500/50">
                
                <div className="flex w-12 h-12 rounded-lg bg-emerald-500/10 items-center justify-center">
                 <CircleDollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-center font-serif">
                 <p className="font-semibold font-2xl text-gray-900 mb-1">Área Financeira</p>
                 <p className="font-extralight font-xs text-gray-500 leading-relaxed">Receitas e Consultorias Prestadas</p>
                </div>
             </NavLink>

            </div>
        </div>
    )
}

export default Menu