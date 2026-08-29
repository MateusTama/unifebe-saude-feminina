import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Artigo } from '../components/ArticleCard';
import { api } from '../services/api';

interface FavoritosContextData {
  favoritos: Artigo[];
  alternarFavorito: (artigo: Artigo) => void;
  eFavorito: (id: string) => boolean;
  sincronizarFavoritos: (artigos: Artigo[]) => void;
}

const FavoritosContext = createContext<FavoritosContextData>({} as FavoritosContextData);

export const ARTIGO_EXEMPLO_PADRAO: Artigo = {
  id: '1',
  titulo: 'Entendendo o Ciclo Menstrual',
  descricao: 'Saiba como funciona o ciclo menstrual e quais mudanças são normais no seu corpo.',
  icone: 'sync',
  palavrasChave: ['menstruação', 'ciclo', 'saúde'],
  tema: 'Menstruação',
};

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<Artigo[]>([]);

  const alternarFavorito = (artigo: Artigo) => {
    setFavoritos((prev) => {
      const existe = prev.some((item) => String(item.id) === String(artigo.id));
      if (existe) {
        return prev.filter((item) => String(item.id) !== String(artigo.id));
      } else {
        return [...prev, artigo];
      }
    });

    if (artigo.id && !isNaN(Number(artigo.id))) {
      api(`/artigos/${artigo.id}/favoritar`, { method: 'POST' }).catch(() => {});
    }
  };

  const sincronizarFavoritos = (artigosNovos: Artigo[]) => {
    setFavoritos((prev) => {
      const idsExistentes = new Set(prev.map((item) => String(item.id)));
      const novos = artigosNovos.filter((item) => !idsExistentes.has(String(item.id)));
      if (novos.length === 0) return prev;
      return [...prev, ...novos];
    });
  };

  const eFavorito = (id: string) => {
    return favoritos.some((item) => String(item.id) === String(id));
  };

  return (
    <FavoritosContext.Provider
      value={{ favoritos, alternarFavorito, eFavorito, sincronizarFavoritos }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos deve ser usado dentro de um FavoritosProvider');
  }
  return context;
}

