import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import { DatabaseX, File, Sheet } from "lucide-react";
import { ButtonFilter, ButtonDark, ButtonLight } from "../../ui/button";
import { obter_questionario, atualizar_conclusao, obter_pdf, obter_planilha } from "../../services/questionarios";
import type { DadosIndicadores, DadosValidacao } from "../../schemas/questionarios";

type Notas = Record<string, {nota : number}>

const secoes = [
    {id : 'todos', nome: 'Todos'},
    {id : 'ims', nome : 'IMS'},
    {id : 'ics', nome : 'ICS'},
    {id : 'docs', nome : 'DOCS'},
    {id : 'conclusao', nome : 'Conclusão'}
] as const

type Filtro = typeof secoes[number]['id']

const parcial_total = [
  { number : "1", max : 440, nome : "Gestão"}, 
  { number : "2", max : 570, nome : "Financeiro"}, 
  { number : "3", max : 570, nome : "Comercial"},
  { number : "4", max : 560, nome : "Operações"}, 
  { number : "5", max : 510, nome : "Pessoas"}, 
  { number : "6", max : 580, nome : "Clientes"}, 
  { number : "7", max : 530, nome : "Tecnologia" }
]

const conexoes = [
    {pilar : "Gestão", conexao : ["Financeiro", "Pessoas", "Comercial"]},
    {pilar : "Financeiro", conexao : ["Comercial", "Operações"]},
    {pilar : "Comercial", conexao : ["Clientes"]},
    {pilar : "Operações", conexao : ["Clientes", "Pessoas"]},
    {pilar : "Tecnologia", conexao : ["Gestão", "Financeiro", "Comercial", "Operações", "Pessoas", "Clientes"]}
]


