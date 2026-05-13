import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores } from '../styles/theme';

const COR_INATIVA = '#8A9BB0';

type ItemTab = {
  label: string;
  rota: string;
  icone: React.ComponentProps<typeof MaterialIcons>['name'];
};

const TABS: ItemTab[] = [
  { label: 'Home',      rota: '/',          icone: 'home'            },
  { label: 'Buscar',    rota: '/buscar',     icone: 'search'          },
  { label: 'Diário',    rota: '/diario',     icone: 'menu-book'       },
  { label: 'Favoritos', rota: '/favoritos',  icone: 'favorite-border' },
  { label: 'Perfil',    rota: '/perfil',     icone: 'person-outline'  },
];

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const estaAtivo = (rota: string): boolean => {
    if (rota === '/') return pathname === '/';
    return pathname.startsWith(rota);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
      ]}
    >
      {TABS.map((tab) => {
        const ativo = estaAtivo(tab.rota);

        return (
          <Pressable
            key={tab.rota}
            onPress={() => router.push(tab.rota as never)}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.tabPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: ativo }}
          >
            <MaterialIcons
              name={ativo && tab.icone === 'favorite-border' ? 'favorite' : tab.icone}
              size={24}
              color={ativo ? cores.primaria : COR_INATIVA}
            />
            <Text
              style={[
                styles.label,
                ativo ? styles.labelAtivo : styles.labelInativo,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: cores.fundo,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabPressionado: {
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
  labelAtivo: {
    color: cores.primaria,
    fontFamily: 'Inter_600SemiBold',
  },
  labelInativo: {
    color: COR_INATIVA,
  },
});
