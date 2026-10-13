import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, ANON_KEY } from "../config/api";

export const supabase_cliente = createClient(SUPABASE_URL, ANON_KEY,{ 
    auth : {
        autoRefreshToken : true,
        persistSession : true
    }}
)

export async function auth_login (email : string, senha : string) {
    const { data : authData, error : authError } = await supabase_cliente.auth.signInWithPassword({
        email : email,
        password : senha
    })

    if (!authData.session || authError) {
        throw new Error(authError?.message ?? "Erro ao efetuar login" )
    }
}

export async function obter_token() {
    const {data : {session}, error} = await supabase_cliente.auth.getSession();

    if (!session || error) {
        throw new Error(error?.message ?? "Erro ao obter token")
    }

    const token = session.access_token

    return token
}

export async function auth_logout(   ) {
    const {error} = await supabase_cliente.auth.signOut({scope : 'global'})

    if (error) {
        throw new Error(error.message)
    }
    
}