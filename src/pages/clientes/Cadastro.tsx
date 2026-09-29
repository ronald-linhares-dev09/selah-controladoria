import { useState } from "react"
import { API_URL } from "../../config/api"
import { CloudCheck} from "lucide-react"
import { toast } from "sonner"
import { formatarCNPJ, formatarCPF, formatarTelefone } from "../../utils/mascaras"


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
   const [sucess, setSucess] = useState(false)
   const [segmento, setSegmento] = useState("")


   const handleSubmit = async () => {

    const endereco = `${rua} - ${numero} - ${complemento}`

    if (!nome || !telefone || !cpf || !email || !empresa || !cnpj || !estado || !cidade || !cep || !rua || !numero) return;

    const token = localStorage.getItem("auth_token")

    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method : "POST",
            headers : {
                "Authorization" : `Bearer ${token}`,
                "Content-Type": "application/json",
            },

            body : JSON.stringify({nome, cpf, telefone, email, empresa, cnpj, segmento, cep, endereco, estado, cidade})
        })

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data?.detail || "Permissão não concedida")
        }

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
        setSucess(true)
        setTimeout( () => setSucess(false), 3000)

    } catch (erro) {
        console.log("Erro ao adicionar dados do cliente",erro)
    }
    }


   
  
    return (
        <div className="flex items-start justify-center mt-2 px-24 py-10">

         <div className="w-full">
            <div className="mb-8">
                <p className="font-serif text-xs text-gray tracking-widest mb-1">Controladoria Estratégica</p>
                <h1 className="font-serif text-3xl text-gray-950 font-bold">Dados do <span className="text-emerald-400">Cliente</span></h1>

            </div>
            
            <div className="bg-800 rounded-2xl p-8 border border-gray-950">
                <p className="text-xs text-gray-800 uppercase tracking-widest mb-4 pb-2 border-b border-gray-700">Informações Pessoais</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                     <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="nome">Nome Completo</label>
                     <input className="rounded-lg text-sm bg-gray-100/70 border border-gray-950 px-3 py-2 text-gray-700 placeholder-gray-600/30 focus:outline-none
                      focus:border-emerald-400" type="text" placeholder="João Mendes" id="nome" onChange={(e) => setNome(e.target.value)}></input>
                    </div>

                    <div className="flex flex-col gap-1">
                     <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="cpf">CPF</label>
                     <input className="rounded-lg text-sm bg-gray-100/70 border border-gray-950 px-3 py-2 text-gray-700
                      placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" type="text" placeholder="000.000.000-00" id="cpf" value={cpf} onChange={(e) => setCPF(formatarCPF(e.target.value))} ></input>
                    </div>

                    <div className="flex flex-col gap-1">
                     <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="telefone">Telefone</label>
                     <input className="rounded-lg text-sm bg-gray-100/70 border border-gray-950 px-3 py-2 text-gray-700
                      placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" type="text" placeholder="(00) 00000-0000" id="telefone" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))}></input>
                    </div>
                    <div className="flex flex-col gap-1">
                     <label className="text-xs text-gray-950 font-medium tracking-wide uppercase" htmlFor="telefone">Email</label>
                     <input className="rounded-lg text-sm bg-gray-100/70 border border-gray-950 px-3 py-2 text-gray-700
                      placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" type="text" placeholder="nome@email.com" id="email"  onChange={(e) => setEmail(e.target.value)}></input>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-950 my-6" />
            <div className="bg-800 rounded-2xl p-8 border border-gray-950">     
                    <p className="text-xs text-gray-800 uppercase tracking-widest mb-4 pb-2 border-b border-gray-950">
                      Dados Empresariais
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="empresa">Nome da Empresa</label>
                            <input type="text" placeholder="Empresa Ltda" id="empresa" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/30 focus:outline-none focus:border-emerald-400" value={nome} onChange={(e) => setEmpresa(e.target.value)}></input>
                        </div>
                    

    
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">CNPJ da Empresa</label>
                            <input type="text" placeholder="00.000.000/0000-00" id="cnpj" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={cnpj} onChange={(e) => setCNPJ(formatarCNPJ(e.target.value))}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Segmento da Empresa</label>
                            <input type="text" placeholder="Varejo" id="cnpj" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={segmento} onChange={(e) => setSegmento(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">CEP</label>
                            <input type="text" placeholder="87200-242" id="cep" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={cep} onChange={(e) => setCEP(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Estado</label>
                            <input type="text" placeholder="Paraná" id="estado" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={estado} onChange={(e) => setEstado(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Cidade</label>
                            <input type="text" placeholder="Cianorte" id="cidade" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={cidade} onChange={(e) => setCidade(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Rua</label>
                            <input type="text" placeholder="Rua Álvares " id="rua" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={rua} onChange={(e) => setRua(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Número</label>
                            <input type="text" placeholder="750" id="numero" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={numero} onChange={(e) => setNumero(e.target.value)}></input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-950 font-medium tracking-widest uppercase" htmlFor="cnpj">Complemento</label>
                            <input type="text" placeholder="Apartamento 30" id="complemento" className="bg-gray-100/70 border border-gray-950 rounded-lg px-3 py-2 text-sm text-gray-950
                             placeholder-gray-600/3 focus:outline-none focus:border-emerald-400" value={complemento} onChange={(e) => setComplemento(e.target.value)}></input>
                        </div>
                    </div>
                    {sucess && (
                        <p className="text-emerald-400 text-sm text-center mb-3">
                            ✓ Cliente Salvo com Sucesso
                        </p>
                    )}
                    <button onClick={handleSubmit} className="w-full py-3 bg-emerald-500 hover:text-white hover:bg-emerald-600 text-black font-semibold rounded-lg text-sm tracking-widest transition-colors flex items-center justify-center gap-4 border-2 border-gray-950">
                        <CloudCheck className="w-4 h-4" />
                        Salvar Dados
                    </button>

            </div>   
         </div>
        </div>
    )
}

export default Cadastro