import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores } from '../styles/theme';

interface BotaoCurtirProps {
  curtido: boolean;
  aoPress: () => void;
}

export default function LikeButton({ curtido, aoPress }: BotaoCurtirProps) {
  return (
    <TouchableOpacity
      style={estilos.container}
      onPress={aoPress}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <MaterialIcons
        name={curtido ? 'favorite' : 'favorite-border'}
        size={24}
        color={curtido ? cores.secundaria : cores.mutedForeground}
      />
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
