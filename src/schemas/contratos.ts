export interface Contrato {
    cliente_id : string
    valor_mensal : string
    forma_pagamento : string
    tempo_contrato : string
}

export interface ContratoRead {
    cliente_id : string
    valor_mensal : string
    tempo_contrato : string
    forma_pagamento : string
    created_at : string
}