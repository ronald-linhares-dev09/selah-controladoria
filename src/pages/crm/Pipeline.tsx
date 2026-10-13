import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Handshake, Landmark, Phone, Search, X } from "lucide-react"
import { atualizar_status_cliente, lista_clientes} from "../../services/clientes"
import type { Cliente } from "../../schemas/clientes"
import type { Contrato } from "../../schemas/contratos"
import { criar_contrato, deletar_contrato, obter_contrato } from "../../services/contratos"


const iniciais = (nome : string) =>{
    return nome.split(" ").slice(0,2).map(n => n[0]).join("")
}

const categorias : Record<string,string> = {
    "Varejo" : "bg-emerald-500/20 text-emerald-600",
    "Tecnologia" : "bg-blue-500/20 text-blue-600",
    "Saúde" : "bg-yellow-500/20 text-yellow-600",
}

const backgroundPattern = "bg-gray-600/20 text-gray-600"

const pagamento = ["Cartão de Crédito", "Cartão de Débito", "Pix", "Dinheiro"]


const Pipeline = () => {

    const [dadosCliente, setDadosCliente] = useState<Cliente[]>([])
    const [search, setSearch] = useState("")
    const [modal, setModal] = useState(false)
    const [clienteSelect, setClienteSelect] = useState<Cliente | null>(null)
    const [contrato, setContrato] = useState<Contrato | null>(null)
    const [dadosContrato, setDadosContrato] = useState<Contrato[]>([])
    const [statusCliente, setStatusCliente] = useState("todos")
 
    const data_client = async () => {
        try {
            const data = await lista_clientes()
            setDadosCliente(data)
            try {
                const contratos = await obter_contrato()
                    
                setDadosContrato(contratos)
                    
            } catch (erro) {
                console.error(erro)
            }
       } catch (erro) {
        toast.error(erro instanceof Error ? erro.message : "Erro interno ao buscar clientes/contratos")
       }
    }

    useEffect( () => { data_client() },[])


    const clientes_filtrados = dadosCliente.filter(c => 
        statusCliente === 'todos' ? c.status === "diagnostico" || c.status === "contratado" : c.status === statusCliente)
        .filter(c => 
            c.nome.toLowerCase().includes(search.toLocaleLowerCase()) ||
            c.empresa.toLowerCase().includes(search.toLocaleLowerCase()))
    
    const clientes_fechados = dadosCliente.filter(c => 
        c.status === "contratado")
        

    const clientes_diagnosticados = dadosCliente.filter( c => 
        c.status === "diagnostico")

    const handleContratos = async (cliente : Cliente, contrato : Contrato[]) => {
        setClienteSelect(cliente)

        const contrato_cliente = contrato.find((contrato_) => contrato_.cliente_id === cliente.id)
        setContrato({
            cliente_id: contrato_cliente?.cliente_id ?? "",
            valor_mensal : contrato_cliente?.valor_mensal ?? "",
            forma_pagamento: contrato_cliente?.forma_pagamento ?? "",
            tempo_contrato : contrato_cliente?.tempo_contrato ?? ""
        })
        setModal(true)
    }

    const receita_total = (
        parseFloat(contrato?.valor_mensal || "0") *
        parseFloat(contrato?.tempo_contrato || "0")
    ).toLocaleString("pt-BR", {minimumFractionDigits : 2})

    const valor_total_mensal = useMemo(()=> {
        return dadosContrato.reduce((acumulador, contrato) => {
            return acumulador + parseFloat(contrato.valor_mensal)
        },0)
    },[dadosContrato])

    const fecharmodal = () => {
        setModal(false)
        setClienteSelect(null)
    }

    const deleteContrato = async(cliente_id : string ) => {
        try {
            await deletar_contrato(cliente_id)

            toast.success("Contrato deletado com sucesso")
            try {
                await atualizar_status_cliente(cliente_id,'diagnostico')
                console.log("Status atualizado com sucesso")
                
            } catch (erro) {
                console.log(erro instanceof Error ? erro.message : "Erro ao atualizar status do cliente")
            }
            await data_client()
        } catch (erro) {
            console.log(erro instanceof Error ? erro.message : "Erro ao deletar contrato")
            toast.error("Contrato não deletado")
        }
    }

    const fecharContrato = async() => {

        setClienteSelect((prev) => prev ? ({           
                ...prev,
                status : "contratado"            
        }): prev)

        const contrato_fechado : Contrato = {
            "cliente_id": clienteSelect?.id ?? "",
            "valor_mensal": contrato?.valor_mensal ?? "",
            "forma_pagamento": contrato?.forma_pagamento ?? "",
            "tempo_contrato": contrato?.tempo_contrato ?? "",
        }
        try {
            await criar_contrato(contrato_fechado)
            toast.success("Contrato criado")
            try {
                console.log("Status atualizado")
            } catch (erro) {
                console.log(erro)
            }
            fecharmodal()
            await data_client()         
        } catch (erro) {
            console.log(erro)
            toast.error(erro instanceof Error ? erro.message : "Erro interno no sistema")
        }    
    }

    return(
        <div className="flex flex-col w-full">

            <div className="flex flex-col items-start justify-center px-10 pt-10 pb-7 gap-1">
                <p className="font-bold uppercase text-gray-500 font-serif tracking-widest text-[10px]">Área Financeira</p>
                <h1 className="font-semibold text-gray-900 font-serif text-3xl">Pipeline<strong className="text-emerald-400"> de Vendas</strong></h1>
            </div>

        <section className="bg-gray-100 px-10 py-6 flex flex-col gap-4 h-screen min-h-screen flex-1">
            <div className="flex gap-4">
                <div className="flex flex-col items-start justify-center border border-gray-400 bg-white  rounded-lg w-full  py-7 px-4">
                 <p className="text-gray-500 uppercase tracking-widest font-semibold text-xs mb-1">Em Negociação</p>
                 <h1 className="text-gray-900 text-3xl font-sans font-bold">{clientes_diagnosticados.length}</h1>
                </div>

                <div className="flex flex-col items-start justify-center border border-gray-400 bg-white rounded-lg w-full  py-7 px-4">
                 <p className="text-gray-500 uppercase tracking-widest font-semibold text-xs mb-1">Receita Potencial</p>
                 <h1 className="text-emerald-500 text-3xl font-sans font-bold">R${valor_total_mensal.toFixed(2)}</h1>

                </div>

                <div className="flex flex-col items-start justify-center border border-gray-400 bg-white  rounded-lg w-full  py-7 px-4">
                 <p className="text-gray-500 uppercase tracking-widest font-semibold text-xs mb-1">Fechados no Mês</p>
                 <h1 className="text-gray-900 text-3xl font-sans font-bold">{clientes_fechados.length}</h1>
                </div>
            </div>       

            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm text-gray-900 w-full pl-10 pr-4 py-3 focus:outline-none bg-white border border-gray-600 hover:border-emerald-500 focus:border-emerald-500 transition-colors rounded-xl" type="text" placeholder="Digite o nome do cliente ou da empresa..."></input>
            </div>

            <div className="flex gap-2 ">
                {[
                    { valor : "todos", label : "Todos"},
                    { valor : "diagnostico", label : "Diagnóstico"},
                    { valor : "contratado", label : "Contratado"}
                ].map((filtro) => (
                    <button key={filtro.valor} onClick={() => setStatusCliente(filtro.valor)}
                     className={`text-xs py-1.5 px-3 rounded-full border transition-colors
                        ${filtro.valor === statusCliente ? "bg-emerald-500 text-white border-emerald-500" 
                            : "text-gray-600 border-gray-300 bg-white hover:border-emerald-500 "}
                            `}>
                        {filtro.label}
                    </button>
                ))}
            </div>                 

            <div className="flex flex-col gap-4">
                {clientes_filtrados.map((dados) => (
                    <div className="flex items-center justify-between w-full gap-4 rounded-2xl border border-gray-600 hover:shadow-gray-200 hover:border-emerald-700 bg-white  py-5 px-6 ">
                        
                        <div className="flex items-center gap-4">
                            <div className={`rounded-full flex-shrink-0 py-5 flex items-center justify-center w-12 h-12 ${categorias[dados.segmento] ?? backgroundPattern}`}>
                                <span className="font-semibold font-sans text-sm">{iniciais(dados.nome)}</span>
                            </div>
                            
                            <div className="flex flex-col items-start gap-1">
                                <h1 className="font-serif text-gray-900 text-base font-medium">{dados.nome}</h1>
                                <span className="flex items-center gap-2 font-sans text-gray-400 text-xs font-normal">
                                    <Landmark className="w-3 h-3 text-gray-800" />
                                    {dados.empresa}
                                    </span>
                                <span className="flex items-center gap-2 font-sans text-gray-400 text-xs font-normal">
                                    <Phone className="w-3 h-3 text-gray-800" />
                                    {dados.telefone}
                                    </span>
                            </div>
                        </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button onClick={() =>                            
                                handleContratos(dados, dadosContrato)                           
                        } className="flex items-center gap-1 justify-around text-white bg-emerald-500 px-4 py-2 rounded-xl font-sans font-medium text-xs hover:bg-emerald-700">
                            <Handshake  className="w-4 h-4 text-white" />
                            {dados.status === "diagnostico" ? "Fechar Contrato" : "Editar Contrato"}
                        </button>
                     {dados.status === "contratado" && (
                        <button onClick={() => deleteContrato(dados.id)} className="flex items-center gap-1 justify-around text-white bg-gray-800 px-4 py-2 rounded-xl font-sans font-medium text-xs hover:bg-gray-900">
                            <X className="w-4 h-4 text-white" />
                            Excluir Contrato
                        </button>
                      )}
                    </div>

                    </div>
                    
                ))}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-12">

                    <div className="rounded-xl bg-emerald-500 border-b border-white overflow-y-auto w-full max-w-xl shadow-xl flex flex-col">
                        
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex flex-col justify-start">
                            <h1 className="text-[12px] font-sans uppercase font-medium text-gray-300">Edição de Contratos</h1>
                            <p className="text-xl font-sans font-semibold text-gray-100">{clienteSelect?.nome}</p>
                            </div>

                            <button onClick={fecharmodal} className=" bg-gray-300/30 text-gray-100 px-1 py-1 rounded-full hover:bg-gray-300/50 hover:text-white">
                                <X className="w-5 h-5" />
                                </button> 


                        </div>


                        <div className="flex flex-col bg-white px-8 py-2">

                         
                         <div className="flex justify-between px-4 py-4 bg-stone-200/50 border-stone-300 rounded-xl border mt-6">
                           <span className=" flex items-center gap-2 font-sans text-lg  text-gray-950 font-semibold">
                            <Landmark className="w-4 h-4" />
                            {clienteSelect?.empresa}
                            </span>
                           <p className={`font-sans uppercase text-[9px] rounded-full px-2 py-1 flex items-center font-bold ${categorias[clienteSelect?.segmento ?? ""] ?? backgroundPattern}`}>{clienteSelect?.segmento}</p>
                         </div>
                            
                            <div className="flex gap-3">
                                <div className="flex flex-col items-start mt-6 w-full">
                                    <label className="mb-2 font-sans text-xs font-medium uppercase tracking-widest text-gray-500">Valor Mensal (R$)</label>
                                    <input placeholder="0,00" min={0} step={0.01} type="number" value={contrato?.valor_mensal} onChange={(e) => setContrato(prev => prev ? ({...prev, valor_mensal : e.target.value}): prev)} className="px-3 py-2 bg-stone-100/50 border border-stone-300 w-full rounded-lg focus:outline-none"></input>
                                </div>

                                <div className="flex flex-col items-start mt-6 w-full">
                                    <label className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">Duração (Mensal)</label>
                                    <input type="number" step={1} min={1} placeholder="1" value={contrato?.tempo_contrato} onChange={(e) => setContrato(prev => prev ? ({...prev, tempo_contrato : e.target.value}): prev)} className="px-3 py-2 bg-stone-100/50 border border-stone-300 w-full rounded-lg focus:outline-none"></input>
                                </div>
                            </div>

                            <div className="flex flex-col items-start mt-6">
                                <label className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">Forma de Pagamento</label>
                                <select value={contrato?.forma_pagamento} onChange={(e) => setContrato(prev => prev ? ({...prev, forma_pagamento : e.target.value}) : prev)} className="w-full focus:outline-none bg-stone-100/50 px-4 py-3 rounded-lg border border-stone-300 font-sans text-xs font-medium tracking-widest">
                                    {pagamento.map((forma) => 
                                    <option key={forma} value={forma} >{forma}</option>
                                )}
                                </select>
                            </div>
                        

                         <div className="flex flex-col px-3 py-3 bg-stone-200/50 border-stone-300 rounded-xl border gap-1 mt-6">
                           <p className="font-sans uppercase text-sm  text-stone-600">Receita Total do Contrato</p>
                            <div className="flex justify-between">
                                <span className="text-xl font-bold font-sans text-emerald-500">R${receita_total}</span>
                                <div className="flex flex-col">
                                <p className="text-xs font-sans text-stone-600">R${contrato?.valor_mensal} durante</p>
                                <p className="text-xs font-sans text-stone-600">{contrato?.tempo_contrato === "" ? "" : contrato?.tempo_contrato} {contrato?.tempo_contrato === "1" ? "mês" : contrato?.tempo_contrato === "0" ?  "" : "meses"}</p>
                                </div>
                            </div>
                         </div>

                        <div className="flex gap-2 mt-6 mb-3">
                            <button className="basis-1/3 border rounded-lg text-sm bg-stone-100/50 hover:bg-stone-100/80 transition-colors font-sans "  onClick={fecharmodal}>Cancelar</button>
                            <button onClick={fecharContrato} className=" basis-2/3 py-2 font-semibold border rounded-lg text-white hover:bg-emerald-500 text-sm font-sans bg-emerald-400 transition-colors">Salvar Dados</button>
                         </div>

                        </div>

                    </div>


                </div>
            )}


            
         </section>
        </div>
    )
}

export default Pipeline