import { useRef, useState } from "react"
import { CloudCheck} from "lucide-react"
import { toast } from "sonner"
import { formatarCNPJ, formatarCPF, formatarTelefone } from "../../utils/mascaras"
import { formatarCEP } from "../../utils/mascaras"
import { criar_cliente } from "../../services/clientes"
import type { Cliente } from "../../schemas/clientes"


const Cadastro = () => {
   const [nome, setNome] = useState("")
   const [telefone, setTelefone] = useState("")
   const [cpf, setCPF] = useState("")
   const [email, setEmail] = useState("")
   const [empresa, setEmpresa] = useState("")
   const [cnpj, setCNPJ] = useState("")
   const [estado, setEstado] = useState("")
   const [cidade, setCidade] = useState("")
   const [cep, setCEP] = useState("")
   const [rua, setRua] = useState("")
   const [numero, setNumero] = useState("")
   const [complemento, setComplemento] = useState("")
   const [segmento, setSegmento] = useState("")

   const [sucess, setSucess] = useState<"ok" | "fail" | null>(null)
   const [buscaCEP, setBuscaCEP] = useState<boolean>(false)
   const focus = useRef<HTMLInputElement>(null)


   const handleSubmit = async () => {

    const endereco = `${rua} - ${numero} - ${complemento}`

    if (!nome || !telefone || !cpf || !email || !empresa || !cnpj || !estado || !cidade || !cep || !rua || !numero) return;


    try {
        await criar_cliente({
            nome : nome, 
            cpf : cpf, 
            telefone : telefone,
            email : email, 
            empresa : empresa, 
            cnpj : cnpj, 
            segmento : segmento, 
            cep : cep, 
            endereco : endereco, 
            estado : estado, 
            cidade : estado
        } as Cliente)

        toast.success("Cliente adicionado com sucesso")
        setNome("")
        setTelefone("")
        setCPF("")
        setEmail("")
        setEmpresa("")
        setCNPJ("")
        setEstado("")
        setCidade("")
        setCEP("")
        setRua("")
        setNumero("")
        setComplemento("")
        setSegmento("")
        setSucess(null)

    } catch (erro) {
        console.log("Erro ao adicionar dados do cliente",erro)
        toast.error(erro instanceof Error ? erro.message : "Erro ao adicionar cliente")
    }
    }

    const queryCEP = async(cep_formatado : string) => {
        const response = await fetch(`https://viacep.com.br/ws/${cep_formatado}/json/`)

        if (!response.ok) {
            throw new Error('CEP em formato inválido')
        }

        const data_CEP = await response.json();

        if (data_CEP.erro) {
            throw new Error('CEP não encontrado')
        }

        setCidade(data_CEP.localidade)
        setEstado(data_CEP.estado)
        setRua(data_CEP.logradouro)
        setCEP(data_CEP.cep)

    }

    const handleChangeCEP = async (e : React.ChangeEvent<HTMLInputElement>) => {
        const cep_formatado = formatarCEP(e.target.value);
        setCEP(cep_formatado);

        if (cep_formatado.length === 8) {
            try {
                setBuscaCEP(true)
                await queryCEP(cep_formatado)

                if (!focus.current) {
                    return;
                }
                setSucess("ok")
                focus.current.focus()
            } catch (erro) {
                setSucess("fail")
                toast.error(erro instanceof Error ? erro.message : "CEP não encontrado")
                console.error(erro)

            } finally {
                setBuscaCEP(false)
            }
        }  else {
            setRua("")
            setCidade("")
            setEstado("")
            setSucess(null)
        }
    }


   
  
    return (
        <div className="flex flex-col w-full">

            <div className="px-10 pt-10 pb-7">
                <p className="font-bold uppercase text-gray-500 font-serif tracking-widest text-[10px]">Controladoria Estratégica</p>
                <h1 className="font-serif text-3xl text-gray-950 font-bold">Dados do <span className="text-emerald-400">Cliente</span></h1>
            </div>

         <section className="bg-gray-100 px-10 py-10 flex flex-col h-screen min-h-screen gap-4 flex-1">

            <div className="bg-800 rounded-2xl p-8 border flex justify-between border-gray-950 bg-white">
              <div className="flex flex-col items-start">
                <h3 className="text-2xl font-bold tracking-wider font-sans text-gray-950">Contato</h3>
                <p className=" text-gray-500 font-sans text-[12px]">Responsável pela empresa</p>
              </div>

                <div className="flex flex-col gap-4 mb-4 w-full max-w-3xl">

                <div className="flex gap-4">
                    <div className="flex flex-col gap-1 basis-2/3">
                     <label className="text-[10px] text-gray-950 font-medium tracking-wide uppercase" htmlFor="nome">Nome Completo</label>
                     <input className="rounded-lg text-[12px] bg-white border border-gray-950 px-3 py-2 text-gray-700 placeholder-gray-600/30 focus:outline-none
                      focus:border-emerald-400" type="text" placeholder="João Mendes" value={nome} id="nome" onChange={(e) => setNome(e.target.value)}></input>
                    </div>

                    <div className="flex flex-col gap-1 basis-1/3">
                     <label className="text-[10px] text-gray-950 font-medium tracking-wide uppercase" htmlFor="cpf">CPF</label>
                     <input className="rounded-lg text-[12px] bg-white border border-gray-950 px-3 py-2 text-gray-700
                      placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" type="text" placeholder="000.000.000-00" id="cpf" value={cpf} onChange={(e) => setCPF(formatarCPF(e.target.value))} ></input>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col gap-1 basis-2/3">
                     <label className="text-[10px] text-gray-950 font-medium tracking-wide uppercase" htmlFor="telefone">Telefone</label>
                     <input className="rounded-lg text-[12px] bg-white border border-gray-950 px-3 py-2 text-gray-700
                      placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" type="text" placeholder="(00) 00000-0000" id="telefone" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))}></input>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                     <label className="text-[10px] text-gray-950 font-medium tracking-wide uppercase" htmlFor="telefone">Email</label>
                     <input className="rounded-lg text-[12px] bg-white border border-gray-950 px-3 py-2 text-gray-700
                      placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" value={email} type="text" placeholder="nome@email.com" id="email"  onChange={(e) => setEmail(e.target.value)}></input>
                    </div>
                </div>

                </div>
            </div>

            <div className="bg-800 rounded-2xl p-8 border border-gray-950 flex justify-between bg-white">     
                   <div className="flex flex-col items-start">
                       <h3 className="text-2xl font-bold tracking-wider font-sans text-gray-950">Empresa</h3>
                        <p className=" text-gray-500 font-sans text-[12px]">Informações a respeito da empresa analisada</p>
                   </div>

                    <div className="flex flex-col gap-4 mb-6 w-full max-w-3xl">

                     <div className="flex gap-4">
                        <div className="flex flex-col gap-1 basis-1/3">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="empresa">Nome da Empresa</label>
                            <input type="text" placeholder="Empresa Ltda" id="empresa" className="bg-white border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" value={empresa} onChange={(e) => setEmpresa(e.target.value)}></input>
                        </div>
                    
                        <div className="flex flex-col gap-1 basis-2/3">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">CNPJ da Empresa</label>
                            <input type="text" placeholder="00.000.000/0000-00" id="cnpj" className="bg-white border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={cnpj} onChange={(e) => setCNPJ(formatarCNPJ(e.target.value))}></input>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Segmento da Empresa</label>
                            <input type="text" placeholder="Varejo" id="cnpj" className="bg-white border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={segmento} onChange={(e) => setSegmento(e.target.value)}></input>
                     </div>
                    </div>
            </div>

            <div className="rounded-2xl p-8 border flex justify-between border-gray-950 bg-white">
                <div className="flex flex-col items-start">
                  <h3 className="text-2xl font-bold tracking-wider font-sans text-gray-950">Endereço</h3>
                  <p className=" text-gray-500 font-sans text-[12px]">Informe o CEP</p>
                </div>

                <div className="flex flex-col gap-4 mb-4 w-full max-w-3xl">
                        <div className="flex flex-col gap-1 w-full max-w-fit relative">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">CEP</label>
                            <input maxLength={8} readOnly={buscaCEP} type="text" placeholder="87200-242" id="cep" className="bg-white border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={cep}
                              onChange={handleChangeCEP}>
                            </input>
                            <p className={`absolute text-xs opacity-0 transition-opacity top-1/2 right-2
                                ${sucess === "ok" ? "text-emerald-500 opacity-100" : sucess === "fail" ? "text-red-600 opacity-100" : ""}`}>
                                {sucess === "ok" ?"✓" : sucess === "fail" ? "✕" : ""}
                            </p>
                        </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 basis-11/12">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Cidade</label>
                            <input type="text" placeholder="Cianorte" id="cidade" className="bg-gray-100/50 border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={cidade} onChange={(e) => setCidade(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1 basis-1/12">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Estado</label>
                            <input type="text" placeholder="Paraná" id="estado" className="bg-gray-100/50 border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={estado} onChange={(e) => setEstado(e.target.value)}></input>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 basis-11/12">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Rua</label>
                            <input type="text" placeholder="Rua Álvares " id="rua" className="bg-gray-100/50 border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={rua} onChange={(e) => setRua(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1 basis-1/12">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Número</label>
                            <input ref={focus} type="text" placeholder="750" id="numero" className="bg-white border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={numero} onChange={(e) => setNumero(e.target.value)}></input>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                            <label className="text-[10px] text-gray-950 font-medium tracking-widest uppercase flex gap-1 items-center" htmlFor="cnpj">Complemento<span className="text-[6px]  text-gray-700">(opcional)</span></label>
                            <input type="text" placeholder="Apartamento 30" id="complemento" className="bg-white border border-gray-950 rounded-lg px-3 py-2 text-[12px] text-gray-700
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={complemento} onChange={(e) => setComplemento(e.target.value)}></input>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button onClick={handleSubmit} className=" bg-white border-gray-500 border-2 px-3 py-2 font-sans text-gray-700 font-bold rounded-lg text-[10px] tracking-widest transition-colors">
                        Limpar Dados
                </button>

                <button onClick={handleSubmit} className="px-3 py-2 bg-emerald-500 hover:text-white hover:bg-emerald-600 text-black font-bold rounded-lg text-[10px] tracking-widest transition-colors flex items-center justify-center gap-4 border-2 border-gray-950">
                        <CloudCheck className="w-4 h-4" />
                        Salvar Dados
                </button>
            </div>
         </section>
        </div>
    )
}

export default Cadastro