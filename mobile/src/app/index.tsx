import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        POLET PLUS
      </Text>

      <Text style={styles.subtitulo}>
        Moda para todos
      </Text>

      <TouchableOpacity
        style={styles.botonPrincipal}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.textoBotonPrincipal}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonSecundario}
        onPress={() => router.push("/registro")}
      >
        <Text style={styles.textoBotonSecundario}>
          Registrarse
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#efd2c7",
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#AD4E4F",
    marginBottom: 10,
    letterSpacing: 3,
  },

  subtitulo: {
    fontSize: 17,
    color: "#666",
    marginBottom: 40,
  },

  botonPrincipal: {
    width: "100%",
    backgroundColor: "#AD4E4F",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  textoBotonPrincipal: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  botonSecundario: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#AD4E4F",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  textoBotonSecundario: {
    color: "#AD4E4F",
    fontSize: 17,
    fontWeight: "bold",
  },
});