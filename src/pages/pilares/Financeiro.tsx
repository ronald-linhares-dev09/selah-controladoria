import { useState } from "react"
import { SaveAll } from "lucide-react"
import { toast } from "sonner"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { CalcularNota } from "../../utils/notaPilares"
import { MoveRight, MoveLeft } from "lucide-react"

interface Respostas {
    code : codigoFinanceiro,
    resposta : "sim" | "não" | "parcial"
}

const perguntas = [
    {
        id: 2,
        perguntas: [
            {
                id_pergunta: 1,
                codigo: "F01",
                principal: "A empresa possui Fluxo de Caixa atualizado?",
                peso: 5,
            },
            {
                id_pergunta: 2,
                codigo: "F02",
                principal: "O Fluxo de Caixa é utilizado para tomada de decisões?",
                peso: 5,
            },
            {
                id_pergunta: 3,
                codigo: "F03",
                principal: "Existe projeção de caixa para os próximos meses?",
                peso: 5,
            },
            {
                id_pergunta: 4,
                codigo: "F04",
                principal: "A empresa acompanha diariamente seus recebimentos?",
                peso: 4,
            },
            {
                id_pergunta: 5,
                codigo: "F05",
                principal: "A empresa acompanha diariamente seus pagamentos?",
                peso: 4,
            },
            {
                id_pergunta: 6,
                codigo: "F06",
                principal: "Existe controle efetivo da inadimplência?",
                peso: 5,
            },
            {
                id_pergunta: 7,
                codigo: "F07",
                principal: "A empresa conhece sua necessidade de capital de giro?",
                peso: 5,
            },
            {
                id_pergunta: 8,
                codigo: "F08",
                principal: "A empresa conhece sua Margem de Contribuição?",
                peso: 5,
            },
            {
                id_pergunta: 9,
                codigo: "F09",
                principal: "A empresa conhece seu Ponto de Equilíbrio?",
                peso: 5,
            },
            {
                id_pergunta: 10,
                codigo: "F10",
                principal: "Existe orçamento financeiro acompanhado mensalmente?",
                peso: 5,
            },
            {
                id_pergunta: 11,
                codigo: "F11",
                principal: "A empresa acompanha seu endividamento e cronograma de pagamentos?",
                peso: 4,
            },
            {
                id_pergunta: 12,
                codigo: "F12",
                principal: "A empresa gera caixa suficiente para sustentar suas operações?",
                peso: 5,
            },
        ]
    }
];

const validacao_perguntas = {
    F01: [
        "O fluxo é atualizado diariamente?",
        "O fluxo contempla todas as entradas?",
        "O fluxo contempla todas as saídas?",
        "Existe responsável pela atualização?"
    ],

    F02: [
        "O fluxo é analisado periodicamente?",
        "Decisões de compra utilizam o fluxo?",
        "Decisões de investimento utilizam o fluxo?",
        "Existe reunião de análise financeira?"
    ],

    F03: [
        "A projeção cobre 90 dias?",
        "A projeção é revisada?",
        "Existe comparação entre previsto e realizado?",
        "Os gestores utilizam a projeção?"
    ],

    F04: [
        "Existe relatório de recebimentos?",
        "Existe acompanhamento de atrasos?",
        "Os recebimentos são conciliados?",
        "Existe responsável pelo processo?"
    ],

    F05: [
        "Existe agenda financeira?",
        "Os pagamentos são programados?",
        "Há controle de vencimentos?",
        "Existem multas recorrentes?"
    ],

    F06: [
        "A inadimplência é medida?",
        "Existem metas de recuperação?",
        "Existe equipe responsável?",
        "Há indicadores de cobrança?"
    ],

    F07: [
        "O cálculo é atualizado?",
        "Existe acompanhamento?",
        "A gestão utiliza essa informação?",
        "Existe planejamento para sazonalidade?"
    ],

    F08: [
        "A margem é calculada regularmente?",
        "Existe análise por produto?",
        "Existe análise por cliente?",
        "A margem influencia decisões?"
    ],

    F09: [
        "O cálculo é atualizado?",
        "Os gestores conhecem o indicador?",
        "É utilizado no planejamento?",
        "É utilizado nas metas?"
    ],

    F10: [
        "Existe orçamento formalizado?",
        "Existe análise de desvios?",
        "Os gestores participam?",
        "Existem ações corretivas?"
    ],

    F11: [
        "Existe relatório das dívidas?",
        "Existem projeções?",
        "Há renegociações planejadas?",
        "Os custos financeiros são monitorados?"
    ],

    F12: [
        "O caixa cresce ao longo do tempo?",
        "Existe dependência de empréstimos?",
        "Existe dependência de antecipações?",
        "A operação gera recursos próprios?"
    ]
};

