import { useState } from "react"
import { SaveAll, MoveLeft, MoveRight } from "lucide-react"
import { toast } from "sonner"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { CalcularNota } from "../../utils/notaPilares"

interface Respostas {
    code : Codigos
    resposta : "sim" | "não" | "parcial"
}

const perguntas = [
    {
        id: 3,
        perguntas: [
            {
                id_pergunta: 1,
                codigo: "C01",
                principal: "A empresa possui metas comerciais definidas?",
                peso: 5,
            },
            {
                id_pergunta: 2,
                codigo: "C02",
                principal: "As metas comerciais são acompanhadas regularmente?",
                peso: 5,
            },
            {
                id_pergunta: 3,
                codigo: "C03",
                principal: "A empresa acompanha sua taxa de conversão de vendas?",
                peso: 5,
            },
            {
                id_pergunta: 4,
                codigo: "C04",
                principal: "A empresa acompanha seu Ticket Médio?",
                peso: 4,
            },
            {
                id_pergunta: 5,
                codigo: "C05",
                principal: "A empresa acompanha clientes ativos e inativos?",
                peso: 4,
            },
            {
                id_pergunta: 6,
                codigo: "C06",
                principal: "Existe acompanhamento do Funil de Vendas?",
                peso: 5,
            },
            {
                id_pergunta: 7,
                codigo: "C07",
                principal: "A empresa possui processo comercial definido?",
                peso: 5,
            },
            {
                id_pergunta: 8,
                codigo: "C08",
                principal: "Existe rotina estruturada de prospecção?",
                peso: 5,
            },
            {
                id_pergunta: 9,
                codigo: "C09",
                principal: "A empresa mede retenção de clientes?",
                peso: 5,
            },
            {
                id_pergunta: 10,
                codigo: "C10",
                principal: "A empresa possui previsibilidade de faturamento?",
                peso: 5,
            },
            {
                id_pergunta: 11,
                codigo: "C11",
                principal: "As metas comerciais estão conectadas ao orçamento financeiro?",
                peso: 5,
            },
            {
                id_pergunta: 12,
                codigo: "C12",
                principal: "A equipe comercial recebe acompanhamento e feedback contínuo?",
                peso: 4,
            },
        ]
    }
];

const validacao_perguntas = {
    C01: [
        "As metas são numéricas?",
        "Possuem prazo definido?",
        "São conhecidas pela equipe?",
        "São acompanhadas periodicamente?"
    ],

    C02: [
        "Existe rotina de acompanhamento?",
        "Existem reuniões comerciais?",
        "Existem planos de ação?",
        "Existem responsáveis definidos?"
    ],

    C03: [
        "Existe controle de propostas?",
        "Existe acompanhamento de conversão?",
        "Existem metas de conversão?",
        "Existem análises por vendedor?"
    ],

    C04: [
        "Existe indicador de Ticket Médio?",
        "Existe histórico de evolução?",
        "O indicador influencia decisões?",
        "Existe meta para aumento do ticket?"
    ],

    C05: [
        "Existe cadastro atualizado?",
        "Existem critérios de inatividade?",
        "Existe plano de recuperação?",
        "Existe acompanhamento periódico?"
    ],

    C06: [
        "Existe CRM?",
        "Existem etapas definidas?",
        "O funil é atualizado?",
        "Existe análise de gargalos?"
    ],

    C07: [
        "Existe processo documentado?",
        "Existe treinamento?",
        "Existe padrão de abordagem?",
        "Existe padrão de negociação?"
    ],

    C08: [
        "Existe meta de prospecção?",
        "Existe controle de contatos?",
        "Existe acompanhamento?",
        "Existe geração contínua de leads?"
    ],

    C09: [
        "Existe indicador de retenção?",
        "Existe histórico?",
        "Existem metas?",
        "Existe análise das perdas?"
    ],

    C10: [
        "Existe previsão mensal?",
        "Existe histórico de acuracidade?",
        "Existe acompanhamento?",
        "Existe correção de desvios?"
    ],

    C11: [
        "O orçamento utiliza metas comerciais?",
        "Existe alinhamento entre áreas?",
        "Existem reuniões conjuntas?",
        "Existem indicadores compartilhados?"
    ],

    C12: [
        "Existem reuniões individuais?",
        "Existem feedbacks formais?",
        "Existe treinamento?",
        "Existem planos de desenvolvimento?"
    ]
};

type Codigos = keyof typeof validacao_perguntas

const codigos = Object.keys(validacao_perguntas) as Codigos[]


const Comercial = () => {

    const { empresa } = useParams()

    const [respostas, setRespostas] = useState<Respostas[]>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário principal${empresa}`) ?? "[]")
        return data
    })
    const navigate = useNavigate()
    const [codigo, setCodigo] = useState<Codigos>('C01')

    const indice_atual = codigos.indexOf(codigo)
    const next_bloco = indice_atual < codigos.length - 1
    const back_bloco = indice_atual > 0

    const resposta_atual = respostas.find((p) => p.code === codigo)?.resposta
    const progresso = Math.min(Math.round(respostas.filter((p) => codigos.includes(p.code)).length / codigos.length * 100),100)

    const [validacoes, setValidacoes] = useState<Record<string, Record<string, string>>>(() => {
        const data = JSON.parse(localStorage.getItem(`Questionário Selah${empresa}`) ?? "{}")
        return data['Comercial'] ?? {}
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

            localStorage.setItem(`Questionário Selah${empresa}`, JSON.stringify({...data_last,"Comercial": dados_atualizado}))

            return dados_atualizado
        })
    }
    const handleSubmit = async() => {

        if (!resposta_atual) {
            toast.error("Responda a Pergunta Principal")
            return
        }

        console.log(localStorage.getItem(`Questionário Selah${empresa}`))

        const nota = perguntas[0].perguntas.reduce((acc, p) => {
            const resposta_Bloco = respostas.find((resp) => resp.code === p.codigo)
            if (!resposta_Bloco) return acc;
            return acc + CalcularNota(p.peso, resposta_Bloco.resposta)          
        },0)

        const dadosAtuais = JSON.parse(localStorage.getItem(`Questionario${empresa}`) 
         ?? JSON.stringify({ pilaresLiberados : [1,2,3], respostas : {}}))

        dadosAtuais.respostas[3] = {
            nota : nota,
        }

        dadosAtuais.pilaresLiberados = [
          ...new Set([...dadosAtuais.pilaresLiberados, 4]) 
        ]

        localStorage.setItem(`Questionario${empresa}`, JSON.stringify(dadosAtuais))

        navigate(`/clientes/form/${empresa}/operacoes`)


    }

    return (
    <div className="flex flex-col py-4 px-24">
        
         <p className="font-extralight font-serif tracking-widest text-xs ">Questionário</p>
         <h1 className="text-gray-950 font-bold font-serif text-3xl  mt-1">Pilar <strong className="text-emerald-500">Comercial</strong></h1> 
         <div className="flex flex-col items-center mt-4">
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
                }
                else {
                    handleAvançar()
                }
            }}
                className=" flex items-center justify-center gap-3 font-serif mt-7 border-2 w-full max-w-6xl rounded-lg border-gray-900 bg-emerald-400 py-3 px-3 hover:bg-emerald-500 hover:text-white">
                <SaveAll className="h-4 w-4" />
                {!next_bloco ? "Salvar Respostas" : "Próximo Bloco"}
             </button>
    
         </div>
         </div>
    
    )
}

export default Comercial