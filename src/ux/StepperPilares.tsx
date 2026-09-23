import { NavLink, useParams } from "react-router-dom"
import { Waypoints } from "lucide-react"

const pilares = [
    {nome : "Gestão", rota : "gestao"},
    {nome : "Financeiro", rota : "financeiro"},
    {nome : "Comercial", rota : "comercial"},
    {nome : "Operações", rota : "operacoes"},
    {nome : "Pessoas", rota : "pessoas"},
    {nome : "Experiência", rota : "clientesexperiencia"},
    {nome : "Tecnologia", rota : "tecnologia"},
]

export const StepperPilares = () => {

    const  { empresa } = useParams()
    
    return (
        <nav className="flex mt-4 w-full max-w-fit gap-6 px-4 py-2">
         {pilares.map((pilar) => (
            <NavLink 
             className="flex flex-col items-center w-full max-w-fit" 
             to={`/clientes/form/${empresa}/${pilar.rota}`} >
             {({ isActive }) => (
              <>
              <div className={` hover:bg-emerald-500 hover:text-white py-1 px-1 rounded-lg flex justify-center
                ${isActive ? "bg-emerald-600 text-white" : "bg-emerald-300/50 text-emerald-600"}
                `}>
               <Waypoints className="h-4 w-3" />
              </div>
              <p className={`font-sans text-[8px] font-normal
                ${isActive ? "text-gray-900" : "text-gray-600"}
                `}>
                {pilar.nome}</p>
              </>
            )}
            </NavLink>
        ))}
        </nav>
    )
}

export default StepperPilares;