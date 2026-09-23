import { useState } from "react"
import { API_URL } from "../../config/api"
import { toast } from "sonner"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { SaveAll } from "lucide-react"
import { CalcularNota } from "../../utils/notaPilares"
import { MoveLeft, MoveRight } from "lucide-react"

interface Respostas {
    code : CodigoGestao
    resposta :  "sim" | "não" | "parcial"
}


const perguntas = [
    { 
      id : 1,
      perguntas: [
        {
            id_pergunta : 1,
            codigo : "GE01",
            principal : "A empresa possui Planejamento Estratégico formalizado ?", 
            peso  : 5,
        },
        {
            id_pergunta : 2,
            codigo : "GE02",
            principal : "A empresa possui metas definidas para os próximos 12 meses ?", 
            peso  : 5,
        },
        {
            id_pergunta : 3,
            codigo : "GE03",
            principal : "A empresa acompanha indicadores de desempenho regularmente ?", 
            peso  : 5,
        },
        {
            id_pergunta : 4,
            codigo : "GE04",
            principal : "Existe orçamento anual formalizado ?", 
            peso  : 4,
        },
        {
            id_pergunta : 5,
            codigo : "GE05",
            principal : "As metas são desdobradas para os gestores?", 
            peso  : 4,
        },
        {
            id_pergunta: 6,
            codigo: "GE06",
            principal: "As reuniões de gestão ocorrem com periodicidade definida?",
            peso: 3,
            },
        {
            id_pergunta: 7,
            codigo: "GE07",
            principal: "Os gestores tomam decisões baseadas em indicadores?",
            peso: 5,
        },
        {
            id_pergunta: 8,
            codigo: "GE08",
            principal: "A empresa revisa periodicamente seus resultados e estratégias?",
            peso: 4,
        },
        {
            id_pergunta: 9,
            codigo: "GE09",
            principal: "Os colaboradores conhecem os objetivos da empresa?",
            peso: 4,
        },
        {
            id_pergunta: 10,
            codigo: "GE10",
            principal: "Existe alinhamento entre planejamento, orçamento e execução?",
            peso: 5,
        },
    ]
    }
]

const validacao_perguntas = {   
    GE01 : [ 
            "O planejamento está documentado ?",
            "Existe revisão periódica ?",
            "Os gestores conhecem o planejamento ?", 
            "As metas derivam do planejamento ?"
    ],
    GE02 : [ 
        "As metas são numéricas ?",
        "As metas possuem prazo ?",
        "Existe responsável por cada meta ?", 
        "As metas são acompanhadas ?"
    ],
    GE03 : [
        "Quais indicadores são acompanhados?", 
        "Qual a frequência de análise?",
        "Quem analisa os indicadores?", 
        "Quais decisões são tomadas com base neles?"
    ],
    GE04 : [
        "O orçamento é documentado?",
        "Existe comparação realizado x orçado?",
        "Os gestores participam da construção?",
        "O orçamento é revisado?"
    ],
    GE05 : [
        "Cada gestor possui metas próprias?", 
        "Existe acompanhamento individual?",
        "As metas são conhecidas?", 
        "Existem reuniões de acompanhamento?"
    ],
    GE06: [
        "Existe agenda fixa?",
        "As reuniões possuem pauta?",
        "As decisões são registradas?",
        "Existe acompanhamento dos planos de ação?"
    ],
    GE07: [
        "Quais indicadores sustentam as decisões?",
        "Existe histórico das análises?",
        "Os dados são confiáveis?",
        "As decisões são documentadas?"
    ],
    GE08: [
        "Existe calendário de revisão?",
        "Há análise crítica dos resultados?",
        "São realizadas correções de rota?",
        "As revisões geram planos de ação?"
    ],
    GE09: [
        "Os objetivos são comunicados?",
        "Os líderes reforçam os objetivos?",
        "Os colaboradores sabem suas metas?",
        "Existe alinhamento entre equipes?"
    ],
    GE10: [
        "O orçamento deriva do planejamento?",
        "As metas derivam do orçamento?",
        "Existe acompanhamento integrado?",
        "Há correção de desvios?"
    ]
}

