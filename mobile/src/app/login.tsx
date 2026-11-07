import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { router } from "expo-router";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { auth, db } from "../lib/firebase";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] =
    useState(false);

  // =========================
  // CONFIGURAR GOOGLE SIGN-IN
  // =========================
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "118095166863-1b6nvnfragv10g1fanhohmjog39ts2sd.apps.googleusercontent.com",
    });
  }, []);

  // =========================
  // LOGIN NORMAL
  // =========================
  const manejarLogin = async () => {
    if (!correo.trim() || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos."
      );

      return;
    }

    try {
      setCargando(true);

      await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        password
      );

      Alert.alert(
        "Bienvenido",
        "Inicio de sesión exitoso."
      );

      router.replace("/inicio");
    } catch (error: any) {
      console.log(
        "Error al iniciar sesión:",
        error
      );

      if (
        error.code ===
          "auth/invalid-credential" ||
        error.code ===
          "auth/wrong-password" ||
        error.code ===
          "auth/user-not-found"
      ) {
        Alert.alert(
          "Error",
          "Correo o contraseña incorrectos."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        Alert.alert(
          "Error",
          "El correo electrónico no es válido."
        );
      } else if (
        error.code ===
        "auth/too-many-requests"
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

  // =========================
  // LOGIN CON GOOGLE
  // =========================
  const manejarLoginGoogle = async () => {
    try {
      setCargandoGoogle(true);

      // Verificar que Google Play Services esté disponible
      await GoogleSignin.hasPlayServices();

      try {
        await GoogleSignin.signOut();
      } catch {

      }

      // =========================
      // MOSTRAR SELECTOR DE CUENTAS
      // =========================
      const resultadoGoogle =
        await GoogleSignin.signIn();

      // Si el usuario cancela
      if (
        resultadoGoogle.type !== "success"
      ) {
        return;
      }

      // =========================
      // OBTENER TOKEN DE GOOGLE
      // =========================
      const tokens =
        await GoogleSignin.getTokens();

      const idToken = tokens.idToken;

      if (!idToken) {
        throw new Error(
          "No se pudo obtener el token de Google."
        );
      }

      // =========================
      // CREAR CREDENCIAL FIREBASE
      // =========================
      const credencialGoogle =
        GoogleAuthProvider.credential(
          idToken
        );

      // =========================
      // INICIAR SESIÓN EN FIREBASE
      // =========================
      const resultadoFirebase =
        await signInWithCredential(
          auth,
          credencialGoogle
        );

      const usuario =
        resultadoFirebase.user;

      // =========================
      // BUSCAR USUARIO EN FIRESTORE
      // =========================
      const referenciaUsuario = doc(
        db,
        "users",
        usuario.uid
      );

      const documentoUsuario =
        await getDoc(
          referenciaUsuario
        );

      // =========================
      // CREAR USUARIO SI NO EXISTE
      // =========================
      if (!documentoUsuario.exists()) {
        await setDoc(
          referenciaUsuario,
          {
            nombre:
              usuario.displayName ||
              "Cliente",

            email:
              usuario.email || "",

            rol: "cliente",

            fechaRegistro:
              serverTimestamp(),
          }
        );
      }

      Alert.alert(
        "Bienvenido",
        "Inicio de sesión con Google exitoso."
      );

      // /inicio verificará si es
      // administrador o cliente
      router.replace("/inicio");
    } catch (error: any) {
      console.log(
        "Error Google Sign-In:",
        error
      );

      if (
        error.code ===
        statusCodes.SIGN_IN_CANCELLED
      ) {
        console.log(
          "Inicio de sesión con Google cancelado."
        );
      } else if (
        error.code ===
        statusCodes.IN_PROGRESS
      ) {
        Alert.alert(
          "Espera",
          "Ya hay un inicio de sesión en proceso."
        );
      } else if (
        error.code ===
        statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        Alert.alert(
          "Error",
          "Google Play Services no está disponible."
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo iniciar sesión con Google."
        );
      }
    } finally {
      setCargandoGoogle(false);
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

      {/* LOGIN NORMAL */}
      <TouchableOpacity
        style={[
          styles.boton,
          cargando &&
            styles.botonDeshabilitado,
        ]}
        onPress={manejarLogin}
        disabled={
          cargando ||
          cargandoGoogle
        }
      >
        <Text style={styles.textoBoton}>
          {cargando
            ? "Iniciando sesión..."
            : "Iniciar sesión"}
        </Text>
      </TouchableOpacity>

      {/* SEPARADOR */}
      <View style={styles.separador}>
        <View style={styles.linea} />

        <Text style={styles.textoSeparador}>
          o
        </Text>

        <View style={styles.linea} />
      </View>

      {/* LOGIN CON GOOGLE */}
      <TouchableOpacity
        style={[
          styles.botonGoogle,
          cargandoGoogle &&
            styles.botonDeshabilitado,
        ]}
        onPress={manejarLoginGoogle}
        disabled={
          cargandoGoogle ||
          cargando
        }
      >
        <Text style={styles.logoGoogle}>
          G
        </Text>

        <Text style={styles.textoGoogle}>
          {cargandoGoogle
            ? "Conectando..."
            : "Continuar con Google"}
        </Text>
      </TouchableOpacity>

      {/* REGISTRO */}
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

  separador: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  linea: {
    flex: 1,
    height: 1,
    backgroundColor: "#c99",
  },

  textoSeparador: {
    marginHorizontal: 12,
    color: "#777",
  },

  botonGoogle: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoGoogle: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 12,
    color: "#4285F4",
  },

  textoGoogle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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