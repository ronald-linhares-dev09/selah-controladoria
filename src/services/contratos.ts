import { request } from "../core/core";
import type { Contrato, ContratoRead } from "../schemas/contratos";

export async function deletar_contrato(cliente_id : string) {
   await request(`/v1/contratos/${cliente_id}`, { method : 'DELETE'})

   return
}

export async function criar_contrato(contrato : Contrato) {
   const query = await request(`/v1/contratos`, { method : 'POST', body : JSON.stringify(contrato)})
   return query
}

export async function obter_contrato() : Promise<ContratoRead[]> {
   const contratos = await request(`/v1/contratos`, { method : 'GET'})
   return contratos.contrato
}