const Diagnostico = () => {
    const { cliente_id, empresa } = useParams()
    const [notas, setNotas] = useState<Notas>({})
    const [conclusao, setConclusao] = useState("")
    const [updateConclusao, setUpdateConlusao] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [dataupdate, setDataUpdate] = useState<string | null>(null)
    const [buttonExcel, setButtonExcel] = useState(false)
    const [buttonPDF, setButtonPDF] = useState(false)
    const [buscaNotas, setBuscaNotas] = useState(true)

    const [filtro, setFiltro] = useState<Filtro>("todos")
    const filtroIms = filtro === 'todos' || filtro === 'ims'
    const filtroIcs = filtro === 'todos' || filtro === 'ics'
    const filtroDocs = filtro === 'todos' || filtro === 'docs'
    const filtroConclusao = filtro === 'todos' || filtro === 'conclusao'


    useEffect(() => {
        const handleNotas = async () => {
          try {
            const data = await obter_questionario(cliente_id ?? "")
            setNotas(data.notas)
            setConclusao(data.conclusao ?? "")
            setDataUpdate(data.updated_at)
            console.log("Notas importadas com sucesso")
            setBuscaNotas(false)

          } catch (erro) {
             console.error(erro instanceof Error ? erro.message : "Erro interno ao buscar notas")
             toast.error('Erro interno ao buscar notas')
          } finally {
            setBuscaNotas(false)
          }
        }
    handleNotas()},[cliente_id])

    const update_conclusao = async() => {

        const data = await atualizar_conclusao(conclusao, cliente_id ?? "")
        setDataUpdate(data.updated)
    }

    const handleConclusao = async() => { 
            setSalvando(true)

            try {
                await update_conclusao()
                setUpdateConlusao(false)
            } catch (erro) {
                toast.error(erro instanceof Error ? erro.message : "Erro ao salvar conclusão")
                console.error(erro)
            } finally {
                setSalvando(false)
            }
    }


    // Pilar e Notas
    const indicador = useMemo(() => { return parcial_total.reduce((acc, pilar) => { 
            const valor = Math.min(Math.round(notas[pilar.number]?.nota / pilar.max * 100),100)
            return {...acc , [pilar.nome] : valor}
    },{} as Record<string, number>)},[notas])
    
    //Cálculo IMS
    const indicadores_ims = Object.entries(indicador)
    const ims_geral = Math.round(indicadores_ims.reduce((acc, valor) => {
        return acc + valor[1]
    },0) / Object.keys(indicador).length)

    const ims_maduro = Math.max(...indicadores_ims.map((p) => p[1]))
    const name_ims_maduro = indicadores_ims.find((pilar) => pilar[1] === ims_maduro)?.[0] ?? ""

    const ims_fragil = Math.min(...indicadores_ims.map((p) => p[1]))
    const name_ims_fragil = indicadores_ims.find((pilar) => pilar[1] === ims_fragil)?.[0] ?? ""


    //Cálculo ICS
    const indicadores_ics_conexoes = conexoes.flatMap((pilar) => pilar.conexao.map((conexao) => {
        const diff = indicador[pilar.pilar] - indicador[conexao]
        return {conexao : pilar.pilar + " → " + conexao, diferenca : Math.abs(diff)}
    }))

    const diferenca_ics = indicadores_ics_conexoes.map((conexao) => conexao.diferenca)
    const ics_geral = Math.round(diferenca_ics.reduce((acc, diff) => {
      return acc + diff
    },0) / diferenca_ics.length)

    const ics_saudavel = Math.min(...diferenca_ics)
    const name_ics_saudavel = indicadores_ics_conexoes.find((conexao) => conexao.diferenca === ics_saudavel)?.conexao ?? ""
    const ics_fragil = Math.max(...diferenca_ics)
    const name_ics_fragil = indicadores_ics_conexoes.find((conexao) => conexao.diferenca === ics_fragil)?.conexao ?? ""

    const classificarIMS = (ims : number) => {
        if ( ims >= 81) {
        return "Maduro"
       } if ( ims >= 61) {
        return "Gerenciado"
       }
        if ( ims >= 41) {
        return "Em Estruturação"
       }
        if ( ims >= 21) {
        return "Fragilizado"
       }
        return "Crítico"            
    }

    const classificarICS = (diferenca : number) => {
        if (diferenca >= 16 && diferenca <= 30) {
           return "Em Atenção"
        } 
        if (diferenca >= 31 && diferenca <= 50) {
            return "Crítica"
        } 
        if (diferenca > 50) {
            return "Rompida";
        } 
        return "Saudável"
    }

    const convert_date = (data : string) => {
        if (!data) return "";

        const date = new Date(data)

        if(isNaN(date.getTime())) return "";

        return date.toLocaleDateString('pt-BR')
    }

    const gerar_PDF = async() => {
        setButtonPDF(true)

        try {

            if (updateConclusao) {
              await update_conclusao();
            }

            const sintese = {
                empresa : empresa,
                ims : {
                    geral : {
                        valor : ims_geral,
                        classificacao : classificarIMS(ims_geral)
                    },
                    mais_maduro : { 
                        nome : name_ims_maduro,
                        valor : ims_maduro,
                        classificacao : classificarIMS(ims_maduro)
                    },
                    mais_fragil : {
                        nome : name_ims_fragil,
                        valor : ims_fragil,
                        classificacao : classificarIMS(ims_fragil),
                    }
                },
                ics : {
                    geral : {
                        valor : ics_geral,
                        classificacao : classificarICS(ics_geral)
                    },
                    mais_saudavel : {
                        nome : name_ics_saudavel,
                        valor : ics_saudavel,
                        classificacao : classificarICS(ics_saudavel),
                    },
                    mais_fragil : {
                        nome : name_ics_fragil,
                        valor : ics_fragil,
                        classificacao : classificarICS(ics_fragil)
                    }
                },
                conclusao : conclusao
            }

            const response = await obter_pdf(sintese as DadosIndicadores, cliente_id ?? "")
            const data = await response.blob()
            const url = window.URL.createObjectURL(data)
            const link = document.createElement('a')
            link.href = url
            link.download = `Diagnóstico_${empresa}.pdf`
            link.click()
            window.URL.revokeObjectURL(url)
            toast.success('PDF Gerado')
            setUpdateConlusao(false)

        } catch (erro) {
            toast.error(erro instanceof Error ? erro.message : "Erro ao gerar PDF")
            console.error(erro)
        } finally {
            setButtonPDF(false)
        }
    }

    const handlePlanilha = async () => {
        const data_validacao = localStorage.getItem(`Questionário Selah${empresa}`)

        if (!data_validacao) {
            toast.error('Preencha as perguntas de validação para ter acesso a planilha')
            return;
        }
        setButtonExcel(true)

        try {
            const response_excel = await obter_planilha(cliente_id ?? "", JSON.parse(data_validacao) as DadosValidacao)
            
            console.log("Planilha gerada com Sucesso")
            const data = await response_excel.blob()
            const url = window.URL.createObjectURL(data)
            const link = document.createElement('a')
            link.href = url
            link.download = `questionario_validacao_${empresa}.xlsx`
            link.click()
            window.URL.revokeObjectURL(url)
            console.log('Download feito com sucesso!')
            
        } catch (erro) {
            toast.error(erro instanceof Error ? erro.message : "Erro interno ao gerar planilha")
            console.log(erro instanceof Error ? erro.message : "Erro interno ao gerar planilha")
        } finally {
            setButtonExcel(false)
        }
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
            return (
             <div className="flex flex-col items-center gap-3 mt-4">
                  <DatabaseX className="h-6 w-6" />
                  <p className="font-sans text-sm font-semibold text-gray-950">Notas não importadas</p>
              </div>
            )
        }
    return (
     <main>

      <div className="flex justify-start items-center gap-6 w-full px-10 bg-white py-2 border-b-2 border-b-gray-300  ">
       {secoes.map((secao) => (
        <ButtonFilter ref={secao.id} key={secao.id} onClick={() => setFiltro(secao.id)} type="button">
            {secao.nome}
        </ButtonFilter>
       ))}
      </div>


      <div className="px-10 flex flex-col gap-8 py-6">

       {filtroDocs && (
        <section className="flex-col flex gap-2">
            <h2 className="text-gray-600 font-semibold tracking-widest uppercase text-lg rounded-sm font-sans py-2">Documentos</h2>

            <div className="flex gap-2">
                <div className="flex items-start gap-5 px-7 py-8 transition-all rounded-2xl border-2 bg-white">
                   <span className="px-4 py-3 bg-red-200/20 rounded-lg">
                      <File className="text-red-700 w-5 h-6 " />
                   </span>
                    <div className="flex flex-col items-start gap-4">
                     <div className="flex flex-col gap-1">
                      <h1 className="font-sans text-lg text-gray-950 font-semibold">Relatório Diagnóstico</h1>
                      <p className="font-sans text-sm text-gray-600 font-normal ">Síntese dos indicadores e conclusão, pronta para entregar ao cliente.</p>
                     </div>

                      <ButtonDark onClick={() => gerar_PDF()} disabled={buttonPDF} type="button">
                                    Baixar PDF
                      </ButtonDark>
                    </div>

                </div>          

                <div className="flex items-start justify-between gap-5 px-7 py-8 transition-all rounded-2xl border-2  bg-white">

                   <span className="px-4 py-3 bg-emerald-200/20 rounded-lg">
                      <Sheet className="text-emerald-700 w-5 h-6 " />
                   </span>

                    <div className="flex flex-col items-start gap-3">
                     <div className="flex flex-col gap-1">
                      <h1 className="font-sans text-lg text-gray-950 font-semibold">Respostas de validação</h1>
                      <p className="font-sans text-sm text-gray-600 font-normal" >Planilha com uma aba por pilar e todas as perguntas respondidas.</p>
                     </div>

                        <ButtonLight 
                                onClick={() => handlePlanilha()} 
                                disabled={buttonExcel}
                                type="button"
                                >
                                Baixar planilha
                        </ButtonLight>
                    </div>
                </div>
            </div>
         </section>
        )}

        {filtroIms && (
        <section className="flex flex-col gap-8 mt-3">
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


                <div className="grid grid-cols-3 gap-3 w-full">
                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border border-gray-300 rounded-lg bg-white`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">IMS Geral</p>
                        <p className={` font-sans text-xs`}><strong className="text-[38px]/8">
                            {ims_geral}</strong>%
                        </p>
                        <p className={`font-sans text-lg font-semibold`}>
                            {classificarIMS(ims_geral)}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-sky-700 border  border-gray-300 rounded-lg bg-white`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Pilar mais maduro</p>
                        <p className={` text-sky-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {name_ims_maduro}</strong>
                        </p>
                        <p className={`text-sky-700 font-sans text-lg font-semibold`}>
                            {ims_maduro}% · {classificarIMS(ims_maduro)}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-red-700  border border-gray-300 rounded-lg bg-white`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Pilar mais fragilizado</p>
                        <p className={` text-red-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {name_ims_fragil}</strong>
                        </p>
                        <p className={`font-sans text-lg font-semibold text-red-700`}>
                            {ims_fragil}% · {classificarIMS(ims_fragil)}
                        </p>
                    </div>
                </div>
        </section>
        )}

        {filtroIcs && (
         <section className="flex flex-col gap-8 mt-3">
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

            <div className="grid grid-cols-3 gap-3 w-full">
                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border border-gray-300 rounded-lg bg-white`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">ICS Geral</p>
                        <p className={` font-sans text-xs`}><strong className="text-[38px]/8">
                            {ics_geral}</strong> pts
                        </p>
                        <p className={`font-sans text-lg font-semibold`}>
                            {classificarICS(ics_geral)}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-sky-700 border  border-gray-300 rounded-lg bg-white`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Conexão mais saudável</p>
                        <p className={` text-sky-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {ics_saudavel}</strong> pts
                        </p>
                        <p className={`text-sky-700 font-sans text-lg font-semibold`}>
                           {name_ics_saudavel}
                        </p>
                    </div>

                    <div className={`flex flex-col gap-2 px-4 py-4 items-start justify-between border-t-4 border-t-red-700 border border-gray-300 rounded-lg bg-white`}>
                        <p className="font-sans text-gray-700 font-light text-sm uppercase">Conexão mais frágil</p>
                        <p className={` text-red-700 font-sans text-xs`}><strong className="text-[38px]/8">
                            {ics_fragil}</strong> pts
                        </p>
                        <p className={`font-sans text-lg font-semibold text-red-700`}>
                            {name_ics_fragil}
                        </p>
                    </div>
                </div>
         </section>
        )}

        {filtroConclusao && (
          <section className="flex flex-col items-start gap-4">

            <div className="flex flex-col items-start gap-4">
                <div className="flex flex-col items-start gap-1">
                    <h3 className="text-emerald-700 font-semibold uppercase tracking-widest text-sm font-sans ">Análise do Consultor</h3>
                    <h1 className="text-gray-950 font-bold text-3xl font-sans">Conclusão</h1>
                </div>

                <div className="flex gap-3">
                     <div className="border-l-2 rounded-md border-l-gray-300" />
                     <h4 className="font-sans text-sm text-gray-600 font-normal">O texto gravado aqui é o que sai assinado no relatório em PDF.</h4>
                </div>
            </div>

            <div className="flex mt-4 flex-col gap-6 py-6 px-4 items-start border-2 rounded-2xl bg-white bg w-full">
                    <textarea value={conclusao} onChange={(e) => {
                             setConclusao(e.target.value); setUpdateConlusao(true)}} className="bg-gray-100/50 rounded-2xl text-gray-600 border-2 border-gray-200 font-sans text-sm w-full pb-20 px-4 pt-2" 
                           placeholder="Escreva aqui a conclusão acerca do diagnóstico da empresa..." />
                    
                    <div className="flex justify-between w-full gap-8 items-center">
                      <p className="text-sm text-gray-600 font-light pl-2 italic w-full" >Última atualização - {convert_date(dataupdate ?? "")}</p>
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
          </section>
        )}

        </div>

     </main>
    )
}
}

export default Diagnostico;