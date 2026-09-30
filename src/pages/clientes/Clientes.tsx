import { useState, useEffect } from "react";
import { API_URL } from "../../config/api";
import { toast } from "sonner";
import { Edit, Delete, Search, X} from "lucide-react";
import { formatarCNPJ, formatarCPF, formatarTelefone } from "../../utils/mascaras";
import {useNavigate } from "react-router-dom";

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

const iniciais = (nome : string) => {
    return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}

const segmentos: Record<string, string> = {
    "Varejo" : "bg-emerald-500/20 text-emerald-600",
    "Tecnologia" : "bg-blue-500/20 text-blue-600",
    "Saúde" : "bg-yellow-500/20 text-yellow-600",
}

const badge : Record<string, string> = {
 "contratado" : "bg-emerald-500/20 text-emerald-600 border-emerald-500",
 "diagnostico" : "bg-yellow-500/20 text-yellow-600 border-yellow-500",
 "em_negociacao": "bg-blue-500/20 text-blue-600 border-blue-600",
 "prospeccao" : "bg-red-500/20 text-red-600 border-red-600"
}

const colorPattern = "bg-gray-600/20 text-gray-800"

const Clientes = () => {

    const [dataClient, setDataClient] = useState<Cliente[]>([])
    const [filtroStatus, setFiltroStatus] = useState<string>("todos")
    const token = localStorage.getItem("auth_token")
    const [busca, setBusca] = useState("")
    const [modal, setModal] = useState(false)
    const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null)
    const handleQuestionario = (cliente_id : string, status : string, empresa : string) => {
        if (status === "contratado" || status === "diagnostico") {
            navigate(`/clientes/form/${encodeURIComponent(empresa)}/gestao`)
            return
        } 

        if (status === "em_negociacao") {
            const dados = JSON.parse(localStorage.getItem(`Questionario${empresa}`) 
            ?? JSON.stringify({pilaresLiberados : [], respostas : {}}))

            localStorage.setItem(`Cliente_id${empresa}`, cliente_id)

            dados.pilaresLiberados = [... new Set([...dados.pilaresLiberados, 1,2,3,4,5,6,7])]

            localStorage.setItem(`Questionario${empresa}`, JSON.stringify(dados))
            navigate(`/clientes/form/${encodeURIComponent(empresa)}/gestao`)
        }
    }

    const handleCliente = async (cliente_id : string) => {
        try {
            const response_update = await fetch(`${API_URL}/status_cliente/${cliente_id}`, {
                method:"PATCH",
                headers: {   
                    "Authorization" : `Bearer ${token}`,
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({status : "em_negociacao"})
            })

            if (!response_update.ok) {
                const data = await response_update.json()
                throw new Error(data?.detail || "Erro ao atualizar status do cliente")
            } else {
                console.log("Cliente atualizado com sucesso")
                setDataClient(prev => prev.map((p) => p.id === cliente_id ? {...p, status : "em_negociacao"} : p))
                toast.success("Questionário Disponível")
            }
        } catch (erro) {
            console.log(erro instanceof Error ? erro.message : "Erro interno ao atualizar status do cliente")
        }
    } 
    const navigate = useNavigate()

    useEffect( () => {
        const fetchDataClientes = async () => {

         try {
            const response = await fetch(`${API_URL}/dados_clientes`, {
                method:"GET",
                headers:{
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
             }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.detail || "Erro ao buscar dados no supabase")
            } else {
                console.log("Dados de clientes carregados!")
                setDataClient(data.clientes)
            }
         } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro Interno no Sistema")
         } 
        }
        fetchDataClientes()}, [])

    const clientesFiltrados = dataClient.filter(c => 
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.empresa.toLowerCase().includes(busca.toLowerCase())
    )
    .filter(c => filtroStatus === "todos" || c.status === filtroStatus)

    const handleDelete = async(cliente_id : string) => {

        try {
            const response = await fetch(`${API_URL}/clientes/${cliente_id}`, {
                method:"DELETE",
                headers:{"Authorization" : `Bearer ${token}`}
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data?.detail || "Erro interno ao deletar cliente")
            }
            else {
                toast.success("Cliente Deletado com Sucesso")
                setDataClient(prev => prev.filter(c => c.id !== cliente_id ))
            }
        } catch (erro) {
            toast.error(erro instanceof Error ? erro.message : "Erro interno no Sistema")
        }
    }

    const handleEdit = (cliente : Cliente) => {
        setClienteEdit(cliente)
        setModal(true)
    }

    const fecharModal = () => {
        setModal(false)
        setClienteEdit(null)
    }

    const handleSave = async() => {
        if (!clienteEdit) return;

        const endereco = `${clienteEdit?.endereco.split(" - ")[0] ?? ""} - ${clienteEdit?.endereco.split(" - ")[1] ?? ""} - ${clienteEdit?.endereco.split(" - ")[2] ?? ""}`

        const payload = {
                nome : clienteEdit.nome,
                cpf : clienteEdit.cpf,
                telefone : clienteEdit.telefone,
                email : clienteEdit.email,
                empresa : clienteEdit.empresa,
                segmento : clienteEdit.segmento,
                cnpj : clienteEdit.cnpj,
                cep : clienteEdit.cep,
                estado : clienteEdit.estado,
                cidade : clienteEdit.cidade,
                endereco : endereco,
        }

        try {
            const response = await fetch(`${API_URL}/update_cliente/${clienteEdit.id}`, {
                method : "PUT",

                headers : {
                    "Authorization" : `Bearer ${token}`,
                    "Content-Type" : "application/json"
                },

                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data?.detail || "Erro ao atualizar dados no banco")
            }

            else {
                setDataClient(prev => prev.map(c => c.id === clienteEdit.id ? {...c, ...payload} : c))
                toast.success("Dados atualizados com sucesso")
                fecharModal()
            }
        } catch (error) {
            console.log(error)
            toast.error(error instanceof Error ? error.message : "Erro interno do sistema")
        }
    }

   
    return (
    <div className="flex flex-col px-24 py-10 mt-2">

        <p className="font-extralight font-serif tracking-widest text-xs mb-1">Controladoria Estratégica</p>

        <div className="flex items-center gap-48">
         <h1 className="text-gray-950 font-bold font-serif text-3xl">Clientes <strong className="text-emerald-500">cadastrados</strong></h1>
        </div>
        
        <div className="relative mt-8">
         <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-700" />
         <input value={busca} onChange={(e) => setBusca(e.target.value)} className=" w-full pl-10 pr-4 py-3  border border-gray-400 rounded-xl bg-gray-100 text-sm hover:border-emerald-800 transition-colors focus:outline-none focus:border-emerald-600" type="text" placeholder="Busque por nome do cliente ou por nome da empresa..."></input>
        </div>
       
       <div className="flex justify-between mt-3 items-center">
            <div className="flex gap-2 ">
                {[
                    { valor : "todos", label : "Todos"},
                    { valor : "prospeccao", label : "Prospecção"},
                    { valor : "em_negociacao", label : "Negociação"},
                    { valor : "diagnostico" , label : "Diagnóstico"},
                    { valor : "contratado", label : "Contratado"},
                ].map(filtro => (
                    <button key={filtro.valor} onClick={() => setFiltroStatus(filtro.valor)}
                    className={`text-xs py-1.5 px-3 rounded-full border transition-colors  ${filtro.valor === filtroStatus
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:border-emerald-400"
                    }`}>
                        {filtro.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center border border-1 rounded-full border-gray-800  bg-gray-100">
              <span className="text-xs font-sans text-gray-900 font-semibold px-4 ">
                {dataClient.length} {dataClient.length === 1 ? "cliente" : "clientes"}
               </span>
            </div>
        </div>


        <div className="grid grid-cols-2 gap-8 mt-6">  
         {clientesFiltrados.map((dados) => (
           <div key={dados.cpf} className="px-4 py-3 flex flex-col justify-around border rounded-lg border-gray-900 bg-gray-100 transition-all hover:translate-y-1 shadow-lg hover:shadow-gray-500">              
            
            <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">

             <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${segmentos[dados.segmento] ?? colorPattern}`}>
               <span className="font-sans text-sm  font-semibold">{iniciais(dados.nome)}</span>
             </div>
             <div className="flex flex-col items-start">
                <p className="font-serif text-gray-950 text-sm"><strong></strong>{dados.nome}</p>
                <p className="font-sans text-gray-500 text-xs"><strong></strong>{dados.cpf}</p>
             </div>   

            </div>

            <span className={`rounded-full border font-semibold shadow-lg shadow-gray-400/50 -translate-y-2 px-4 py-1 text-sans text-[10px] ${badge[dados.status]} `}>
            {dados.status === "prospeccao" ? "Prospecção" : dados.status === "em_negociacao" ? "Negociação" :
             dados.status === "diagnostico" ? "Diagnóstico" : "Contratado" }
            </span>
            </div>

            <div className="border-b border-gray-800 border-0 mt-3 mb-3" />
            
            <div className="flex flex-col gap-2">
                <p className="font-serif text-xs">Dados Pessoais</p>

                <div className="grid grid-row-2 gap-3">
                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">Estado</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.estado}</p>
                </div>

                <div className="flex justify-between items-center">
                    <p className="font-sans text-gray-500 text-xs">Cidade</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.cidade}</p>
                </div>

                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">Telefone</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.telefone}</p>
                </div>

                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">Email</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.email}</p>
                </div>

                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">CEP</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.cep}</p>
                </div>

                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">Endereço</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.endereco}</p>
                </div>
                </div>
            </div>

            <div className="border-b border-gray-800 border-0 mt-3 mb-3" />
                        
            <div className="flex flex-col gap-2">
                <p className="font-serif text-xs">Dados Empresariais</p>
                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">Empresa</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.empresa}</p>
                </div>

                <div className="flex justify-between items-center">
                    <p className="font-sans text-gray-500 text-xs">Segmento</p>
                    <p className={`font-sans border rounded-xl px-2 py-1 font-semibold text-xs ${segmentos[dados.segmento] ?? colorPattern}`}>{dados.segmento}</p>
                </div>

                <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">CNPJ</p>
                    <p className="font-sans text-gray-900 font-semibold text-xs">{dados.cnpj}</p>
                </div>
            </div>

            <div className="border-b border-gray-800 border-0 mt-3 mb-3" />
            {dados.status === 'prospeccao' && (
              <div className="flex flex-col gap-2">
                 <p className="font-serif text-xs">Reunião de Planejamento</p>
                 
                 <div className="flex justify-between">
                    <p className="font-sans text-gray-500 text-xs">Ações</p>
                    <button 
                    className="hover:bg-emerald-800 text-emerald-800 border-emerald-800 hover:text-white font-sans  font-semibold text-[11px] rounded-lg flex justify-center items-center border px-5"
                    onClick={() =>handleCliente(dados.empresa) }>
                        Iniciar Consultoria</button>
                 </div>
              </div>
            )}

            <div className={`${dados.status === "diagnostico" ? "grid grid-cols-2 gap-3" :
                               dados.status === "contratado" ? "grid grid-cols-2 items-center gap-3" : "flex justify-around gap-4"} mt-3`}>
                {(dados.status === 'em_negociacao' || dados.status === 'diagnostico' || dados.status === 'contratado') && (              
                    <button onClick={() => {
                           handleQuestionario(dados.id, dados.status, dados.empresa)
                        }} 
                         className="flex items-center justify-center hover:bg-emerald-800 text-emerald-800 hover:text-white gap-2 border rounded-lg border-emerald-800 px-8 w-full ">            
                         <Edit className="w-3 h-3" />
                         <p className="font-sans text-sm">Questionário</p>
                    </button>
                )}

                {(dados.status === 'diagnostico' || dados.status === 'contratado')  && (

                    <button onClick={() => {
                            navigate(`/clientes/${encodeURIComponent(dados.id)}/${encodeURIComponent(dados.empresa)}/diagnostico/geral`)
                    }} 
                         className="flex items-center justify-center hover:bg-yellow-800 text-yellow-800 hover:text-white gap-2 border rounded-lg border-yellow-800 px-8 w-full ">            
                         <Edit className="w-3 h-3" />
                         <p className="font-sans text-sm">Diagnóstico</p>
                    </button>
                )}

                {dados.status === 'contratado' && (

                    <button onClick={() => {
                            navigate("/financeiro/pipeline")
                    }} 
                         className="flex items-center justify-center hover:bg-sky-800 text-sky-800 hover:text-white gap-2 border rounded-lg border-sky-800 px-8 w-full ">            
                         <Edit className="w-3 h-3" />
                         <p className="font-sans text-sm">Checar Contrato</p>
                    </button>
                )}

                <button onClick={() => handleEdit(dados)} className="flex items-center justify-center hover:bg-gray-800 text-gray-800 hover:text-white gap-2 border rounded-lg border-gray-800 px-8 w-full ">
                            <Edit className="w-3 h-3" />
                            <p className="font-sans text-sm">Editar</p>
                </button>

                <button onClick={() => handleDelete(dados.id)}   className="flex items-center justify-center gap-2 hover:bg-red-800 text-red-800 hover:text-white border rounded-lg border-red-800 px-8 w-full ">
                            <Delete className="w-3 h-3" />
                            <p className="font-sans text-sm">Excluir</p>
                </button>
            </div>

         </div>
            ))}
        </div>
     
     {modal &&  (
        <div className="fixed inset-0 bg-black/70 z-50 p-6 flex items-center justify-center">

            <div className="bg-emerald-500 rounded-lg w-full max-w-2xl flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl">

                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                    <div className="py-4 px-2 flex flex-col gap-0 items-start mx-2">
                        <h1 className="font-sans text-gray-100 text-base font-bold">Editar Cliente</h1>
                        <p className="font-sans text-gray-200 text-xs">Ronald Assis</p>
                    </div>

                    <button onClick={fecharModal}><X className="h-7 w-7 hover:text-white text-gray-200 bg-gray-100/10 p-1 rounded-lg mx-4 hover:bg-gray-100/50 transition-colors " /></button>

                </div>

                <div className="bg-gray-100 overflow-y-auto max-h-[75vh] px-12 py-6 rounded-b-xl">
                

                    <p className=" mt-4 text-xs text-gray-800 uppercase tracking-widest mb-4 pb-2 border-b border-gray-700">Informações Pessoais</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="nome">Nome Completo</label>
                        <input className="rounded-lg text-sm bg-stone-200/30 border border-gray-950 px-3 py-2 text-gray-700 placeholder-gray-600 focus:outline-none
                        focus:border-emerald-400" type="text" placeholder="João Mendes" id="nome" value={clienteEdit?.nome ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, nome: e.target.value}) : prev)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="cpf">CPF</label>
                        <input className="rounded-lg text-sm bg-stone-200/30 border border-gray-950 px-3 py-2 text-gray-700
                        placeholder-gray-600 focus:outline-none focus:border-emerald-400" type="text" placeholder="000.000.000-00" id="cpf" value={clienteEdit?.cpf ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, cpf : formatarCPF(e.target.value)}) : prev)} ></input>
                        </div>

                        <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="telefone">Telefone</label>
                        <input className="rounded-lg text-sm bg-stone-200/30 border border-gray-950 px-3 py-2 text-gray-700
                        placeholder-gray-600 focus:outline-none focus:border-emerald-400" type="text" placeholder="(00) 00000-0000" id="telefone" value={clienteEdit?.telefone ?? ""} onChange={(e) => setClienteEdit(prev => prev ?({ ...prev, telefone : formatarTelefone(e.target.value)}) : prev)}></input>
                        </div>
                        <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="telefone">Email</label>
                        <input className="rounded-lg text-sm bg-stone-200/30 border border-gray-950 px-3 py-2 text-gray-700
                        placeholder-gray-600 focus:outline-none focus:border-emerald-400" type="text" placeholder="nome@email.com" id="email" value={clienteEdit?.email ?? ""}  onChange={(e) => setClienteEdit(prev => prev ?({ ...prev, email : e.target.value}) : prev)}></input>
                        </div>
                    </div>


                    <div className="border-t border-gray-950 mb-7" />
                    
                    <p className="text-xs text-gray-800 uppercase tracking-widest mb-4 pb-2 border-b border-gray-950">
                        Dados Empresariais
                        </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="empresa">Nome da Empresa</label>
                                <input type="text" placeholder="Empresa Ltda" id="empresa" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.empresa ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, empresa : e.target.value}) : prev)}></input>
                            </div>
                        
    
        
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">CNPJ da Empresa</label>
                                <input type="text" placeholder="00.000.000/0000-00" id="cnpj" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.cnpj ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, cnpj : formatarCNPJ(e.target.value)}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Segmento da Empresa</label>
                                <input type="text" placeholder="Varejo" id="cnpj" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.segmento ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, segmento : e.target.value}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">CEP</label>
                                <input type="text" placeholder="87200-242" id="cep" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.cep ?? ""}   onChange={(e) => setClienteEdit( prev => prev ? ({ ...prev, cep : e.target.value}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Estado</label>
                                <input type="text" placeholder="Paraná" id="estado" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.estado ?? ""}   onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, estado : e.target.value}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Cidade</label>
                                <input type="text" placeholder="Cianorte" id="cidade" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.cidade ?? ""}  onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, cidade : e.target.value}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Rua</label>
                                <input type="text" placeholder="Rua Álvares " id="rua" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.endereco.split(" - ")[0] ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, endereco : e.target.value}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Número</label>
                                <input type="text" placeholder="750" id="numero" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.endereco.split(" - ")[1] ?? ""} onChange={(e) => setClienteEdit(prev => prev ? ({ ...prev, endereco : e.target.value}) : prev)}></input>
                            </div>
    
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Complemento</label>
                                <input type="text" placeholder="Apartamento 30" id="complemento" className="bg-stone-200/30 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                                placeholder-gray-600 focus:outline-none focus:border-emerald-400" value={clienteEdit?.endereco.split(" - ")[2] ?? ""} onChange={(e) => setClienteEdit(prev => prev ?({ ...prev, endereco : e.target.value}) : prev)}></input>
                            </div>

                    </div>

                    <div className="flex gap-2 mb-3">
                     <button onClick={handleSave} className="basis-2/3 py-1 border rounded-lg  hover:text-white hover:bg-emerald-600 text-sm font-serif bg-emerald-500 transition-colors">Salvar</button>
                     <button onClick={fecharModal} className="basis-1/3 border rounded-lg text-sm bg-gray-200 hover:text-white hover:bg-gray-400 transition-colors font-serif ">Cancelar</button>
                    </div>
                
            </div>

          </div>
        </div>
      )}
    </div>    
    )
}

export default Clientes