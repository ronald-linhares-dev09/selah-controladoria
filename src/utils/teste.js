const parcial_total = [
  { number : "1", max : 440, nome : "Gestão Estratégica"}, 
  { number : "2", max : 570, nome : "Financeiro"}, 
  { number : "3", max : 570, nome : "Comercial"},
  { number : "4", max : 560, nome : "Operações e Processos"}, 
  { number : "5", max : 510, nome : "Pessoas"}, 
  { number : "6", max : 580, nome : "Clientes e Experiência"}, 
  { number : "7", max : 530, nome : "Tecnologia" }
]

const notas = {
  "1": {
    "nota": 211
  },
  "2": {
    "nota": 285
  },
  "3": {
    "nota": 232
  },
  "4": {
    "nota": 532
  },
  "5": {
    "nota": 159
  },
  "6": {
    "nota": 192
  },
  "7": {
    "nota": 274
  }
}

const indicador = parcial_total.reduce((acc, pilar) => { 
        const valor = Math.min(Math.round(notas[pilar.number].nota / pilar.max * 100),100)
        return {...acc , [pilar.nome] : valor}
},{})
    
const conexoes = [
    {pilar : "Gestão Estratégica", conexao : ["Financeiro", "Pessoas", "Comercial"]},
    {pilar : "Financeiro", conexao : ["Comercial", "Operações e Processos"]},
    {pilar : "Comercial", conexao : ["Clientes e Experiência"]},
    {pilar : "Operações e Processos", conexao : ["Clientes e Experiência", "Pessoas"]},
    {pilar : "Tecnologia", conexao : ["Gestão Estratégica", "Financeiro", "Comercial", "Operações e Processos", "Pessoas", "Clientes e Experiência"]}
]

console.log(conexoes.map((p) => p.conexao.map((pilar) => pilar)))