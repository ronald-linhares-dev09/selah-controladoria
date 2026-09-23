import { useState } from "react"
import { SaveAll,MoveLeft, MoveRight } from "lucide-react"
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
        id: 5,
        perguntas: [
            {
                id_pergunta: 1,
                codigo: "P01",
                principal: "Existe organograma formalizado?",
                peso: 4,
            },
            {
                id_pergunta: 2,
                codigo: "P02",
                principal: "As funções e responsabilidades estão claramente definidas?",
                peso: 5,
            },
            {
                id_pergunta: 3,
                codigo: "P03",
                principal: "Existe processo estruturado de recrutamento e seleção?",
                peso: 4,
            },
            {
                id_pergunta: 4,
                codigo: "P04",
                principal: "Existe treinamento estruturado para novos colaboradores?",
                peso: 4,
            },
            {
                id_pergunta: 5,
                codigo: "P05",
                principal: "A empresa realiza treinamentos periódicos?",
                peso: 4,
            },
            {
                id_pergunta: 6,
                codigo: "P06",
                principal: "Os líderes acompanham regularmente o desempenho das equipes?",
                peso: 5,
            },
            {
                id_pergunta: 7,
                codigo: "P07",
                principal: "Existe avaliação formal de desempenho?",
                peso: 4,
            },
            {
                id_pergunta: 8,
                codigo: "P08",
                principal: "A empresa acompanha indicadores relacionados às pessoas?",
                peso: 4,
            },
            {
                id_pergunta: 9,
                codigo: "P09",
                principal: "Existe comunicação interna estruturada?",
                peso: 4,
            },
            {
                id_pergunta: 10,
                codigo: "P10",
                principal: "A cultura organizacional está claramente definida?",
                peso: 4,
            },
            {
                id_pergunta: 11,
                codigo: "P11",
                principal: "Existe plano de desenvolvimento para líderes?",
                peso: 4,
            },
            {
                id_pergunta: 12,
                codigo: "P12",
                principal: "As metas dos colaboradores estão conectadas aos objetivos da empresa?",
                peso: 5,
            },
        ]
    }
];

const validacao_perguntas = {
    P01: [
        "O organograma está documentado?",
        "É conhecido pelos colaboradores?",
        "Está atualizado?",
        "Define claramente as lideranças?"
    ],

    P02: [
        "Existem descrições de cargo?",
        "Os colaboradores conhecem suas atribuições?",
        "Existe alinhamento entre líderes e equipes?",
        "As responsabilidades são revisadas periodicamente?"
    ],

    P03: [
        "Existe perfil definido para as vagas?",
        "Existe processo seletivo padronizado?",
        "Existe avaliação dos candidatos?",
        "Existe histórico das contratações?"
    ],

    P04: [
        "Existe programa de integração?",
        "Existe material de apoio?",
        "Existe acompanhamento inicial?",
        "Existe avaliação do treinamento?"
    ],

    P05: [
        "Existe calendário de treinamentos?",
        "Existe orçamento?",
        "Existe controle de participação?",
        "Existe avaliação de eficácia?"
    ],

    P06: [
        "Existem reuniões individuais?",
        "Existem feedbacks frequentes?",
        "Existem metas individuais?",
        "Existem registros das avaliações?"
    ],

    P07: [
        "Existe metodologia definida?",
        "Existe periodicidade?",
        "Existe plano de desenvolvimento?",
        "Os resultados são discutidos?"
    ],

    P08: [
        "Existe indicador de turnover?",
        "Existe indicador de absenteísmo?",
        "Existe indicador de produtividade?",
        "Existe análise periódica?"
    ],

    P09: [
        "Existem reuniões periódicas?",
        "Existem canais oficiais?",
        "Existe registro das comunicações?",
        "Os colaboradores compreendem as informações?"
    ],

    P10: [
        "Missão definida?",
        "Visão definida?",
        "Valores definidos?",
        "Os colaboradores conhecem?"
    ],

    P11: [
        "Existem treinamentos específicos?",
        "Existem mentorias?",
        "Existe acompanhamento dos líderes?",
        "Existe plano de sucessão?"
    ],

    P12: [
        "Existem metas individuais?",
        "Existe acompanhamento?",
        "Existe reconhecimento?",
        "Existe alinhamento com indicadores da empresa?"
    ]
};

type CodigoGestao = keyof typeof validacao_perguntas

const codigos = Object.keys(validacao_perguntas) as CodigoGestao[]

const People = () => {
    
    const { empresa } = useParams()

    const [respostas, setRespostas] = useState<Respostas[]>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário principal${empresa}`) ?? "[]")
        return data
    })
    const navigate = useNavigate()
    const [codigo, setCodigo] = useState<CodigoGestao>('P01')
    
    const indice_atual = codigos.indexOf(codigo)
    const next_bloco = indice_atual < codigos.length - 1
    const back_bloco = indice_atual > 0
    
    const resposta_atual = respostas.find((p) => p.code === codigo)?.resposta
    const progresso = Math.min(Math.round(respostas.filter((p)=> codigos.includes(p.code)).length / codigos.length * 100),100)
    
    const [validacoes, setValidacoes] = useState<Record<string, Record<string, string>>>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")
        return data['Pessoas'] ?? {}
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

    const handleValidacao = (question : string, resposta : string) => {
        setValidacoes(prev => {
            const dados_atualizado = {
                ...prev, [codigo] : {...prev[codigo], [question] : resposta}
            }

            const data_last = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")

            localStorage.setItem(`Questionário Selah${empresa}`, JSON.stringify({...data_last,"Pessoas": dados_atualizado}))

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
             ?? JSON.stringify({ pilaresLiberados : [1,2,3,4,5], respostas : {}}))
            
            dadosAtuais.respostas[5] = {
                nota : nota,
            }
    
            dadosAtuais.pilaresLiberados = [
              ...new Set([...dadosAtuais.pilaresLiberados, 6]) 
            ]
            
            localStorage.setItem(`Questionario${empresa}`, JSON.stringify(dadosAtuais))
    
            navigate(`/clientes/form/${empresa}/clientesexperiencia`)
        }
    
        return (
        <div className="flex flex-col py-4 px-24 ">
                
            <p className="font-extralight font-serif tracking-widest text-xs ">Questionário</p>
            <h1 className="text-gray-950 font-bold font-serif text-3xl  mt-1">Pilar <strong className="text-emerald-500">Pessoas e Liderança</strong></h1> 
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
                 
                <button onClick={() => {
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

export default People