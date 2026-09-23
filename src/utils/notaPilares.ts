type Resposta = "sim" | "não" | "parcial"

const multiplicadores : Record<Resposta, number> = {
    sim : 10,
    não : 0,
    parcial : 3
}

export const CalcularNota = (peso : number, resposta : Resposta) => {
    return peso * multiplicadores[resposta]
}