import { request } from "../core/core";
import type { Cliente, ClienteFiltrado, ClienteUpdate } from "../schemas/clientes";

export async function criar_cliente ( cliente : Cliente ) {
    const query = await request('/v1/clientes', {method : 'POST', body : JSON.stringify(cliente)})
    return query
}

export async function lista_clientes() : Promise<Cliente[]> {
    const query = await request('/v1/clientes', {method : 'GET'})

    return query.clientes
}

export async function lista_clientes_filter(filtro : { param : string, value : string}) : Promise<ClienteFiltrado> {
    const query = await request(`/v1/clientes?${filtro.param}=${filtro.value}`, { method : 'GET' })
    return query
}

export async function deletar_cliente ( cliente_id : string ) {
    await request(`/v1/clientes/${cliente_id}`, {method : 'DELETE'})
    return
}

export async function atualizar_status_cliente ( cliente_id : string, status : string ) {
    const query = await request(`/v1/clientes/${cliente_id}/status`, {method : 'PATCH', body : JSON.stringify({status : status})})
    return query
}

export async function update_cliente ( cliente_id : string, cliente_update : ClienteUpdate ) {
    const query = await request(`/v1/clientes/${cliente_id}`, {method : 'PUT', body : JSON.stringify(cliente_update)})
    return query
}