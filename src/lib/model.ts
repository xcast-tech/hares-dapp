import { supabaseClient } from "./supabase";

export async function getConfig() {
  const { data, error } = await supabaseClient.from('Config').select('key,value')
  if (error) {
    throw error.message
  }
  const map: Record<string, string> = {}
  data.forEach((item: any) => {
    map[item.key] = item.value
  })
  return map
}

export async function updateConfig(key: string, value: string) {
  const { error } = await supabaseClient.from('Config').update({ value }).eq('key', key)
  if (error) {
    throw error.message
  }
}

export async function setEventHandled(id: number) {
  const { error } = await supabaseClient.from('Event').update({ status: 1 }).eq('id', id)
  if (error) {
    throw error.message
  }
}