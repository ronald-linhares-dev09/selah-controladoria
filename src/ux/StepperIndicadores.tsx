import { Wrench } from "lucide-react"
import { NavLink, useParams } from "react-router-dom"

const analises = [
    {"nome": "Geral", rota : "geral"},
    {"nome": "Individual", rota : "individual" }
]

export const StepperIndicadores = () => {
    const { id, empresa } = useParams()

   return (

    <nav className="flex absolute left-1/2 -translate-x-1/2 items-center gap-6 ">
        {analises.map((analise) => (
            <NavLink 
              to={`/clientes/${id}/${empresa}/diagnostico/${analise.rota}`}
              className="flex flex-col items-center w-full"
              >
              {({ isActive }) => (
                <>
              <div className={` hover:bg-emerald-500 hover:text-white py-1 px-1 rounded-lg flex justify-center
                ${isActive ? "bg-emerald-600 text-white" : "bg-emerald-300/50 text-emerald-600"}
                `}>
               <Wrench className="h-6 w-5" />
              </div>
              <p className={`font-sans text-[10px] font-normal
                ${isActive ? "text-gray-900" : "text-gray-600"}
                `}>
                {analise.nome}
              </p>                
                </>
              )}
            </NavLink>
        ))}
    </nav>
   )

    
}