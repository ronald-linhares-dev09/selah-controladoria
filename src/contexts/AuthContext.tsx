import { createContext, useEffect, useState, useContext } from "react";
import type { ReactNode } from "react";
import { API_URL } from "../config/api";
import { useNavigate } from "react-router-dom";

interface AuthUser {
    nome : string;
    email : string;
}

interface AuthContextType {
    user : AuthUser | null;
    loading : boolean;
    token : string | null;
    login : (email : string, senha :string) => Promise<void>;
    logout : () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider( {children} : {children : ReactNode}) {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    const navigate = useNavigate()

    const fetchPlano = async (token : string) => {
         try {
            const response = await fetch(`${API_URL}/dados_user`, {
                method:"GET",        
                headers:{
                         "Authorization" : `Bearer ${token}`
                        }
            }

            );

            if (response.ok) {
                const data = await response.json()
                setUser({nome : data.nome, email : data.email});
                setToken(token)
            } else {
                localStorage.removeItem("auth_token")
            }
         } catch (erro) {
            console.log("Erro ao buscar dados",erro)
            localStorage.removeItem("auth_token")
         } finally {
            setLoading(false)
         }};
    
    // Fetch para Login

    const login = async (email : string, senha : string) => {
        const response = await fetch(`${API_URL}/login`, {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({email, senha})}
        )

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.detail || "Credenciais Inválidas")
        }

        const data = await response.json()
        console.log("Token salvo", data.token? "presente" : "ausente")
        console.log("Dados",data)

        // Save do token para que ele persista entre as sessões
        localStorage.setItem("auth_token", data.token)
        console.log("Token Salvo com sucesso no LocalStorage")
        //setUser({nome : data.nome, email: data.email})

        await fetchPlano(data.token)
        navigate("/menu")
        console.log("Navigate acionado")
    };

    // Função logout

    useEffect(() => {
     const tokenSalvo = localStorage.getItem("auth_token")

     if (tokenSalvo) {
        fetchPlano(tokenSalvo)
     } else {
        setLoading(false)
     }
    }, []);

    const logout = () => {
        localStorage.removeItem("auth_token")
        setToken(null)
        setUser(null)
        navigate("/login")
    }


    return (
        <AuthContext.Provider value={{user, loading, token, login, logout}}>
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