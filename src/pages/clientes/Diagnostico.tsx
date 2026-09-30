import { useParams } from "react-router-dom";
import { API_URL } from "../../config/api";
import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

const conexoes = [
    {pilar : "Gestão Estratégica", conexao : ["Financeiro", "Pessoas", "Comercial"]},
    {pilar : "Financeiro", conexao : ["Comercial", "Operações e Processos"]},
    {pilar : "Comercial", conexao : ["Clientes e Experiência"]},
    {pilar : "Operações e Processos", conexao : ["Clientes e Experiência", "Pessoas"]},
    {pilar : "Tecnologia", conexao : ["Gestão Estratégica", "Financeiro", "Comercial", "Operações e Processos", "Pessoas", "Clientes e Experiência"]}
]


const Diagnostico = () => {
    const { id, empresa } = useParams()
    const token = localStorage.getItem("auth_token")
    const [notas, setNotas] = useState<Notas>({})
    const [conclusao, setConclusao] = useState("")
    const [salvando, setSalvando] = useState(false)
    const referencia = useRef<HTMLDivElement>(null)
    const [dataupdate, setDataUpdate] = useState("")


    useEffect(() => {
        const handleNotas = async () => {
          try {
            const response = await fetch(`${API_URL}/notas_questionario/${id}`, {
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
                setConclusao(data.conclusao)
                setDataUpdate(data.updated_at)
                console.log("Notas importadas com sucesso")
            }
          } catch (erro) {
             console.log(erro instanceof Error ? erro.message : "Erro interno ao buscar notas")
          }
        }
    handleNotas()},[])

    const handleConclusao = async() => {
        try {
            setSalvando(true)
            const response = await fetch(`${API_URL}/data_conclusao/${id}`, {
                method:"PATCH",
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({conclusao : conclusao})
            })

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data?.detail || "Erro ao enviar conclusão do diagnóstico ao banco")
            } else {
                setSalvando(false)
                toast.success("Conclusão adicionada!")
            }
        } catch (erro) {
            toast.error(erro instanceof Error ? erro.message : "Erro ao enviar conclusão do diagnóstico ao banco")
            console.log(erro)
        }

    }

    const indicador = useMemo(() => { return parcial_total.reduce((acc, pilar) => { 
            const valor = Math.min(Math.round(notas[pilar.number]?.nota / pilar.max * 100),100)
            return {...acc , [pilar.nome] : valor}
    },{} as Record<string, number>)},[notas])

    const ims_geral = Object.entries(indicador).reduce((acc, valor) => {
        return acc + valor[1]
    },0) / Object.keys(indicador).length

    const indicadores_ims = Object.values(indicador).sort((a, b) => a - b)

    const ims_maduro = Object.entries(indicador).filter((p) => p[1] === indicadores_ims[6])[0][0]
    console.log(Object.entries(indicador))
    const ims_fragil = Object.entries(indicador).filter((p) => p[1] === indicadores_ims[0])[0][0]

    const indicadores_ics_conexoes = conexoes.flatMap((pilar) => pilar.conexao.map((conexao) => {
        const diff = indicador[pilar.pilar] - indicador[conexao]
        return [pilar.pilar + " → " + conexao, diff < 0 ? diff * -1 : diff]
    }))

    const indicadores_ics = conexoes.flatMap((pilar) => pilar.conexao.map((conexao) => {
        const diff = indicador[pilar.pilar] - indicador[conexao]
        return diff < 0 ? diff * -1 : diff
    })).sort((a, b) => a - b)

    const ics_geral = (indicadores_ics.reduce((acc, conexao) => {
      return acc + conexao
    },0) / indicadores_ics.length)

    const ics_saudavel = indicadores_ics_conexoes.find((p) => p[1] === indicadores_ics[0])?.[0]
    const ics_fragil = indicadores_ics_conexoes.find((p) => p[1] === indicadores_ics[13])?.[0]

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

    const convert_date = (data : string) => {
        const date = new Date(data)
        return date.toLocaleDateString('pt-BR')
    }

    const sintese = {
        empresa : empresa,
        ims : [
         {
            ims_geral : ims_geral.toFixed(0),
            classificacao : classificarIMS(ims_geral)
         },
         { 
            pilar_maduro : ims_maduro ,
            valor_ims : indicadores_ims[6]
         },
         {
            pilar_fragil : ims_fragil,
            valor_ims : indicadores_ims[0]
         }
        ],
        ics : [
            {
               ics_geral : ics_geral,
               classificacao : classificarIMS(ics_geral)
            },
            { 
               conexao : indicadores_ics[0],
               ics_conexao_saudavel : ics_saudavel
            },
            {
               conexao : indicadores_ics[13],
               ics_conexao_fragil : ics_fragil
            }
        ]
    }

    const gerar_PDF = async() => {
        try {
            const response = await fetch(`${API_URL}/gerar_pdf`, {
                method:'POST',
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(sintese)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.detail)
            } else {
                toast.success('PDF Gerado')

            }
        } catch (erro) {
            toast.error(erro instanceof Error ? erro.message : "Erro ao gerar PDF")
            console.log(erro)
        }


        if (!referencia.current) return;

        const query = await html2canvas(referencia.current)
        const image = query.toDataURL('image/png')

        const largura_PDF = 180
        const altura_pdf = (query.height * largura_PDF) / query.width

        const pdf = new jsPDF('p','mm',[largura_PDF, altura_pdf])

        pdf.addImage(image, "PNG", 0, 0, largura_PDF ,altura_pdf)

        pdf.save(`Diagnóstico_${empresa}.pdf`)
    }

    const handlePlanilha = async () => {
        const data_validacao = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")

        try {
            const response_excel = await fetch(`${API_URL}/gerar_excel`, {
                method:'POST',
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}`
                },
                body: JSON.stringify({empresa : empresa, validacao : data_validacao})
            })

            if (!response_excel.ok) {
                const data = await response_excel.json()
                throw new Error (data?.detail || "Erro ao gerar planliha")
            } else {
                console.log("Planilha gerada com Sucesso")
                const data = await response_excel.blob()
                const url = window.URL.createObjectURL(data)
                const link = document.createElement('a')
                link.href = url
                link.download = `questionario_validacao_${empresa}.xlsx`
                link.click()
                window.URL.revokeObjectURL(url)
                console.log('Download feito com sucesso!')
            }
        } catch (erro) {
            toast.error(erro instanceof Error ? erro.message : "Erro interno ao gerar planilha")
            console.log(erro instanceof Error ? erro.message : "Erro interno ao gerar planilha")
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

        <div className="flex-col flex gap-6">
               <div className="flex gap-3">
                    <div className="border-l-4 rounded-md  border-l-emerald-500" />
                    <h2 className="text-gray-950 font-bold text-3xl rounded-sm font-sans py-2">Documentos Diagnóstico</h2>
               </div>
                <div className="flex items-start justify-between gap-5 px-7 py-8 transition-all shadow-2xl shadow-gray-400/50 rounded-2xl border-2 border-gray-400 bg-slate-100/10">
                        <button onClick={() => gerar_PDF()} className=" flex items-center justify-center gap-3 font-serif border-2 w-full  rounded-lg text-xs border-gray-900 bg-red-500 py-1 px-2 hover:bg-red-600 hover:text-white">
                                        PDF
                        </button>          
                            
                        <button 
                                onClick={() => handlePlanilha()} 
                                className=" flex items-center justify-center gap-3 font-serif border-2 w-full  rounded-lg text-xs border-gray-900 bg-emerald-400 py-1 px-2 hover:bg-emerald-500 hover:text-white">
                                Planilha Excel
                        </button>
                </div>
        </div>

        <div className="border-b border-b-gray-950" />

        <div ref={referencia} className="flex flex-col gap-8 mt-3">

            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-3">
                    <div className="border-l-4 rounded-md  border-l-emerald-500" />
                    <h2 className="text-gray-950 font-bold text-3xl rounded-sm font-sans border-b-2 border-b-gray-950 py-2">IMS - Índice de Maturidade Selah</h2>
              </div>
              <h4 className="font-sans ml-1 pl-3 text-gray-950 font-normal text-xs"><strong>Definição :</strong> O índice de maturidade mede : estrutura, organização, processos, gestão e disciplina operacional. Seu objetivo não é medir resultados, e sim a capacidade de gestão.</h4>
            </div>

            <div className="flex flex-col items-start gap-5 px-7 py-8 transition-all hover:-translate-y-2 shadow-2xl shadow-gray-400/50 rounded-2xl border-2 border-gray-400 bg-slate-100/10">
                <h3 className="font-sans text-2xl text-gray-950 uppercase tracking-widest font-semibold">Visão Geral</h3>
                <div className="grid grid-cols-3 gap-3 w-full">
                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-2 border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">IMS Geral</p>
                        <p className={` font-sans text-xs`}><strong className="text-[38px]/8">
                            {ims_geral.toFixed(0)}</strong>%
                        </p>
                        <p className={`font-sans text-lg font-semibold`}>
                            {classificarIMS(ims_geral)}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-sky-700 border-2  border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Pilar mais maduro</p>
                        <p className={` text-sky-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {ims_maduro}</strong>
                        </p>
                        <p className={`text-sky-700 font-sans text-lg font-semibold`}>
                            {indicadores_ims[6]}% · {classificarIMS(indicadores_ims[6])}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-red-700  border-2 border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Pilar mais fragilizado</p>
                        <p className={` text-red-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {ims_fragil}</strong>
                        </p>
                        <p className={`font-sans text-lg font-semibold text-red-700`}>
                            {indicadores_ims[0]}% · {classificarIMS(indicadores_ims[0])}
                        </p>
                    </div>
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
                <h3 className="font-sans text-2xl text-gray-950 uppercase tracking-widest font-semibold">Visão Geral</h3>
                <div className="grid grid-cols-3 gap-3 w-full">
                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-2 border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">ICS Geral</p>
                        <p className={` font-sans text-xs`}><strong className="text-[38px]/8">
                            {ics_geral}</strong>%
                        </p>
                        <p className={`font-sans text-lg font-semibold`}>
                            {classificarICS(Math.round(ics_geral), 0)}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-sky-700 border-2  border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Conexão mais saudável</p>
                        <p className={` text-sky-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {indicadores_ics[0]} pts</strong>
                        </p>
                        <p className={`text-sky-700 font-sans text-lg font-semibold`}>
                           {ics_saudavel}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-red-700 border-2 border-gray-300 rounded-lg bg-slate-50`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Conexão mais frágil</p>
                        <p className={` text-red-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {indicadores_ics[13]}</strong>
                        </p>
                        <p className={`font-sans text-lg font-semibold text-red-700`}>
                            {ics_fragil}
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-b border-b-gray-950" />

            <div className="flex flex-col items-start gap-4">
                <div className="flex gap-3">
                    <div className="border-l-4 rounded-md border-l-emerald-500" />
                    <h3 className="font-sans text-3xl text-gray-900 font-bold">Conclusão do Diagnóstico</h3>
                </div>

                <div className="flex mt-4 transition-all hover:-translate-y-2 shadow-2xl shadow-gray-400/50 flex-col gap-6 py-6 px-4 items-start border-gray-400 border-2 rounded-2xl bg-slate-100/10 bg w-full">
                    <input value={conclusao} onChange={(e) => setConclusao(e.target.value)} className="bg-gray-950 rounded-2xl text-gray-100 font-sans text-sm w-full pb-20 px-4 pt-2" 
                           placeholder="Escreva aqui a conclusão acerca do diagnóstico da empresa..." />
                    
                    <div className="flex justify-between w-full gap-8 items-center">
                      <p className="text-sm text-gray-600 font-light pl-2 italic w-full" >Última atualização - {convert_date(dataupdate)}</p>
                      <button onClick={() => handleConclusao()} className=" w-full max-w-fit rounded-xl px-6 py-2 font-serif text-xs font-semibold 
                            bg-emerald-500  text-gray-950 border-2 hover:text-white  transition-colors border-gray-950">
                                {salvando ? (
                                    <div className="flex gap-2 items-center">
                                        <div className="w-2 h-2 border-2 border-gray-100 border-t-2 border-t-gray-950 animate-spin rounded-full" />
                                        <p>Salvando</p>
                                    </div>
                                ) : (
                                    <p>Salvar</p>
                                )}
                            
                      </button>
                    </div>
                </div>
            </div>            

            


            
        </div>

     </main>
    )
}
}

export default Diagnostico;