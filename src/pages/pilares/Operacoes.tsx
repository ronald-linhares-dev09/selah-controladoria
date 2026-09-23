import { useState } from "react"
import { SaveAll, MoveLeft, MoveRight } from "lucide-react"
import { toast } from "sonner"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { CalcularNota } from "../../utils/notaPilares"

interface Respostas {
    code : CodigoGestao
    resposta : "sim" | "não" | "parcial"
}

const perguntas = [
    {
        id: 4,
        perguntas: [
            {
                id_pergunta: 1,
                codigo: "O01",
                principal: "Os principais processos da empresa estão documentados?",
                peso: 5,
            },
            {
                id_pergunta: 2,
                codigo: "O02",
                principal: "Existe padronização na execução das atividades?",
                peso: 5,
            },
            {
                id_pergunta: 3,
                codigo: "O03",
                principal: "A empresa mede produtividade operacional?",
                peso: 5,
            },
            {
                id_pergunta: 4,
                codigo: "O04",
                principal: "Existem indicadores operacionais definidos?",
                peso: 4,
            },
            {
                id_pergunta: 5,
                codigo: "O05",
                principal: "A empresa monitora retrabalho?",
                peso: 5,
            },
            {
                id_pergunta: 6,
                codigo: "O06",
                principal: "A empresa monitora desperdícios operacionais?",
                peso: 5,
            },
            {
                id_pergunta: 7,
                codigo: "O07",
                principal: "Existe controle formal da qualidade?",
                peso: 5,
            },
            {
                id_pergunta: 8,
                codigo: "O08",
                principal: "A empresa acompanha seus prazos de entrega?",
                peso: 5,
            },
            {
                id_pergunta: 9,
                codigo: "O09",
                principal: "Existe planejamento operacional formalizado?",
                peso: 4,
            },
            {
                id_pergunta: 10,
                codigo: "O10",
                principal: "A operação acompanha o crescimento das vendas?",
                peso: 5,
            },
            {
                id_pergunta: 11,
                codigo: "O11",
                principal: "Os gargalos operacionais são identificados regularmente?",
                peso: 4,
            },
            {
                id_pergunta: 12,
                codigo: "O12",
                principal: "Os processos são revisados periodicamente?",
                peso: 4,
            },
        ]
    }
];

const validacao_perguntas = {
    O01: [
        "Existe documentação formal?",
        "Os colaboradores conhecem os processos?",
        "Os processos são atualizados?",
        "Existe controle de versões?"
    ],

    O02: [
        "Existem procedimentos definidos?",
        "Existem checklists?",
        "Existe supervisão?",
        "Existe treinamento?"
    ],

    O03: [
        "Existem indicadores?",
        "Existe acompanhamento?",
        "Existem metas?",
        "Existem comparações históricas?"
    ],

    O04: [
        "Os indicadores são atualizados?",
        "São analisados periodicamente?",
        "Influenciam decisões?",
        "São compartilhados?"
    ],

    O05: [
        "Existe medição?",
        "Existem registros?",
        "Existem planos de correção?",
        "Existem metas de redução?"
    ],

    O06: [
        "Existem indicadores?",
        "Existem metas?",
        "Existem análises periódicas?",
        "Existem ações corretivas?"
    ],

    O07: [
        "Existem critérios de qualidade?",
        "Existem auditorias?",
        "Existem indicadores?",
        "Existem correções estruturadas?"
    ],

    O08: [
        "Existem indicadores de prazo?",
        "Existe histórico?",
        "Existem metas?",
        "Existem análises de atraso?"
    ],

    O09: [
        "Existe programação?",
        "Existe previsão de demanda?",
        "Existe acompanhamento?",
        "Existe revisão periódica?"
    ],

    O10: [
        "Existe análise de capacidade?",
        "Existem gargalos identificados?",
        "Existe planejamento de expansão?",
        "Existe acompanhamento da demanda?"
    ],

    O11: [
        "Existem reuniões de análise?",
        "Existem indicadores?",
        "Existem registros?",
        "Existem planos de ação?"
    ],

    O12: [
        "Existe cronograma de revisão?",
        "Existem melhorias implementadas?",
        "Existe participação da equipe?",
        "Existe documentação das alterações?"
    ]
};

type CodigoGestao = keyof typeof validacao_perguntas
const codigos = Object.keys(validacao_perguntas) as CodigoGestao[]

