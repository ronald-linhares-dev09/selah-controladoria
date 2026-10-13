import { useParams } from "react-router-dom";
import { ButtonFilter } from "../../ui/button";
import { useEffect, useState } from "react";
import { useMemo } from "react";
import { ArrowRightLeft, DatabaseX } from "lucide-react";
import { obter_questionario } from "../../services/questionarios";

type Notas = Record<string, {nota : number}>

const secoes = [
    {id : 'todos', nome : 'Todos'},
    {id : 'ims', nome : 'IMS'},
    {id : 'ics', nome : 'ICS'}
] as const

type Filtro = typeof secoes[number]['id']

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
    const { cliente_id } = useParams()
    const [notas, setNotas] = useState<Notas>({})
    const [buscaNotas, setBuscaNotas] = useState(true)

    const [filtro, setFiltro] = useState<Filtro>('todos')
    const filtroIms = filtro === 'todos' || filtro === 'ims'
    const filtroIcs = filtro === 'todos' || filtro === 'ics'


    useEffect(() => {
        const handleNotas = async () => {
          try {
            const data = await obter_questionario(cliente_id ?? "")

            setNotas(data.notas)
            console.log("Notas importadas com sucesso")
            setBuscaNotas(false)
          } catch (erro) {
             console.log(erro instanceof Error ? erro.message : "Erro interno ao buscar notas")
          } finally {
            setBuscaNotas(false)
          }
        }
    handleNotas()},[cliente_id])

    const indicador = useMemo(() => { return parcial_total.reduce((acc, pilar) => { 
            const valor = Math.min(Math.round(notas[pilar.number]?.nota / pilar.max * 100),100)
            return {...acc , [pilar.nome] : valor}
    },{} as Record<string, number>)},[notas])


    const classificarIMS = (ims : number) => {
       if ( ims >= 41) {
        return "Em Estruturação"
       } if ( ims >= 61) {
        return "Gerenciado"
       } if ( ims >= 81) {
        return "Maduro"
       }
       return "Crítico"                   
    }



    const classificarICS = (pilar : number, conexao : number) => {
        let diferença = Math.abs(pilar - conexao)

        if (diferença >= 16 && diferença <= 30) {
           return "Em Atenção"
        } if (diferença >= 31 && diferença <= 50) {
            return "Crítica"
        } if (diferença > 50) {
            return "Rompida";
        }
        return "Saudável";
    }
    
    if (buscaNotas) {
        return (
            <div className="flex flex-col items-center gap-3 mt-4">
                <p className="font-sans text-sm font-semibold text-gray-950">Carregando Indicadores</p>
                <div className="w-8 h-8 border-4 border-gray-100 border-t-4 border-t-gray-950 animate-spin rounded-full" />
            </div>
        )
    } else {
        if (Object.keys(notas).length === 0) {
            <div className="flex flex-col items-center gap-3 mt-4">
                <DatabaseX className="h-6 w-6" />
                <p className="font-sans text-sm font-semibold text-gray-950">Notas não importadas</p>
            </div>
        }
    return (
     <main>

        <div className="flex justify-start items-center gap-6 w-full px-10 bg-white py-2 border-b-2 border-b-gray-300  ">
          {secoes.map((secao) => (
             <ButtonFilter key={secao.id} onClick={() => setFiltro(secao.id)} type="button">
                {secao.nome}
            </ButtonFilter>
          ))}
        </div>
    

    <div className="px-10 py-8 flex flex-col gap-8">
        {filtroIms && (
            <section className="flex flex-col gap-6">

                <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-col items-start gap-1">
                            <h3 className="text-emerald-700 font-semibold uppercase tracking-widest text-sm font-sans ">Índice 01</h3>
                            <h1 className="text-gray-950 font-bold text-3xl font-sans">Maturidade</h1>
                    </div>

                    <div className="flex gap-3">
                            <div className="border-l-2 rounded-md border-l-gray-300" />
                            <h4 className="font-sans text-sm text-gray-600 font-normal">Mede estrutura, organização, processos, gestão e disciplina operacional de cada pilar isoladamente. Não mede resultado — mede capacidade de gestão.</h4>
                    </div>
                </div>

                
                <div className="grid grid-cols-4 gap-3 w-full">
                        {parcial_total.map((pilar) => (                                                 
                            <div className={`flex flex-col gap-6 px-4 py-4 items-start justify-between border-t-4 ${border[pilar.nome]} border-2 border-gray-300 rounded-lg bg-white`}>
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
            </section>
        )}
        
        {filtroIcs && (
            <section className="flex flex-col gap-8">
              
               <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-col items-start gap-1">
                            <h3 className="text-emerald-700 font-semibold uppercase tracking-widest text-sm font-sans ">Índice 02</h3>
                            <h1 className="text-gray-950 font-bold text-3xl font-sans">Conexões</h1>
                    </div>

                    <div className="flex gap-3">
                            <div className="border-l-2 rounded-md border-l-gray-300" />
                            <h4 className="font-sans text-sm text-gray-600 font-normal">Mede o alinhamento entre pilares conectados. Onde a maturidade de um não acompanha a do outro, existe ruptura — é ali que está a verdade que a empresa ainda não enxerga.</h4>
                    </div>
                </div>

                
                <div className="grid grid-cols-1 gap-3 w-full">
                        {conexoes.flatMap((pilar) => pilar.conexao.map((conexao) => {
                            const cor = classificarICS(indicador[pilar.pilar], indicador[conexao])
                            return( 
                                                                    
                            <div className={`flex gap-6 px-4  py-4 items-center justify-between border-t-4 ${classificacao_ics_border[cor]} border-2 border-gray-300 rounded-lg bg-white`}>
                            
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
            </section>
        )}
        </div>

     </main>
    )
}
}

export default DiagnosticoIndividual;