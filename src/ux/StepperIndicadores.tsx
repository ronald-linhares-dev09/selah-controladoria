import { Wrench } from "lucide-react"
import { NavLink, useParams } from "react-router-dom"

const analises = [
    {"nome": "Geral", rota : "geral"},
    {"nome": "Individual", rota : "individual" }
]

export const StepperIndicadores = () => {
    const { cliente_id, empresa } = useParams()

   return (

    <nav className="flex absolute left-1/2 -translate-x-1/2 items-center gap-6 ">
        {analises.map((analise) => (
            <NavLink 
              to={`/clientes/${cliente_id}/${empresa}/diagnostico/${analise.rota}`}
              className={({ isActive }) => `
                px-6 py-4 flex justify-center gap-3 rounded-xl transition-colors text-gray-700 border items-center w-full hover:bg-emerald-200/30 hover:border-emerald-500
               ${isActive ? "border-emerald-500 bg-emerald-200/30" : "border-gray-400 bg-transparent"}`}>
               <Wrench className="h-6 w-5" />
              <p className="font-sans text-[16px] font-bold">
                {analise.nome}
              </p>                
            </NavLink>
        ))}
    </nav>
   )

    
}