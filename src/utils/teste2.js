const cores_classificacao = {
    "Premium" : "bg-emerald-500/20 text-emerald-600",
    "Lead" : "bg-gray-500/20 text-gray-600",
    "Fidelizado" : "bg-yellow-500/20 text-yellow-600"
}

const clientes = [
  {
    nome: "João Henrique Almeida",
    cpf: "123.456.789-01",
    endereco: "Rua das Acácias, 125  Centro, Maringá/PR",
    telefone: "(44) 98821-3476",
    classificacao: "Lead"
  },
  {
    nome: "Mariana Oliveira Santos",
    cpf: "234.567.890-12",
    endereco: "Av. Brasil, 1840  Zona 01, Maringá/PR",
    telefone: "(44) 99732-6158",
    classificacao: "Fidelizado"
  },
  {
    nome: "Lucas Gabriel Ferreira",
    cpf: "345.678.901-23",
    endereco: "Rua Pioneiro Carlos Rossi, 412  Vila Operária, Maringá/PR",
    telefone: "(44) 99145-7283",
    classificacao: "Lead"
  },
  {
    nome: "Ana Beatriz Costa",
    cpf: "456.789.012-34",
    endereco: "Rua das Palmeiras, 87  Jardim Alvorada, Maringá/PR",
    telefone: "(44) 98462-1937",
    classificacao: "Premium"
  },
  {
    nome: "Rafael Martins Souza",
    cpf: "567.890.123-45",
    endereco: "Rua Paraná, 623  Zona 07, Maringá/PR",
    telefone: "(44) 99618-4527",
    classificacao: "Fidelizado"
  },
  {
    nome: "Camila Rodrigues Lima",
    cpf: "678.901.234-56",
    endereco: "Rua Neo Alves Martins, 1052  Centro, Maringá/PR",
    telefone: "(44) 98934-7612",
    classificacao: "Premium"
  },
  {
    nome: "Felipe Augusto Mendes",
    cpf: "789.012.345-67",
    endereco: "Av. Mandacaru, 2310  Vila Operária, Maringá/PR",
    telefone: "(44) 99276-5381",
    classificacao: "Lead"
  },
  {
    nome: "Juliana Cristina Rocha",
    cpf: "890.123.456-78",
    endereco: "Rua Santos Dumont, 347  Zona 03, Maringá/PR",
    telefone: "(44) 98715-6249",
    classificacao: "Fidelizado"
  },
  {
    nome: "Gabriel Pereira Alves",
    cpf: "901.234.567-89",
    endereco: "Rua Arapongas, 156  Jardim Aclimação, Maringá/PR",
    telefone: "(44) 99542-8173",
    classificacao: "Lead"
  },
  {
    nome: "Larissa Fernanda Gomes",
    cpf: "012.345.678-90",
    endereco: "Rua José Clemente, 728  Jardim Novo Horizonte, Maringá/PR",
    telefone: "(44) 98163-2954",
    classificacao: "Premium"
  },
  {
    nome: "Bruno César Carvalho",
    cpf: "112.233.445-56",
    endereco: "Av. Colombo, 3150  Zona 07, Maringá/PR",
    telefone: "(44) 99824-6715",
    classificacao: "Fidelizado"
  },
  {
    nome: "Beatriz Martins Teixeira",
    cpf: "223.344.556-67",
    endereco: "Rua das Hortênsias, 294  Jardim Imperial, Maringá/PR",
    telefone: "(44) 98651-7432",
    classificacao: "Premium"
  },
  {
    nome: "Thiago Henrique Barbosa",
    cpf: "334.455.667-78",
    endereco: "Rua Paranaguá, 519  Zona 01, Maringá/PR",
    telefone: "(44) 99317-4856",
    classificacao: "Lead"
  },
  {
    nome: "Isabela Cristina Nunes",
    cpf: "445.566.778-89",
    endereco: "Rua Ivaí, 163  Vila Morangueira, Maringá/PR",
    telefone: "(44) 98246-3517",
    classificacao: "Fidelizado"
  },
  {
    nome: "Matheus Eduardo Cardoso",
    cpf: "556.677.889-90",
    endereco: "Av. Kakogawa, 1425  Jardim Internorte, Maringá/PR",
    telefone: "(44) 99473-8261",
    classificacao: "Premium"
  }
];

console.log(cores_classificacao[clientes[0].classificacao])