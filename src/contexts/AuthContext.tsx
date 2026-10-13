import { createContext, useEffect, useState, useContext } from "react";
import type { ReactNode } from "react";
import { API_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { auth_login, auth_logout, obter_token, supabase_cliente } from "../lib/supabase";
import { toast } from "sonner";

interface AuthUser {
    nome : string;
    email : string;
}

interface AuthContextType {
    user : AuthUser | null;
    loading : boolean;
    login : (email : string, senha :string) => Promise<void>;
    logout : () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider( {children} : {children : ReactNode}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    const navigate = useNavigate()

    const fetchPlano = async () => {
        const token = await obter_token()
        const response = await fetch(`${API_URL}/dados_user`, {
                method:"GET",        
                headers:{
                         "Authorization" : `Bearer ${token}`
                        }
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data?.detail ?? "Erro ao buscas dados do usuário")
        } 

        const data = await response.json()
        setUser({nome : data.nome, email : data.email})
    }


    const login = async (email : string, senha : string) => {
        try {
            await auth_login(email, senha)
            await fetchPlano()
            navigate("/menu")

        } catch (erro) {
            console.error(erro)
            toast.error(erro instanceof Error ? erro.message : "Credenciais Inválidas")
        }
    };


    useEffect(() => {
        try {
            const { data : { subscription }} = supabase_cliente.auth.onAuthStateChange(async (event) => {
                switch(event) {
                    case 'TOKEN_REFRESHED':
                        console.log('Token renovado')
                        break;
                    case 'SIGNED_IN' :
                        console.log('Usuário logado')
                        break;
                    case 'SIGNED_OUT' :
                        console.log('Logout do usuário')
                        break;
                    case 'INITIAL_SESSION' :
                        console.log('Sessão recuperada')
                        await fetchPlano()
                        navigate("/menu")
                        break
                }
            })
            return () => subscription.unsubscribe();
        } finally {
            setLoading(false)
        }
    }, []);

    const logout = async() => {
        try {
            await auth_logout()
        } catch (erro) {
            toast.error('Erro no logout')
            console.error(erro)
        }
        setUser(null)
        navigate("/login")
    }


    return (
        <AuthContext.Provider value={{login, logout, user, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("Useauth precisa estar dentro do AuthContextProvider")
    }

    return context
}