const Operacoes = () => {

    const { empresa } = useParams()
    const navigate = useNavigate()
    const [codigo, setCodigo] = useState<CodigoGestao>('O01')

    const [respostas, setRespostas] = useState<Respostas[]>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário principal${empresa}`) ?? "[]")
        return data
    })
    
    const indice_atual = codigos.indexOf(codigo)
    const next_bloco = indice_atual < codigos.length - 1
    const back_bloco = indice_atual > 0
    
    const resposta_atual = respostas.find((p) => p.code === codigo)?.resposta
    const progresso = Math.min(Math.round(respostas.filter((p) => codigos.includes(p.code)).length / codigos.length * 100),100)
    
    const [validacoes, setValidacoes] = useState<Record<string, Record<string, string>>>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")
        return data['Operações e Processos'] ?? {}
    })

    const handleAvançar = () => {
        if (!resposta_atual) {
            toast.error("Responda a Pergunta Principal")
            return
        }

        setCodigo(codigos[indice_atual + 1])
    }
        
    const handleBack = () => {
        if (!back_bloco) return;

        setCodigo(codigos[indice_atual - 1])
    }
    
    const handleValidacao = (question: string, resposta : string) => {
        setValidacoes(prev => {
            const dados_atualizado = {
                ...prev, [codigo] : {...prev[codigo],[question] : resposta }
            }

            const data_last = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")

            localStorage.setItem(`Questionário Selah${empresa}`, JSON.stringify({...data_last,"Operações e Processos": dados_atualizado}))

            return dados_atualizado
        })
    }

    const handleSubmit = async() => {
    
        if (!resposta_atual) {
            toast.error("Responda a Pergunta Principal")
            return
        }
    
        const nota = perguntas[0].perguntas.reduce((acc, bloco) => {
            const resposta_Bloco = respostas.find((p) => p.code === bloco.codigo)
            if (!resposta_Bloco) return acc
            return acc + CalcularNota(bloco.peso, resposta_Bloco.resposta)
        },0)

        const dadosAtuais = JSON.parse(localStorage.getItem(`Questionario${empresa}`) 
         ?? JSON.stringify({ pilaresLiberados : [1,2,3,4], respostas : {}}))
        
        dadosAtuais.respostas[4] = {
            nota : nota,
        }

        dadosAtuais.pilaresLiberados = [
         ...new Set([...dadosAtuais.pilaresLiberados, 5]) 
        ]
        
        localStorage.setItem(`Questionario${empresa}`, JSON.stringify(dadosAtuais))

        navigate(`/clientes/form/${empresa}/pessoas`)

    }

    return (
    <div className="flex flex-col py-4 px-24">
            
      <p className="font-extralight font-serif tracking-widest text-xs ">Questionário</p>
      <h1 className="text-gray-950 font-bold font-serif text-3xl  mt-1">Pilar <strong className="text-emerald-500">Operações</strong></h1> 
      <div className="flex flex-col items-center mt-4">

        <div className="flex flex-col py-6 px-4 border border-gray-950 rounded-lg w-full max-w-6xl gap-4">
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
                 
                {perguntas.flatMap((pergunta) => pergunta.perguntas).filter((p) => p.codigo === codigo).map((pergunta) => (
                 <div className="flex justify-between py-4">
                    <p className="text-lg font-serif font-semibold">{pergunta.principal}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setRespostas( prev => {
                       const check = prev.find((p) => p.code === codigo)

                       const atualizado : Respostas[] = check
                       ? prev.map((p) => p.code === codigo ? {...p, resposta : "sim"} : p)
                       : [...prev, {code : codigo, resposta :"sim"}]

                       localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))

                       return atualizado
                     }
                    )} className={resposta_atual === "sim" ? "bg-emerald-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-emerald-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                        Sim
                    </button>
                    <button onClick={() => setRespostas( prev => {
                       const check = prev.find((p) => p.code === codigo)

                       const atualizado : Respostas[] = check
                       ? prev.map((p) => p.code === codigo ? {...p, resposta : "não"} : p)
                       : [...prev, {code : codigo, resposta :"não"}]

                       localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))

                       return atualizado
                     }

                    )} className={resposta_atual === "não" ? "bg-red-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-red-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                        Não
                    </button>
                    <button onClick={() => setRespostas( prev => {
                       const check = prev.find((p) => p.code === codigo)

                       const atualizado : Respostas[] = check
                       ? prev.map((p) => p.code === codigo ? {...p, resposta : "parcial"} : p)
                       : [...prev, {code : codigo, resposta :"parcial"}]

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
                    {validacao_perguntas?.[codigo].map((pergunta) => (
                    <div className="flex items-center justify-between w-full max-w-full" key={pergunta}>
                        <p className="text-sm font-serif font-semibold">{pergunta}</p>
                        <input 
                        type="text"
                        autoComplete="on"
                        className="bg-gray-100/70 border text-xs font-serif border-gray-950 rounded-lg outline-none w-full max-w-lg px-2 py-1"
                        value={validacoes?.[codigo]?.[pergunta] ?? ""}
                        onChange={(e) => handleValidacao(pergunta, e.target.value)}
                        />
                    </div>
                   ))}
                  </div>
                </div>                
             
                 <button onClick={ () => {
                    if (!next_bloco) {
                        handleSubmit()
                    } else {
                        handleAvançar()
                    }
                 }} className=" flex items-center justify-center gap-3 font-serif mt-7 border-2 w-full max-w-6xl rounded-lg border-gray-900 bg-emerald-400 py-3 px-3 hover:bg-emerald-500 hover:text-white">
                    <SaveAll className="h-4 w-4" />
                    {!next_bloco ? "Salvar Respostas" : "Próximo Bloco"}
                 </button>
        
             </div>
             </div>
    )
}

export default Operacoes