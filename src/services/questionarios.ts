import { request } from "../core/core";
import type { DadosIndicadores, DadosValidacao, Questionario, QuestionarioRead } from "../schemas/questionarios";

export async function criar_questionario(questionario : Questionario) {
    const query = await request('/v1/questionarios', {method : 'POST', body : JSON.stringify(questionario)})

    return query
}

export async function obter_questionario(cliente_id : string) : Promise<QuestionarioRead> {
    const query = await request(`/v1/questionarios/${cliente_id}/notas`, {method : 'GET'})

    return query
}

export async function atualizar_conclusao(conclusao : string, cliente_id : string) {
    const query = await request(`/v1/questionarios/${cliente_id}/data_conclusao`, {method : 'PATCH', body: JSON.stringify({ conclusao : conclusao })})
    
    return query
}

export async function obter_pdf(dados : DadosIndicadores, cliente_id : string) {
    const pdf = await request(`/v1/questionarios/${cliente_id}/relatorio.pdf`, {method : 'POST', body : JSON.stringify(dados)})
    
    return pdf 
}

export async function obter_planilha(cliente_id : string, dados : DadosValidacao) {
    const planilha = await request(`/v1/questionarios/${cliente_id}/planilha.xlsx`, { method : 'POST', body: JSON.stringify(dados)})
    
    return planilha
}