import { useParams } from "react-router-dom";
import { API_URL } from "../../config/api";

import { useEffect, useState } from "react";
import { useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";

type Notas = Record<string, {nota : number}>

const parcial_total = [
  { number : "1", max : 440, nome : "Gestão Estratégica"}, 
  { number : "2", max : 570, nome : "Financeiro"}, 
  { number : "3", max : 570, nome : "Comercial"},
  { number : "4", max : 560, nome : "Operações e Processos"}, 
  { number : "5", max : 510, nome : "Pessoas"}, 
  { number : "6", max : 580, nome : "Clientes e Experiência"}, 
  { number : "7", max : 530, nome : "Tecnologia" }
]

const pilares_Pattern : Record<string, string> = {
    "Gestão Estratégica" : "bg-emerald-500 ",
    "Financeiro" : "bg-blue-500",
    "Comercial" : "bg-yellow-500",
    "Operações e Processos" : "bg-red-500",
    "Pessoas" : "bg-gray-500",
    "Clientes e Experiência" : "bg-teal-500",
    "Tecnologia" : "bg-indigo-500"
}

const progresso : Record<string, string> = {
    "Gestão Estratégica" : "text-emerald-600",
    "Financeiro" : "text-blue-600",
    "Comercial" : "text-yellow-600",
    "Operações e Processos" : "text-red-600",
    "Pessoas" : "text-gray-600",
    "Clientes e Experiência" : "text-teal-600",
    "Tecnologia" : "text-indigo-600"
}

const border : Record<string, string> = {
    "Gestão Estratégica" : "border-t-emerald-600",
    "Financeiro" : "border-t-blue-600",
    "Comercial" : "border-t-yellow-600",
    "Operações e Processos" : "border-t-red-600",
    "Pessoas" : "border-t-gray-600",
    "Clientes e Experiência" : "border-t-teal-600",
    "Tecnologia" : "border-t-indigo-600"
}

const conexao_diff : Record<string, string> = {
    "Saudável" : "text-emerald-700 ",
    "Em Atenção" : "text-yellow-700 ",
    "Crítica" : "text-orange-700 ",
    "Rompida" : "text-red-700",
}

const classificacao_ics : Record<string, string> = {
    "Saudável" : "text-emerald-700 bg-emerald-500/20",
    "Em Atenção" : "text-yellow-700 bg-yellow-500/20",
    "Crítica" : "text-orange-700 bg-orange-500/20",
    "Rompida" : "text-red-700 bg-red-500/20",
    
}

const classificacao_ics_border : Record<string, string> = {
    "Saudável" : "border-t-emerald-700",
    "Em Atenção" : "border-t-yellow-700",
    "Crítica" : "border-t-orange-700",
    "Rompida" : "border-t-red-700"   
}

const conexoes = [
    {pilar : "Gestão Estratégica", conexao : ["Financeiro", "Pessoas", "Comercial"]},
    {pilar : "Financeiro", conexao : ["Comercial", "Operações e Processos"]},
    {pilar : "Comercial", conexao : ["Clientes e Experiência"]},
    {pilar : "Operações e Processos", conexao : ["Clientes e Experiência", "Pessoas"]},
    {pilar : "Tecnologia", conexao : ["Gestão Estratégica", "Financeiro", "Comercial", "Operações e Processos", "Pessoas", "Clientes e Experiência"]}
]


const DiagnosticoIndividual = () => {
    const { empresa } = useParams()
    const token = localStorage.getItem("auth_token")
    const [notas, setNotas] = useState<Notas>({})


    useEffect(() => {
        const handleNotas = async () => {
          try {
            const response = await fetch(`${API_URL}/notas_questionario/${empresa}`, {
                method:"GET",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error (data?.detail || "Erro ao buscar notas dos pilares")
            } else {
                const data = await response.json()
                setNotas(data.notas)
                console.log("Notas importadas com sucesso")
            }
          } catch (erro) {
             console.log(erro instanceof Error ? erro.message : "Erro interno ao buscar notas")
          }
        }
    handleNotas()},[])

    const indicador = useMemo(() => { return parcial_total.reduce((acc, pilar) => { 
            const valor = Math.min(Math.round(notas[pilar.number]?.nota / pilar.max * 100),100)
            return {...acc , [pilar.nome] : valor}
    },{} as Record<string, number>)},[notas])


    const classificarIMS = (ims : number) => {
       if ( ims >= 21 && ims <= 40) {
        return "Fragilizado"

       } else if ( ims >= 41 && ims <= 60) {
        return "Em Estruturação"

       } else if ( ims >= 61 && ims <= 80 ) {
        return "Gerenciado"

       } else if ( ims >= 81 && ims <= 100) {
        return "Maduro"
       } else {
        return "Crítico"
       }                   
    }



    const classificarICS = (pilar : number, conexao : number) => {
        let diferença = (pilar - conexao) < 0 ? (pilar - conexao) * -1 : (pilar - conexao)

        if (diferença >= 0 && diferença <= 15) {
           return "Saudável";
        } else if (diferença >= 16 && diferença <= 30) {
           return "Em Atenção"
        } else if (diferença >= 31 && diferença <= 50) {
            return "Crítica"
        } else if (diferença > 50) {
            return "Rompida";
        } else {
            return "Rompida"
        }
    }
    
    if (Object.keys(notas).length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 mt-4">
                <p className="font-sans text-sm font-semibold text-gray-950">Carregando Indicadores</p>
                <div className="w-8 h-8 border-4 border-gray-100 border-t-4 border-t-gray-950 animate-spin rounded-full" />
            </div>
        )
    } else {
    return (
     <main className="py-6 px-24 flex flex-col gap-6">


        <div className="flex flex-col gap-6 mt-3">
            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-3">
                    <div className="border-l-4 rounded-md  border-l-emerald-500" />
                    <h2 className="text-gray-950 font-bold text-3xl rounded-sm font-sans border-b-2 border-b-gray-950 py-2">IMS - Índice de Maturidade Selah</h2>
              </div>
              <h4 className="font-sans ml-1 pl-3 text-gray-950 font-normal text-xs"><strong>Definição :</strong> O índice de maturidade mede : estrutura, organização, processos, gestão e disciplina operacional. Seu objetivo não é medir resultados, e sim a capacidade de gestão.</h4>
            </div>

            <div className="flex flex-col items-start gap-5 px-7 py-8 transition-all hover:-translate-y-2 shadow-2xl shadow-gray-400/50 rounded-2xl border-2 border-gray-400 bg-slate-100/10">
                <h3 className="font-sans text-2xl text-gray-950 uppercase tracking-widest font-semibold">Visão Individual</h3>
                <div className="grid grid-cols-4 gap-3 w-full">
                    {parcial_total.map((pilar) => (                                                 
                        <div className={`flex flex-col gap-6 px-4 py-4 items-start justify-between border-t-4 ${border[pilar.nome]} border-2 border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm">{pilar.nome}</p>

                        <div className="flex flex-col items-start gap-2 w-full">
                            <p className={`${progresso[pilar.nome]} font-sans text-xs`}><strong className="text-[32px]">{indicador[pilar.nome]}</strong>%</p>
                            <div className="w-full rounded-full bg-gray-100 h-1.5 ">
                                <div className={`transition-all duration-500 h-1.5 w-full rounded-full ${pilares_Pattern[pilar.nome]}`} 
                                style={{ width: `${indicador[pilar.nome]}%`}} />
                            </div>
                            </div>

                            <p className={`font-sans text-sm font-semibold ${progresso[pilar.nome]}`}>
                                {classificarIMS(indicador[pilar.nome]) }
                            </p>
                        </div>    
                    ))}
                </div>
            </div>

            <div className="border-b border-b-gray-950" />

            <div className="flex flex-col items-start gap-1">  
              <div className="flex gap-3">
                 <div className="border-l-4 rounded-md border-l-emerald-500" />
                 <h2 className="text-gray-950 font-bold text-3xl font-sans border-b-2 rounded-sm border-b-gray-950 py-2">ICS - Índice de Conexões Selah</h2>
              </div>
              <h4 className="font-sans ml-1 pl-3 text-gray-950 font-normal text-xs"><strong>Definição :</strong>O índice tem o objetivo de mostrar onde está a verdade que a empresa ainda não consegue enxergar. O ICS analisa conexões e mede o alinhamento da empresa, identificando possíveis rupturas.</h4>
            </div>

            <div className="flex flex-col items-start gap-5 px-7 py-8 transition-all hover:-translate-y-2 shadow-2xl shadow-gray-400/50 rounded-2xl border-2 border-gray-400 bg-slate-100/10">
                <h3 className="font-sans text-2xl text-gray-950 uppercase tracking-widest font-semibold">Visão Individual</h3>
                <div className="grid grid-cols-1 gap-3 w-full">
                    {conexoes.flatMap((pilar) => pilar.conexao.map((conexao) => {
                        const cor = classificarICS(indicador[pilar.pilar], indicador[conexao])
                        return( 
                                                                  
                        <div className={`flex gap-6 px-4  py-4 items-center justify-between border-t-4 ${classificacao_ics_border[cor]} border-2 border-gray-300 rounded-lg bg-slate-50`}>
                           
                           <div className="flex gap-4 items-end">
                             <p className="font-sans text-gray-700 font-light text-sm">{pilar.pilar}</p>
                             <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                             <p className="font-sans text-gray-700 font-light text-sm">{conexao}</p>

                             <div className="flex gap-3 ml-2">
                             <p className="font-sans text-gray-850 font-normal text-xs">{indicador[pilar.pilar]}%</p>
                             <p className="font-sans text-gray-850 font-normal text-xs">x</p>
                             <p className="font-sans text-gray-850 font-normal text-xs">{indicador[conexao]}%</p>
                            </div>
                           </div>

                           <div className="flex items-center justify-end gap-6 ">
                            <p className={`font-sans text-sm font-semibold ${conexao_diff[cor]}`}>
                                Δ {(indicador[pilar.pilar] - indicador[conexao]) < 0 ?
                             (indicador[pilar.pilar] - indicador[conexao]) * -1 : (indicador[pilar.pilar] - indicador[conexao])} pts</p>
                            <p className={`font-sans flex justify-center text-[10px] font-bold px-2 py-1 rounded-xl ${classificacao_ics[cor]}`}>
                                {cor}
                            </p>
                           </div>
                            
                        </div>    
                    )}))}
                </div>
            </div>            


            
        </div>

     </main>
    )
}
}

export default DiagnosticoIndividual;