import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { Search } from "lucide-react"
import type { Cliente } from "../../schemas/clientes"
import type { ContratoRead } from "../../schemas/contratos"
import { lista_clientes_filter } from "../../services/clientes"
import { obter_contrato } from "../../services/contratos"

const categorias : Record<string,string> = {
    "Varejo" : "bg-emerald-500/20 text-emerald-600",
    "Tecnologia" : "bg-blue-500/20 text-blue-600",
    "Saúde" : "bg-yellow-500/20 text-yellow-600",
}

const backgroundPattern = "bg-gray-600/20 text-gray-600"

const inicias = ( nome : string) => {
    return nome.split(" ").slice(0,2).map((n) => n[0]).join("")
}

const Contratos = () => {
    
    const [dadosClientes, setDadosCliente] = useState<Cliente[]>([])
    const [dadosContrato, setDadosContrato] = useState<ContratoRead[]>([])
    const [search, setSearch] = useState("")

    useEffect( () => {
        const fetch_dados = async() => {
            try {
                const data = await lista_clientes_filter({param : 'status', value : 'contratado'})
            
                setDadosCliente(data.clientes)
                console.log("Dados dos clientes recebidos")
                    try {
                        const data_contrato = await obter_contrato()

                        setDadosContrato(data_contrato)
                        console.log("Dados do contrato recebidos")
                    } catch (erro) {
                        console.log(erro)
                    }
            } catch (erro) {
                toast.error(erro instanceof Error ? erro.message : "Erro ao buscar dados do cliente")
            }
        }
        fetch_dados()},[]
    )

    const clientes_contratos = useMemo(() => {
        return dadosContrato.map(contrato => {
            const cliente = dadosClientes.find(c => c.id === contrato.cliente_id)
            return {...contrato, ...cliente}
        })
    },[dadosContrato, dadosClientes])

    const mesesContrato = (created_at : string) : number => {
        const inicio = new Date(created_at)
        const fim = new Date()
        const diff = ( fim.getFullYear() - inicio.getFullYear() ) * 12 
        + ( fim.getMonth() - inicio.getMonth() )
        return Math.max(0, diff)
    }

    const filter_contratos = 
     clientes_contratos.filter(c => c.nome?.toLowerCase().includes(search.toLocaleLowerCase()))

    return(
        <div className="flex flex-col w-full ">

            <div className="flex flex-col items-start px-10 pt-10 pb-7 justify-center">
                <p className="font-bold uppercase text-gray-500 font-serif tracking-widest text-[10px]">Área Financeira</p>
                <h2 className="text-3xl font-serif font-bold text-gray-950">Contratos <span className="text-emerald-500">Ativos</span></h2>
            </div>

            <section className="bg-gray-100 px-10 py-6 flex flex-col gap-4 min-h-screen h-screen flex-1">

                <div className="relative">
                    <Search className="-translate-y-1/2 absolute top-1/2 w-4 h-4 pointer-events-none left-4 text-gray-500" />
                    <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder="Digite o nome do cliente"
                    className="border border-stone-800 bg-white text-gray-900 font-sans text-sm w-full rounded-xl pl-10 pr-2 py-3 transition-colors focus:outline-none hover:border-emerald-500 focus:border-emerald-500"></input>
                </div>

         {filter_contratos.map((dados)=> {
            const passados = mesesContrato(dados.created_at)
            const total = parseInt(dados.tempo_contrato)
            const porcentagem = total > 0 ? Math.min(Math.round((passados / total) * 100), 100) : 0


            return (
            <div key={dados.cliente_id} className="flex flex-col border-[1.5px] border-gray-800/50 rounded-xl  bg-white px-6 py-8  hover:border-emerald-500">
                <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                        <span className={` rounded-full flex-shrink-0 py-5 flex items-center justify-center w-12 h-12 ${categorias[dados.segmento ?? ""] ?? backgroundPattern}`}>
                         <p className="font-semibold font-sans text-sm">{inicias(dados.nome ?? "")}</p>
                        </span>

                        <span className="flex flex-col items-start">
                            <h1 className="text-lg font-sans text-gray-950 fonte-semibold">{dados.nome}</h1>
                            <p className="text-xs font-sans text-gray-500 tracking-wider font-semibold">{dados.empresa} · {dados.forma_pagamento}</p>
                        </span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-emerald-500 text-2xl font-sans font-semibold flex items-center">R${parseFloat(dados.valor_mensal).toFixed(2)}<p className="text-gray-500 font-sans text-sm">/mês</p></span>
                        <p className="text-[14px] font-semibold font-sans text-gray-500">Total: R$ {(parseFloat(dados.valor_mensal) * parseFloat(dados.tempo_contrato)).toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                        <p className="text-gray-500 font-semibold font-sans text-sm">{passados} de {total} meses</p>
                        <p className="text-gray-500 font-semibold font-sans text-sm">{porcentagem}% concluído</p>
                </div>

                <div className="w-full rounded-full h-1.5 bg-gray-200 mt-3">
                    <div 
                    className="bg-emerald-500 rounded-full transition-all duration-500 h-1.5"
                    style={{ width: `${porcentagem}%`}} />
                </div>

            </div>
        )})}
            </section>

        </div>
    )
}

export default Contratos