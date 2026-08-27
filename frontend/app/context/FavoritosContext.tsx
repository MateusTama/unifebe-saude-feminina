import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Artigo } from '../components/ArticleCard';

interface FavoritosContextData {
  favoritos: Artigo[];
  alternarFavorito: (artigo: Artigo) => void;
  eFavorito: (id: string) => boolean;
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
  const [favoritos, setFavoritos] = useState<Artigo[]>([ARTIGO_EXEMPLO_PADRAO]);

  const alternarFavorito = (artigo: Artigo) => {
    setFavoritos((prev) => {
      const existe = prev.some((item) => item.id === artigo.id);
      if (existe) {
        return prev.filter((item) => item.id !== artigo.id);
      } else {
        return [...prev, artigo];
      }
    });
  };

  const eFavorito = (id: string) => {
    return favoritos.some((item) => item.id === id);
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, alternarFavorito, eFavorito }}>
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

