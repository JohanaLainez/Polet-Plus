import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { router } from "expo-router";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (
      !nombre ||
      !correo ||
      !password ||
      !confirmarPassword
    ) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos."
      );
      return;
    }

    if (!correo.includes("@")) {
      Alert.alert(
        "Correo inválido",
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert(
        "Contraseñas diferentes",
        "Las contraseñas no coinciden."
      );
      return;
    }

    try {
      setCargando(true);

      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          correo.trim(),
          password
        );

      await setDoc(
        doc(
          db,
          "users",
          credencial.user.uid
        ),
        {
          nombre: nombre.trim(),
          email: correo.trim(),
          rol: "cliente",
          fechaRegistro: serverTimestamp(),
        }
      );

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta fue creada correctamente."
      );

      router.replace("/");
    } catch (error: any) {
      console.log(error);

      if (
        error.code === "auth/email-already-in-use"
      ) {
        Alert.alert(
          "Error",
          "Este correo ya está registrado."
        );
      } else if (
        error.code === "auth/invalid-email"
      ) {
        Alert.alert(
          "Error",
          "El correo electrónico no es válido."
        );
      } else if (
        error.code === "auth/weak-password"
      ) {
        Alert.alert(
          "Error",
          "La contraseña es demasiado débil."
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo crear la cuenta."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.logo}>
        POLET PLUS
      </Text>

      <Text style={styles.titulo}>
        Crear cuenta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#999"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={confirmarPassword}
        onChangeText={setConfirmarPassword}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={manejarRegistro}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando
            ? "Creando cuenta..."
            : "Registrarse"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push("/login")
        }
      >
        <Text style={styles.login}>
          ¿Ya tienes una cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.volver}>
          ← Volver
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#efd2c7",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  logo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#AD4E4F",
    textAlign: "center",
    marginBottom: 15,
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
  },

  boton: {
    backgroundColor: "#AD4E4F",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  textoBoton: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  login: {
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