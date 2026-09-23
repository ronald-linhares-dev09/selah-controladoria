import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import logo from "../assets/Videira (7).png"
import { LogIn } from "lucide-react"


const Login = () => {
 const [email, setEmail] = useState("")
 const [senha, setSenha] = useState("")
 const [loading, setLoading] = useState(false)
 const { login } = useAuth()
 const navigate = useNavigate()

 const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {

    e.preventDefault()
    if (!email || !senha) return;  

    setLoading(true)
    try {

        await login(email, senha)
        console.log("Login realizado com Sucesso!")
        navigate("/menu")
        console.log("Navigate 2 Chamado")

    } catch(erro) {
        console.log("Credenciais Inválidas")
    } finally {
        setLoading(false)
    }
   
 }

 return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-8 py-20">
            <div className="flex flex-col bg-slate-50 border-2 inset-shadow-2xl shadow-emerald-500 border-emerald-500 text-black rounded-2xl w-full max-w-lg px-8  items-center ">
                <img src={logo} className="h-64 w-64 " alt="logoVideira"/>
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-base font-semibold" htmlFor="email">Email</label>
                        <input className="w-full text-sm rounded-2xl p-3 shadow-2xs  border focus:border-2 border-gray-500 focus:outline-none focus:border-emerald-400" id="email" type="email" required placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <label className="text-base font-semibold"  htmlFor="senha">Senha</label>
                        <input className="w-full text-sm rounded-2xl shadow-2xs p-3  border focus:border-2 border-gray-500 focus:outline-none focus:border-emerald-400"   id="senha" type="password" required placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>
                    <div className="mt-5 mb-3 flex justify-center">
                     <button type="submit" className=" font-semibold text-sm font-sans bg-emerald-400 hover:bg-emerald-500 text-gray-950  transition-colors py-3 w-full max-w-xs rounded-xl flex items-center justify-center gap-3">
                        {loading ? (
                         <div className="flex gap-4 items-center">
                            <div className=" w-4 h-4 animate-spin rounded-full border-t-gray-950 border-t-2 border-2 border-gray-500/30"/>
                            <p>Carregando</p>
                         </div>
                        ) : (
                         <div className="flex gap-4 items-center">
                            <LogIn className="w-4 h-4" />
                            <p>Fazer Login</p>
                         </div>
                        )}
                    </button>
                        
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login