export interface Questionario {
    cliente_id : string
    empresa : string
    notas : Record<string, Record<string,number>>
}

export interface QuestionarioRead {
    conclusao : string
    updated_at : string
    notas : Record<string, {nota : number}>
}

interface IMS {
    geral : { valor : number, classificacao : string }
    mais_fragil : { nome : string, valor : number, classificacao : string }
    mais_maduro : { nome : string , valor : number, classificacao : string }
}

interface ICS {
    geral : { valor : number, classificacao : string }
    mais_fragil : { nome : string, valor : number, classificacao : string }
    mais_saudavel : { nome : string , valor : number, classificacao : string }
}

export interface DadosIndicadores {
    empresa : string
    ims : IMS
    ics : ICS
    conclusao : string
}

export interface DadosValidacao {
    empresa : string
    validacao : Record<string, Record<string, string>>
}
