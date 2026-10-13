import { obter_token } from "../lib/supabase";
import { API_URL } from "../config/api";

export async function request(endpoint : string, options : RequestInit ) {
    const token = await obter_token()
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json',
            ...options.headers
        }
    })

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail)
    }

    if (options.method === 'DELETE') {
        return;
    }

    if ((endpoint.includes('.pdf')) || (endpoint.includes('.xlsx'))) {
        return response
    }

    const data = await response.json()
    return data
    
}