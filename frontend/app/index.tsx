import { useState } from "react";
import { Text, View } from "react-native";
import Header from "./components/Header";

export default function Index() {
  const [editando, setEditando] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Header
        nome="teste"
        editando={editando}
        aoClicarIcone={() => setEditando(!editando)}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{editando ? "Modo edição" : "Conteúdo da página"}</Text>
      </View>
    </View>
  );
}
