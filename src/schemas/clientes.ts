export interface ClienteUpdate {
    nome : string
    cpf : string
    telefone : string
    email : string
    empresa : string
    segmento : string
    cnpj : string
    cep : string
    estado : string
    cidade : string
    endereco : string
    status : string
}

export interface Cliente {
    id : string
    nome : string
    cpf : string
    telefone : string
    email : string
    empresa : string
    segmento : string
    cnpj : string
    cep : string
    estado : string
    cidade : string
    endereco : string
    status : string
}

export interface ClienteFiltrado {
    empresas : [string]
    clientes : Cliente[]
}