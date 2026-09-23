export const formatarTelefone = (valor : string) : string => {
    return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^(\d{5})(\d{1,4})$/, "$1-$2")
    .slice(0, 15)
}

export const formatarCPF = (valor : string) : string => {
    return valor
    .replace(/\D/g, "")
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0,14)
}

export const formatarCNPJ = (valor : string) : string => {
    return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{4})(\d{1,2})$/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0,18)
}
