import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { API_URL } from "../../config/api"
import { BarChart, CartesianGrid, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, PieChart, Cell} from "recharts"

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
    cpf_cliente : string
    valor_mensal : string
    tempo_contrato : string
    forma_pagamento : string
    created_at : string
}

const coresMeses : Record<string, string> = {
    "Jan": "#3b82f6",  // azul
    "Fev": "#8b5cf6",  // violeta
    "Mar": "#ec4899",  // rosa
    "Abr": "#f43f5e",  // vermelho-rosado
    "Mai": "#f97316",  // laranja
    "Jun": "#eab308",  // amarelo
    "Jul": "#84cc16",  // verde-limão
    "Ago": "#10b981",  // verde-esmeralda
    "Set": "#14b8a6",  // turquesa
    "Out": "#06b6d4",  // ciano
    "Nov": "#6366f1",  // índigo
    "Dez": "#a855f7",  // púrpura
}

const coresAleatorias = (): string => {
    const hexadecimal = "0123456789ABCDEF"
    let cor ="#"

    for (let i = 0; i < 6; i++) {
        cor += hexadecimal[Math.floor(Math.random() * 16 )]
    }
    return cor
}


const Dashboards = () => {

    const token = localStorage.getItem("auth_token")
    const [dadosClientes, setDadosCliente] = useState<Cliente[]>([])
    const [dadosContrato, setDadosContrato] = useState<Contrato[]>([])
    
    useEffect( () => {
            const fetch_dados = async() => {
                try {
                    const response = await fetch(`${API_URL}/dados_clientes`, {
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

    const receita_total_mensal = useMemo(() => {
        return dadosContrato.reduce((acumulador, contrato) => {
            return acumulador + parseFloat(contrato.valor_mensal)
        },0)
    },[dadosContrato])

    const receita_total_anual = useMemo(() => {
        return dadosContrato.reduce((acumulador, contrato) => {
            const valor = parseFloat(contrato.valor_mensal)
            const tempo = parseFloat(contrato.tempo_contrato)
            return acumulador + (valor * tempo)
        },0)
    },[dadosContrato])

    
    const cliente_fechados = useMemo(() => {
        return dadosContrato.map(contrato => {
            const cliente = dadosClientes.find(c => c.cpf === contrato.cpf_cliente)
            return {...contrato, ...cliente}
        })
    },[dadosContrato,dadosClientes])


    const contratosAtivosMês = (contrato : Contrato, meses_futuros : number): boolean => {

        const inicio = new Date (contrato.created_at)
        const data = new Date()
        data.setMonth(data.getMonth() + meses_futuros)

        const tempo_decorrido_contrato = (data.getFullYear() - inicio.getFullYear()) * 12 + 
         (data.getMonth() - data.getMonth())

        const duracao = parseInt(contrato.tempo_contrato)

        
        return tempo_decorrido_contrato >= 0 && tempo_decorrido_contrato < duracao
    }

    const dados_projecao_receita = useMemo(() => {

        const meses = ["Jan","Fev","Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

        return Array.from({ length: 6 }, (_ , i) => {

            const dataAlvo = new Date()
            dataAlvo.setMonth(dataAlvo.getMonth() + i)

            const receita_mensal = dadosContrato
            .filter(c => contratosAtivosMês(c, i))
            .reduce((acc, c) => acc + parseFloat(c.valor_mensal), 0)

            return {
                mes: meses[dataAlvo.getMonth()],
                valor : receita_mensal,
                cor_bar : "#0EA5E9"
            }
        })

    },[dadosContrato])
    

    const clientes_prospeccao = dadosClientes.filter(c => 
        c.status === "prospeccao"
    )


    const dados_Pizza = useMemo(() => [      
        { name : "Contratado", value : cliente_fechados.length},
        { name : "Diagnóstico", value : dadosClientes.filter(c => c.status === "diagnostico").length},
        { name : "Negociação", value: dadosClientes.filter(c => c.status === "em_negociacao").length},
        { name : "Prospecção", value : clientes_prospeccao.length},
    ],[dadosContrato,dadosClientes,clientes_prospeccao])

    console.log(dadosClientes)

    const cores = ["#10b981","#f59e0b","#6b7280","#f43f5e"]

    const TooltipPizza = ({active, payload}: any) => {
        if (!active || !payload?.length) return null

        return(
            <div className="bg-gray-900 rounded-lg px-3 py-2 shadow-xl border border-gray-700">
             <p className="text-gray-300 text-xs">{payload[0].name}</p>
             <p className="text-white font-semibold text-sm">
                {payload[0].value} {payload[0].value === 1 ? "cliente" : "clientes"}
            </p>
        </div>
        )
    }

    const TooltipBarras = ({active, payload, label}: any) => {

        if (!active || !payload?.length) return null

        return (
            <div className="bg-gray-900 rounded-lg shadow-lg px-3 py-2">
                <p className="text-xs mb-1 text-gray-300">{label}</p>
                <p className="text-white text-sm font-semibold">
                    R$ {payload[0].value.toLocaleString("pt-BR", {minimumFractionDigits : 2})}
                </p>

            </div>
        )


    }

    const LegendPizza = ({ payload } : any) => {
         return (
        <div className="flex flex-col gap-2 mt-2">
            <h1 className="text-xs text-gray-950 font-sans font-bold">Legenda</h1>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: entry.color }}
                        />
                        <span className="text-xs text-gray-500">{entry.value}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                        {dados_Pizza[index].value}
                    </span>
                </div>
            ))}
        </div>
    )
    }

    const dados_Barra = useMemo(() => {
        return cliente_fechados.map(c => ({
            nome : c.nome?.split(" ")[0] ?? "Cliente",
            valor : parseFloat(c.valor_mensal ?? "0")
        }))
    },[cliente_fechados])

    return(
     <div className="flex flex-col px-24 py-10 mt-2 gap-8">

            <div className="flex flex-col items-start justify-center gap-1">
                <p className="font-serif text-gray-600 font-extralight tracking-widest text-xs uppercase">Área Financeira</p>
                <h2 className="text-3xl font-serif font-bold text-gray-950">Dashboard <span className="text-emerald-500">de Resultados</span></h2>
            </div>

            <div className="flex gap-4 justify-around">

                <div className="flex flex-col gap-2 w-full items-start border rounded-xl bg-stone-100/50 px-4 py-6 border-stone-800/50">
                    <h1 className="font-sans text-sm uppercase tracking-wider text-gray-500">Receita Mensal</h1>
                    <p className="font-sans text-3xl font-semibold text-emerald-500">R$ {receita_total_mensal.toFixed(2)}</p>
                    <p className="font-sans text-sm text-gray-500">↑ {cliente_fechados.length} {cliente_fechados.length > 1 ? "contratos ativos" : "contrato ativo"}</p>
                </div>

                 <div className="flex flex-col gap-2 w-full items-start border rounded-xl bg-stone-100/50 px-4 py-6 border-stone-800/50">
                    <h1 className="font-sans text-sm uppercase tracking-wider text-gray-500">Receita Anual Proj.</h1>
                    <p className="font-sans text-3xl font-semibold text-gray-900">R$ {receita_total_anual.toFixed(2)}</p>
                    <p className="font-sans text-sm text-gray-500">Baseado nos contratos</p>
                </div>

                 <div className="flex flex-col gap-2 w-full items-start border rounded-xl bg-stone-100/50 px-4 py-6 border-stone-800/50">
                    <h1 className="font-sans text-sm uppercase tracking-wider text-gray-500">Clientes Ativos</h1>
                    <p className="font-sans text-3xl font-semibold text-gray-900">{cliente_fechados.length}</p>
                    <p className="font-sans text-sm text-gray-500">{clientes_prospeccao.length} em prospecção</p>
                </div>

                 <div className="flex flex-col gap-2 w-full items-start border rounded-xl bg-stone-100/50 px-4 py-6 border-stone-800/50">
                    <h1 className="font-sans text-sm uppercase tracking-wider text-gray-500">Taxa de Conversão</h1>
                    <p className="font-sans text-3xl font-semibold text-gray-900">{(cliente_fechados.length /(dadosClientes.length) * 100).toFixed(0)}%</p>
                    <p className="font-sans text-sm text-gray-500">{cliente_fechados.length} de {dadosClientes.length} {dadosClientes.length > 1 ? "clientes" : "cliente"}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <div className="basis-2/3 flex flex-col gap-8 bg-stone-100/50 border border-stone-800/50 px-7 py-6 rounded-xl">
                  <h1 className="font-sans text-sm text-gray-900 font-semibold">Receita projetada - próximos 6 meses</h1>
                 
                 <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dados_projecao_receita}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                         dataKey="mes"
                         tick={{fontSize: 11, fill: "#161717"}}
                         tickLine={false}
                         />
                        <YAxis
                          tick={{fontSize: 11, fill: "#161717"}}
                          tickFormatter={(v) => `R$ ${v}`}
                         />
                          
                        <Bar 
                          dataKey="valor" 
                          fill="#10b981"
                          radius={[6,6,0,0]}
                          barSize={40}
                        >
                            {dados_projecao_receita.map((entry, index) => (
                                <Cell key={index} fill={coresMeses[entry.mes] ?? "#10b981"} />
                            ))}
                        </Bar>
                        <Tooltip content={<TooltipBarras />} />
                    </BarChart>
                   </ResponsiveContainer>
                 </div>

                </div>

                <div className="basis-1/3 bg-stone-100/50 border border-stone-800/50 px-8 py-6 rounded-xl">
                 <h1 className="font-sans text-sm text-gray-900 font-semibold text-center">Cliente por Status</h1>

                 <div className="flex flex-col items-start gap-2">

                  <div className="flex items-center justify-center w-full">
                   <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                            data={dados_Pizza}
                            cx="50%"
                            cy="55%"
                            innerRadius={70}
                            outerRadius={105}
                            dataKey="value"
                            >
                            {dados_Pizza.map((_, index) => (
                                <Cell key={index} fill={cores[index]} />
                            ))}
                            </Pie>
                            <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize : "22px", fill : "#111827", fontWeight : "600" }}>
                                {dados_Pizza.reduce((a, c) => a + c.value, 0)}
                            </text>

                            <text 
                            x="50%"
                            y="60%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize : "14px", fill : "#6b7280"}}
                            >
                                {dados_Pizza.reduce((a, c) => a + c.value, 0) > 1 ? "clientes" : "cliente"}
                            </text>

                            <Tooltip 
                            content={<TooltipPizza />}
                            />
                            
                        </PieChart>
                    </ResponsiveContainer>
                  </div>                   
                    <LegendPizza  payload={dados_Pizza.map((d, i) => ({ value: d.name, color: cores[i] }))} />                    
                 </div>
                </div>                
            </div>

            <div className="flex flex-col w-full gap-8 bg-stone-100/50 border border-stone-800/50 px-7 py-6 rounded-xl">
                <h1 className="font-sans text-sm text-gray-900 font-semibold">Contrato- valor mensal por cliente</h1>

                
                   <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dados_Barra}>
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                         dataKey="nome"
                         tick={{fontSize: 11, fill: "#161717"}}
                         tickLine={false}
                         />
                        <YAxis
                          tick={{fontSize: 11, fill: "#161717"}}
                          tickFormatter={(v) => `R$ ${v}`}
                         />
                          
                        <Bar                       
                          dataKey="valor" 
                          fill="#10b981"
                          radius={[6,6,0,0]}
                          barSize={40}>
                            {dados_projecao_receita.map((entry, index) => (
                                <Cell key={index} fill={entry.cor_bar} />
                            ))}
                        </Bar>
                        <Tooltip content={<TooltipBarras />} />
                    </BarChart>
                   </ResponsiveContainer>

                
            </div>
     </div>
        
    )
}

export default Dashboards