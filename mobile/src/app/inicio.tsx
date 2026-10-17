import { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function Inicio() {
  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(
      auth,
      async (usuario) => {
        // Si no hay usuario autenticado
        if (!usuario) {
          router.replace("/login");
          return;
        }

        try {
          // Buscar el documento del usuario en Firestore
          const referenciaUsuario = doc(
            db,
            "users",
            usuario.uid
          );

          const documentoUsuario = await getDoc(
            referenciaUsuario
          );

          // Si no existe información del usuario
          if (!documentoUsuario.exists()) {
            router.replace("/login");
            return;
          }

          // Obtener información del usuario
          const datosUsuario =
            documentoUsuario.data();

          // Redirigir según el rol
          if (datosUsuario.rol === "admin") {
            router.replace("/admin");
          } else if (
            datosUsuario.rol === "cliente"
          ) {
            router.replace("/home");
          } else {
            router.replace("/login");
          }
        } catch (error) {
          console.log(
            "Error verificando usuario:",
            error
          );

          router.replace("/login");
        }
      }
    );

    // Cancelar el observador cuando
    // esta pantalla deje de utilizarse
    return () => cancelarObservador();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#AD4E4F"
      />

      <Text style={styles.texto}>
        Cargando Polet Plus...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#efd2c7",
  },

  texto: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#AD4E4F",
  },
});