type CodigoGestao = keyof typeof validacao_perguntas

const codigos = Object.keys(validacao_perguntas) as CodigoGestao[]


const Gestao = () => {

    const token = localStorage.getItem("auth_token")

    const { empresa } = useParams()

    const [respostas, setRespostas] = useState<Respostas[]>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário principal${empresa}`) ?? "[]")
        return data
    })
    const navigate = useNavigate()
    const [codigo, setCodigo] = useState<CodigoGestao>("GE01")

    const indiceAtual = codigos.indexOf(codigo)
    const next_bloco = indiceAtual < codigos.length - 1
    const back_bloco = indiceAtual > 0

    const resposta_atual = respostas.find((p) => p.code === codigo)?.resposta 
    
    const progresso = Math.min(Math.round((respostas.filter((p) => codigos.includes(p.code)).length) / codigos.length * 100),100)

    const [validacoes, setValidacoes] = useState<Record<string, Record<string, string>>>(() => {
        const dados = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")
        return dados["Gestão Estratégica"] ?? {}
    })


    const handleAvançar = () => {
            if (!resposta_atual) {
                toast.error("Responda a pergunta principal")
                return;
            } 

            setCodigo(codigos[indiceAtual + 1])
    }

    const handleBack = () => { 
        if (!back_bloco) {
            return;
        }

        setCodigo(codigos[indiceAtual - 1])
    }

    const handleValidacao = (question: string, valor : string) => {
        setValidacoes(prev => {
            const dados_atualizado = {
                ...prev, [codigo] : {...prev[codigo], [question] : valor}
            }
            
            const data_last = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")
            localStorage.setItem(`Questionário Selah${empresa}`, JSON.stringify({...data_last,"Gestão Estratégica": dados_atualizado}))
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
                if (!resposta_Bloco) return acc;
                return acc + CalcularNota(bloco.peso, resposta_Bloco.resposta)
        },0)

        const dadosAtuais = JSON.parse(localStorage.getItem(`Questionario${empresa}`) 
         ?? JSON.stringify({ pilaresLiberados : [1], respostas : {}}))

        dadosAtuais.respostas[1] = {
            nota : nota,
        }

        dadosAtuais.pilaresLiberados = [
            ...new Set([...dadosAtuais.pilaresLiberados,2])
        ]

        localStorage.setItem(`Questionario${empresa}`, JSON.stringify(dadosAtuais))


        try {
                const patch = await fetch(`${API_URL}/status_cliente/${empresa}`, {
                    method:"PATCH",
                    headers: {
                        "Authorization":`Bearer ${token}`,
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({ status : "em_negociacao"})
                })

                if (!patch.ok) {
                    const patch_data = await patch.json()
                    throw new Error(patch_data?.detail || "Erro ao atualizar status do cliente")
                } else {
                    console.log("Dados inseridos com sucesso!")
                    
                    navigate(`/clientes/form/${empresa}/financeiro`)
                    
                }
        } catch (erro) {
                 toast.error(erro instanceof Error ? erro.message : "Erro Interno")
                 console.log(erro)
        }
    }

    return (
    <div className="flex flex-col  py-4 px-24 transition-all">
    
        <p className="font-extralight font-serif tracking-widest text-xs">Questionário</p>
        
        <h1 className="text-gray-950 font-bold font-serif text-3xl  mt-1">Pilar <strong className="text-emerald-500">Gestão Estratégica</strong></h1> 
        
     <div className="flex flex-col items-center mt-4 gap-2">

        <div className="flex flex-col py-6 px-4 border border-gray-950 rounded-lg w-full max-w-6xl gap-4">
            <div className="flex justify-between items-center">
                <button onClick={() => handleBack()} className="flex justify-around items-center gap-2 px-3 border-2 text-gray-400 hover:text-gray-950 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    <MoveLeft className="h-8 w-4 " />
                    <p className="font-serif text-xs font-semibold">Anterior</p>
                </button>

                <div className="flex flex-col items-center gap-1">
                    <h3 className="font-sans text-xl font-semibold uppercase tracking-wider text-gray-950">{codigo}</h3>
                    <h4 className="font-serif text-gray-500 text-sm ">Bloco {indiceAtual + 1} de {codigos.length} </h4>
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
        
       <div className="border rounded-lg border-gray-950 mt-4 px-8 py-8 w-full max-w-6xl">
         <h1 className="font-serif text-2xl border-b border-gray-950 pb-3 mb-5">Pergunta Principal</h1>


         {perguntas.flatMap((p => p.perguntas)).filter((bloco) => bloco.codigo === codigo).map((pergunta) => ( 
         <div className="flex justify-between py-4" key={pergunta.id_pergunta}>
            <p className="text-lg font-serif font-semibold">{pergunta.principal}</p>
           
           <div className="flex gap-2">
             <button  onClick={() => 
                setRespostas(prev => {
                    const check = prev.find((p) => p.code === codigo)

                    const atualizado : Respostas[] = check 
                    ? prev.map((p) => p.code === codigo ? {...p, resposta : "sim"} : p)
                    : [...prev, {code : codigo, resposta : "sim"}]
                       
                    localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))
                    return atualizado
                })}                                    
                className={resposta_atual === "sim" ? "bg-emerald-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-emerald-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                Sim
             </button>
             <button onClick={() => setRespostas( prev => {
                    const check = prev.find((p) => p.code === codigo)

                    const atualizado : Respostas[] = check 
                    ? prev.map((p) => p.code == codigo ? {...p, resposta : "não"} : p)
                    : [...prev, {code : codigo, resposta : "não"}]

                    localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))
                    return atualizado
                })                                    
                } className={resposta_atual === "não" ? "bg-red-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-red-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                Não
             </button>
             <button onClick={() => 
                setRespostas(prev => {
                    const check = prev.find((p) => p.code === codigo)

                    const atualizado : Respostas[] = check
                    ? prev.map((p) => p.code === codigo ? ({...p, resposta : "parcial"}) : p)
                    : [...prev, {code : codigo, resposta : "parcial"}]

                    localStorage.setItem(`Questionário principal${empresa}`, JSON.stringify(atualizado))
                    return atualizado
                })                                    
                } className={resposta_atual === "parcial" ? "bg-yellow-500 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900" : "hover:bg-yellow-500 bg-gray-200 px-2 py-1 text-xs font-semibold rounded-md border border-gray-900"}>
                Parcial
             </button>         
           </div>
                         
         </div>  
        ))}

        </div>      
        
        <div className="border rounded-lg border-gray-950 mt-4 px-8 py-8 w-full max-w-6xl">
            <h1 className="font-serif text-2xl border-b border-gray-950 pb-3 mb-5 mt-4">Perguntas de Validação</h1>
            <div className="flex flex-col  justify-center items-start gap-3">
                {validacao_perguntas[codigo]?.map((question) => (
                 <div className="flex items-center justify-between w-full max-w-full" key={question} >
                  <p className="text-sm font-serif font-semibold">{question}</p>
                  <input type="text" 
                    autoComplete="on"
                    value={validacoes?.[codigo]?.[question] ?? ""}
                    onChange={(e) => 
                        handleValidacao(question, e.target.value)
                    }
                    className="bg-gray-100/70 border text-xs font-serif border-gray-950 rounded-lg outline-none w-full max-w-lg px-2 py-1" />
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
            }} className=" flex items-center justify-center w-full max-w-6xl gap-3 font-serif mt-7 border-2 rounded-lg border-gray-900 bg-emerald-400 py-3 px-3 hover:bg-emerald-500 hover:text-white">
             <SaveAll className="h-4 w-4" />
              {!next_bloco ? "Salvar Respostas" : "Próximo Bloco"}
        </button>
        
     </div>

    </div>
    )
}

export default Gestao