type codigoFinanceiro = keyof typeof validacao_perguntas

const codigos = Object.keys(validacao_perguntas) as codigoFinanceiro[]

const Financeiro = () => {

    const { empresa } = useParams()

    const [respostas, setRespostas] = useState<Respostas[]>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário principal${empresa}`) ?? "[]")
        return data
    })
    const navigate = useNavigate()
    const [codigo, setCodigo] = useState<codigoFinanceiro>('F01')

    const indice_atual = codigos.indexOf(codigo)
    const next_bloco = indice_atual < codigos.length - 1
    const back_bloco = indice_atual > 0
    const resposta_atual = respostas.find((p) => p.code === codigo)?.resposta
    const progresso = Math.min(Math.round(respostas.filter((p) => codigos.includes(p.code)).length / codigos.length * 100), 100)

    const [validacoes, setValidacoes] = useState<Record<string, Record<string , string>>>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")
        console.log(data)
        return data["Financeiro"] ?? "{}"
    })

    const handleAvançar = () => {
        if (!resposta_atual) {
            toast.error("Responda a Pergunta Principal") 
            return;
        }

        setCodigo(codigos[indice_atual + 1])
    }

    const handleBack = () => {
        if (!back_bloco) return

        setCodigo(codigos[indice_atual - 1])
    }

    const handleValidacao = (question : string, resposta : string)=> {
        setValidacoes(prev => {
            const dados_atualizados = {
                ...prev, [codigo] : {...prev[codigo], [question] : resposta}
            }

            const data_last = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")

            localStorage.setItem(`Questionário Selah${empresa}`, JSON.stringify({...data_last,"Financeiro": dados_atualizados}))
            return dados_atualizados
        }
        )    
    }
    
    

    const handleSubmit = async() => {
        
    if (!resposta_atual) {
            toast.error("Responda a Pergunta Principal")
            return
        }


        const nota = perguntas[0].perguntas.reduce((acc, bloco) => {
            const resposta_salva = respostas.find((p) => p.code === bloco.codigo)
            if (!resposta_salva) return acc;
            return acc + CalcularNota(bloco.peso, resposta_salva.resposta)
        },0)

        const dadosAtuais = JSON.parse(localStorage.getItem(`Questionario${empresa}`) ?? 
         JSON.stringify({ pilaresLiberados : [1,2], respostas : {}}))
        

        dadosAtuais.respostas[2] = {
            nota : nota,
        }

        dadosAtuais.pilaresLiberados = [
            ...new Set([...dadosAtuais.pilaresLiberados, 3])
        ]

        localStorage.setItem(`Questionario${empresa}`,JSON.stringify(dadosAtuais))
        navigate(`/clientes/form/${empresa}/comercial`)
        
    }

    return (
    <div className="flex flex-col py-4 px-24">
    
        <p className="font-extralight font-serif tracking-widest text-xs ">Questionário</p>
        <h1 className="text-gray-950 font-bold font-serif text-3xl  mt-1">Pilar <strong className="text-emerald-500">Financeiro</strong></h1> 

        <div className="flex flex-col items-center mt-4 gap-2">
         <div className="flex flex-col py-6 px-4 border border-gray-950 rounded-lg w-full  max-w-6xl gap-4">
            <div className="flex justify-between items-center">
                <button onClick={() => handleBack()} className="flex justify-around items-center gap-2 px-3 border-2 text-gray-400 hover:text-gray-950 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    <MoveLeft className="h-8 w-4 " />
                    <p className="font-serif text-xs font-semibold">Anterior</p>
                </button>

                <div className="flex flex-col items-center gap-1">
                    <h3 className="font-sans text-xl font-semibold uppercase tracking-wider text-gray-950">{codigo}</h3>
                    <h4 className="font-serif text-gray-500 text-sm ">Bloco {indice_atual + 1} de {codigos.length} </h4>
                </div>

                <button onClick={() => {if (!next_bloco) return; handleAvançar()}} className="flex justify-around items-center gap-2 px-3 border-2 transition-colors text-gray-950 hover:text-white bg-emerald-400  hover:bg-emerald-500 border-gray-950 rounded-lg">
                    <p className="font-serif text-xs  font-semibold">Próximo</p>
                    <MoveRight className="h-8 w-4 " />
                </button>
            </div>

            <div className="w-full rounded-full bg-gray-200 h-1.5">
                <div className="bg-emerald-500 w-full rounded-full transition-all duration-500 h-1.5" 
                 style={{width: `${progresso}%`}} />
            </div>

            <div className="flex justify-between">
                <p className="font-sans text-gray-500 text-sm">Empresa : <span className="text-gray-950 font-semibold">{empresa}</span></p>
                <p className="font-sans text-gray-500 text-sm">{progresso}% concluído</p>
            </div>
        </div>

      <div className="border rounded-lg border-gray-950 mt-6 p-8  w-full max-w-6xl items-center">
         <h1 className="font-serif text-2xl border-b border-gray-950 pb-3 mb-6">Pergunta Principal</h1>
         
        {perguntas.flatMap((p => p.perguntas)).filter((bloco) => bloco.codigo === codigo).map((pergunta) => (
         <div className="flex justify-between py-4" key={pergunta.id_pergunta}>
            <p className="text-lg font-serif font-semibold">{pergunta.principal}</p>

          <div className="flex gap-2">
            <button onClick={() => setRespostas(
                prev => {
                    const check = prev.find((p) => p.code === codigo)

                    const atualizado : Respostas[] = check 
                    ? prev.map((p) => p.code === codigo ? {...p, resposta : "sim"} : p)
                    : [...prev, {code : codigo, resposta : "sim"}]

                    localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))
                    return atualizado
                }
            )} className={resposta_atual === "sim" ? "bg-emerald-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-emerald-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                Sim
            </button>
            <button onClick={() => setRespostas(
                prev => {
                    const check = prev.find((p) => p.code === codigo)

                    const atualizado : Respostas[] = check 
                    ? prev.map((p) => p.code === codigo ? {...p, resposta : "não"} : p)
                    : [...prev, {code : codigo, resposta : "não"}]

                    localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))
                    return atualizado
                }
            )} className={resposta_atual === "não" ? "bg-red-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-red-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                Não
            </button>
            <button onClick={() => setRespostas(
                prev => {
                    const check = prev.find((p) => p.code === codigo)

                    const atualizado : Respostas[] = check 
                    ? prev.map((p) => p.code === codigo ? {...p, resposta : "parcial"} : p)
                    : [...prev, {code : codigo, resposta : "parcial"}]

                    localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))
                    return atualizado
                }
            )} className={resposta_atual === "parcial" ? "bg-yellow-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-yellow-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                Parcial
            </button>           
          </div>       
         </div>         
        ))}
        </div>

        <div className="border rounded-lg border-gray-950 mt-4 px-8 py-8 w-full max-w-6xl">
         <h1 className="font-serif text-2xl border-b border-gray-950 pb-3 mb-5 mt-6">Perguntas de Validação</h1>
         <div className="flex flex-col  justify-center items-start gap-3">
            {codigo && validacao_perguntas[codigo]?.map((question) => (
                <div className="flex items-center justify-between w-full max-w-full" key={question}>
                    <p className="text-sm font-serif font-semibold">{question}</p>
                    <input 
                      type="text"
                      autoComplete="on"
                      value={validacoes?.[codigo]?.[question] ?? ""}
                      onChange={(e) => handleValidacao(question, e.target.value)}
                      className="bg-gray-100/70 border text-xs font-serif border-gray-950 rounded-lg outline-none w-full max-w-lg px-2 py-1"
                    />
                </div>
            ))}
         </div>
         </div>
     
         <button onClick={() => {
            if (!next_bloco) {
                handleSubmit()
            } else {
                handleAvançar()
            }
         }} 
            className="flex items-center justify-center gap-3 font-serif mt-7 border-2 w-full max-w-6xl rounded-lg border-gray-900 bg-emerald-400 py-3 px-3 hover:bg-emerald-500 hover:text-white">
            <SaveAll className="h-4 w-4" />
             {!next_bloco ? "Salvar Respostas" : "Próximo Bloco"}
         </button>

     </div>
     </div>

    )
}

export default Financeiro