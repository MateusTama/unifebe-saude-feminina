import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomNavBar from "./components/BottomNavBar";
import Header from "./components/Header";

export default function Index() {
  const [editando, setEditando] = useState(false);

  return (
    <View style={styles.container}>
      <Header
        nome="teste"
        editando={editando}
        aoClicarIcone={() => setEditando(!editando)}
      />
      <View style={styles.content}>
        <Text>{editando ? "Modo edição" : "Conteúdo da página"}</Text>
      </View>
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
