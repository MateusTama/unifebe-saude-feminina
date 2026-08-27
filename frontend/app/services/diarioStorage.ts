import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ciclo, RegistrosDias } from '../types/diario';

// ---------------------------------------------------------------------------
// Chaves de armazenamento
// ---------------------------------------------------------------------------

const CHAVE_CICLOS = '@diario:ciclos';
const CHAVE_REGISTROS = '@diario:registros';

// ---------------------------------------------------------------------------
// Ciclos
// ---------------------------------------------------------------------------

export async function salvarCiclos(ciclos: Ciclo[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE_CICLOS, JSON.stringify(ciclos));
}

export async function carregarCiclos(): Promise<Ciclo[]> {
  const json = await AsyncStorage.getItem(CHAVE_CICLOS);
  if (!json) return [];
  try {
    return JSON.parse(json) as Ciclo[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Registros diários
// ---------------------------------------------------------------------------

export async function salvarRegistros(registros: RegistrosDias): Promise<void> {
  await AsyncStorage.setItem(CHAVE_REGISTROS, JSON.stringify(registros));
}

function migrarChavesParaISO(registros: RegistrosDias): RegistrosDias {
  const migrados: RegistrosDias = {};
  for (const [chave, valor] of Object.entries(registros)) {
    const partes = chave.split('-');
    if (partes.length === 3) {
      const novaChave = `${partes[0]}-${partes[1].padStart(2, '0')}-${partes[2].padStart(2, '0')}`;
      migrados[novaChave] = valor;
    } else {
      migrados[chave] = valor;
    }
  }
  return migrados;
}

export async function carregarRegistros(): Promise<RegistrosDias> {
  const json = await AsyncStorage.getItem(CHAVE_REGISTROS);
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as RegistrosDias;
    return migrarChavesParaISO(parsed);
  } catch {
    return {};
  }
}

