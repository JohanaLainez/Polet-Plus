import { useEffect, useState } from "react";

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
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
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

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "118095166863-1b6nvnfragv10g1fanhohmjog39ts2sd.apps.googleusercontent.com",
    });
  }, []);

  // =========================
  // REGISTRO NORMAL
  // =========================
  const manejarRegistro = async () => {
    if (
      !nombre.trim() ||
      !correo.trim() ||
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
        doc(db, "users", credencial.user.uid),
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

      router.replace("/inicio");
    } catch (error: any) {
      console.log("Error registro:", error);

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        Alert.alert(
          "Cuenta existente",
          "Este correo ya está registrado. Inicia sesión con tu cuenta."
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
        "auth/weak-password"
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

  // =========================
  // REGISTRO CON GOOGLE
  // =========================
  const manejarRegistroGoogle = async () => {
    try {
      setCargandoGoogle(true);

      await GoogleSignin.hasPlayServices();

      try {
        await GoogleSignin.signOut();
      } catch {
      
      }

      const resultadoGoogle =
        await GoogleSignin.signIn();

      if (
        resultadoGoogle.type !== "success"
      ) {
        return;
      }

      // Obtener token de Google
      const tokens =
        await GoogleSignin.getTokens();

      const idToken = tokens.idToken;

      if (!idToken) {
        throw new Error(
          "No se pudo obtener el token de Google."
        );
      }

      // Crear credencial para Firebase
      const credencialGoogle =
        GoogleAuthProvider.credential(
          idToken
        );

      // Iniciar sesión temporalmente en Firebase
      // para obtener UID y comprobar si ya existe.
      const resultadoFirebase =
        await signInWithCredential(
          auth,
          credencialGoogle
        );

      const usuario =
        resultadoFirebase.user;

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
      // CUENTA YA EXISTENTE
      // =========================
      if (documentoUsuario.exists()) {
        const datosUsuario =
          documentoUsuario.data();

        // Cerrar la sesión abierta
        // durante la comprobación.
        await signOut(auth);

        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignorar si Google ya estaba cerrado.
        }

        if (
          datosUsuario.rol === "admin"
        ) {
          Alert.alert(
            "Cuenta existente",
            "Esta cuenta de Google ya pertenece a un administrador. Utiliza la opción Iniciar sesión."
          );
        } else {
          Alert.alert(
            "Cuenta existente",
            "Esta cuenta de Google ya está registrada. Utiliza la opción Iniciar sesión."
          );
        }

        return;
      }

      // =========================
      // NUEVO USUARIO GOOGLE
      // =========================
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

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta de Google fue registrada correctamente."
      );

      router.replace("/inicio");
    } catch (error: any) {
      console.log(
        "Error registro Google:",
        error
      );

      if (
        error.code ===
        statusCodes.SIGN_IN_CANCELLED
      ) {
        console.log(
          "Registro con Google cancelado."
        );
      } else if (
        error.code ===
        statusCodes.IN_PROGRESS
      ) {
        Alert.alert(
          "Espera",
          "Ya hay un proceso de Google en curso."
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
          "No se pudo realizar el registro con Google."
        );
      }
    } finally {
      setCargandoGoogle(false);
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
        autoCorrect={false}
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
        onChangeText={
          setConfirmarPassword
        }
      />

      {/* BOTÓN REGISTRO NORMAL */}
      <TouchableOpacity
        style={[
          styles.boton,
          cargando &&
            styles.botonDeshabilitado,
        ]}
        onPress={manejarRegistro}
        disabled={
          cargando ||
          cargandoGoogle
        }
      >
        <Text style={styles.textoBoton}>
          {cargando
            ? "Creando cuenta..."
            : "Registrarse"}
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

      {/* BOTÓN GOOGLE */}
      <TouchableOpacity
        style={[
          styles.botonGoogle,
          cargandoGoogle &&
            styles.botonDeshabilitado,
        ]}
        onPress={
          manejarRegistroGoogle
        }
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
            : "Registrarse con Google"}
        </Text>
      </TouchableOpacity>

      {/* IR A LOGIN */}
      <TouchableOpacity
        onPress={() =>
          router.push("/login")
        }
      >
        <Text style={styles.login}>
          ¿Ya tienes una cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>

      {/* VOLVER */}
      <TouchableOpacity
        onPress={() =>
          router.back()
        }
      >
        <Text style={styles.volver}>
          ← Volver
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
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
      color: "#4285F4",
      marginRight: 12,
    },

    textoGoogle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
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
