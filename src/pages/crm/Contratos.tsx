import { useEffect, useState, useMemo } from "react"
import { API_URL } from "../../config/api"
import { toast } from "sonner"
import { Search } from "lucide-react"

interface Cliente {
    id : string
    nome : string
    cpf : string
    telefone : string
    email : string
    empresa : string
    segmento : string
    cnpj : string
    cep : string
    estado : string
    cidade : string
    endereco : string
    status : string
}

interface Contrato {
    cliente_id : string
    valor_mensal : string
    tempo_contrato : string
    forma_pagamento : string
    created_at : string
}
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
    
    const token = localStorage.getItem("auth_token")
    const [dadosClientes, setDadosCliente] = useState<Cliente[]>([])
    const [dadosContrato, setDadosContrato] = useState<Contrato[]>([])
    const [search, setSearch] = useState("")

    useEffect( () => {
        const fetch_dados = async() => {
            try {
                const response = await fetch(`${API_URL}/clientes_fechados`, {
                    method:"GET",
                    headers: {
                        "Content-Type":"application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data?.detail || "Erro ao buscar dados do cliente")
                } else {
                    setDadosCliente(data.clientes)
                    console.log("Dados dos clientes recebidos")
                    try {
                        const response_contrato = await fetch(`${API_URL}/dados_contrato`, {
                            method:"GET",
                            headers: {
                                "Content-Type":"application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        })

                        const data_contrato = await response_contrato.json()

                        if (!response_contrato.ok) {
                         throw new Error(data_contrato?.detail || "Erro ao buscar dados do contrato")
                        } else {
                            setDadosContrato(data_contrato.contrato)
                            console.log("Dados do contrato recebidos")
                        } 
                    } catch (erro) {
                        console.log(erro)
                    }
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
        <div className="flex flex-col px-24 py-12 mt-2 gap-6">
            <div className="flex flex-col items-start justify-center">
                <p className="font-serif text-xs uppercase tracking-widest text-gray-500">Área Financeira</p>
                <h2 className="text-3xl font-serif font-bold text-gray-950">Contratos <span className="text-emerald-500">Ativos</span></h2>
            </div>

            <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 w-4 h-4 pointer-events-none left-4 text-gray-500" />
                <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder="Digite o nome do cliente"
                className="border border-stone-800 bg-stone-100/50 text-gray-900 font-sans text-sm w-full rounded-xl pl-10 pr-2 py-3 transition-colors focus:outline-none hover:border-emerald-500 focus:border-emerald-500"></input>
            </div>

         {filter_contratos.map((dados)=> {
            const passados = mesesContrato(dados.created_at)
            const total = parseInt(dados.tempo_contrato)
            const porcentagem = total > 0 ? Math.min(Math.round((passados / total) * 100), 100) : 0


            return (
            <div key={dados.cliente_id} className="flex flex-col border-[1.5px] border-stone-800/50 rounded-xl  bg-stone-100/50 px-6 py-8 hover:-translate-y-1 shadow-xl hover:border-emerald-500 shadow-stone-400/20">
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

        </div>
    )
}

export default Contratos