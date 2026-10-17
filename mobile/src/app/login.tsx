import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../lib/firebase";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async () => {
    // Validar campos vacíos
    if (!correo.trim() || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos."
      );
      return;
    }

    try {
      setCargando(true);

      // Autenticar usuario con Firebase
      await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        password
      );

      Alert.alert(
        "Bienvenido",
        "Inicio de sesión exitoso."
      );

      // Enviar a inicio para verificar el rol
      router.replace("/inicio");

    } catch (error: any) {
      console.log(
        "Error al iniciar sesión:",
        error
      );

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        Alert.alert(
          "Error",
          "Correo o contraseña incorrectos."
        );

      } else if (
        error.code === "auth/invalid-email"
      ) {
        Alert.alert(
          "Error",
          "El correo electrónico no es válido."
        );

      } else if (
        error.code === "auth/too-many-requests"
      ) {
        Alert.alert(
          "Error",
          "Se realizaron demasiados intentos. Intenta nuevamente más tarde."
        );

      } else {
        Alert.alert(
          "Error",
          "No se pudo iniciar sesión. Intenta nuevamente."
        );
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* LOGO */}
      <Text style={styles.logo}>
        POLET PLUS
      </Text>

      {/* TÍTULO */}
      <Text style={styles.titulo}>
        Iniciar sesión
      </Text>

      {/* CORREO */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={correo}
        onChangeText={setCorreo}
      />

      {/* CONTRASEÑA */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* BOTÓN LOGIN */}
      <TouchableOpacity
        style={[
          styles.boton,
          cargando && styles.botonDeshabilitado,
        ]}
        onPress={manejarLogin}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando
            ? "Iniciando sesión..."
            : "Iniciar sesión"}
        </Text>
      </TouchableOpacity>

      {/* IR A REGISTRO */}
      <TouchableOpacity
        onPress={() =>
          router.push("/registro")
        }
      >
        <Text style={styles.registro}>
          ¿No tienes una cuenta? Regístrate
        </Text>
      </TouchableOpacity>

      {/* VOLVER */}
      <TouchableOpacity
        onPress={() =>
          router.replace("/")
        }
      >
        <Text style={styles.volver}>
          ← Volver al inicio
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efd2c7",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#AD4E4F",
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: 2,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#AD4E4F",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#AD4E4F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },

  boton: {
    backgroundColor: "#AD4E4F",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  registro: {
    textAlign: "center",
    color: "#AD4E4F",
    marginTop: 25,
    fontWeight: "600",
  },

  volver: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});