import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function ConfiguracionScreen() {
  const router = useRouter();

  // =========================
  // AUTENTICACIÓN
  // =========================
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);

  // =========================
  // PERFIL ADMIN
  // =========================
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [correoAdmin, setCorreoAdmin] = useState("");
  const [rolAdmin, setRolAdmin] = useState("admin");

  // =========================
  // CONFIGURACIÓN TIENDA
  // =========================
  const [nombreTienda, setNombreTienda] = useState("Polet Plus");
  const [moneda, setMoneda] = useState("USD");
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  // =========================
  // CONTRASEÑA
  // =========================
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  // =========================
  // ESTADOS GENERALES
  // =========================
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoTienda, setGuardandoTienda] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // VERIFICAR ADMIN Y CARGAR INFORMACIÓN
  // ==========================================
  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setVerificando(false);
        router.replace("/login");
        return;
      }

      try {
        setUsuarioActual(usuario);

        const referenciaUsuario = doc(db, "users", usuario.uid);
        const documentoUsuario = await getDoc(referenciaUsuario);

        if (!documentoUsuario.exists()) {
          router.replace("/");
          return;
        }

        const datosUsuario = documentoUsuario.data();

        if (datosUsuario.rol !== "admin") {
          router.replace("/");
          return;
        }

        setAutorizado(true);
        setNombreAdmin(datosUsuario.nombre || "Administrador");
        setCorreoAdmin(datosUsuario.email || usuario.email || "");
        setRolAdmin(datosUsuario.rol || "admin");

        // =========================
        // CARGAR CONFIGURACIÓN TIENDA
        // =========================
        const referenciaConfiguracion = doc(db, "configuracion", "tienda");
        const documentoConfiguracion = await getDoc(referenciaConfiguracion);

        if (documentoConfiguracion.exists()) {
          const datosConfiguracion = documentoConfiguracion.data();

          setNombreTienda(datosConfiguracion.nombre || "Polet Plus");
          setMoneda(datosConfiguracion.moneda || "USD");
          setCorreoContacto(datosConfiguracion.correo || "");
          setTelefono(datosConfiguracion.telefono || "");
          setDireccion(datosConfiguracion.direccion || "");
        }
      } catch (err) {
        console.error("Error verificando permisos:", err);
        router.replace("/login");
      } finally {
        setVerificando(false);
      }
    });

    return () => cancelarObservador();
  }, [router]);

  // ==========================================
  // MOSTRAR MENSAJE TEMPORAL
  // ==========================================
  const mostrarMensaje = (texto: string, esError = false) => {
    if (esError) {
      setError(texto);
      setMensaje("");
    } else {
      setMensaje(texto);
      setError("");
    }

    setTimeout(() => {
      setMensaje("");
      setError("");
    }, 4000);
  };

  // ==========================================
  // GUARDAR PERFIL ADMINISTRADOR
  // ==========================================
  const guardarPerfil = async () => {
    if (!usuarioActual) return;

    if (!nombreAdmin.trim()) {
      mostrarMensaje("El nombre no puede estar vacío.", true);
      return;
    }

    try {
      setGuardandoPerfil(true);
      setError("");

      const referenciaUsuario = doc(db, "users", usuarioActual.uid);
      await updateDoc(referenciaUsuario, {
        nombre: nombreAdmin.trim(),
      });

      mostrarMensaje("Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      mostrarMensaje("No se pudo actualizar el perfil.", true);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // ==========================================
  // GUARDAR CONFIGURACIÓN DE TIENDA
  // ==========================================
  const guardarConfiguracionTienda = async () => {
    if (!nombreTienda.trim()) {
      mostrarMensaje("El nombre de la tienda es obligatorio.", true);
      return;
    }

    try {
      setGuardandoTienda(true);
      setError("");

      const referenciaConfiguracion = doc(db, "configuracion", "tienda");
      await setDoc(
        referenciaConfiguracion,
        {
          nombre: nombreTienda.trim(),
          moneda,
          correo: correoContacto.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
        },
        { merge: true }
      );

      mostrarMensaje("Configuración de la tienda guardada correctamente.");
    } catch (err) {
      console.error("Error guardando configuración:", err);
      mostrarMensaje("No se pudo guardar la configuración.", true);
    } finally {
      setGuardandoTienda(false);
    }
  };

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================
  const cambiarPassword = async () => {
    if (!usuarioActual) return;

    if (!nuevaPassword || !confirmarPassword) {
      mostrarMensaje("Completa ambos campos de contraseña.", true);
      return;
    }

    if (nuevaPassword.length < 6) {
      mostrarMensaje("La contraseña debe tener al menos 6 caracteres.", true);
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      mostrarMensaje("Las contraseñas no coinciden.", true);
      return;
    }

    try {
      setCambiandoPassword(true);

      await updatePassword(usuarioActual, nuevaPassword);

      setNuevaPassword("");
      setConfirmarPassword("");
      mostrarMensaje("Contraseña actualizada correctamente.");
    } catch (err: any) {
      console.error("Error actualizando contraseña:", err);

      if (err?.code === "auth/requires-recent-login") {
        mostrarMensaje(
          "Por seguridad, debes cerrar sesión e iniciar sesión nuevamente antes de cambiar la contraseña.",
          true
        );
      } else {
        mostrarMensaje("No se pudo actualizar la contraseña.", true);
      }
    } finally {
      setCambiandoPassword(false);
    }
  };

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  // ==========================================
  // PANTALLA DE CARGA
  // ==========================================
  if (verificando) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#AD4E4F" />
        <Text style={styles.loadingText}>Verificando acceso...</Text>
      </SafeAreaView>
    );
  }

  if (!autorizado) {
    return null;
  }

  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ENCABEZADO */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>Configuración</Text>
              <Text style={styles.subtitle}>
                Administra tu perfil y la configuración general de Polet Plus.
              </Text>
            </View>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.backButtonText}>Regresar</Text>
            </Pressable>
          </View>

          {/* MENSAJES */}
          {mensaje ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{mensaje}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* PERFIL ADMIN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Perfil del administrador</Text>
            <Text style={styles.cardSubtitle}>
              Información de tu cuenta administrativa.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={nombreAdmin}
                onChangeText={setNombreAdmin}
                placeholder="Nombre del administrador"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                value={correoAdmin}
                editable={false}
                selectTextOnFocus={false}
                style={[styles.input, styles.disabledInput]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{rolAdmin}</Text>
              </View>
            </View>

            <Pressable
              onPress={guardarPerfil}
              disabled={guardandoPerfil}
              style={({ pressed }) => [
                styles.primaryButton,
                guardandoPerfil && styles.buttonDisabled,
                pressed && !guardandoPerfil && styles.buttonPressed,
              ]}
            >
              {guardandoPerfil ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Guardar cambios</Text>
              )}
            </Pressable>
          </View>

          {/* CONFIGURACIÓN TIENDA */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configuración de la tienda</Text>
            <Text style={styles.cardSubtitle}>
              Información general de Polet Plus.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre de la tienda</Text>
              <TextInput
                value={nombreTienda}
                onChangeText={setNombreTienda}
                placeholder="Polet Plus"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Moneda</Text>
              <Pressable
                onPress={() =>
                  setMoneda((prev) => (prev === "USD" ? "SVC" : "USD"))
                }
                style={styles.selectBox}
              >
                <Text style={styles.selectText}>
                  {moneda === "USD"
                    ? "USD - Dólar estadounidense"
                    : moneda}
                </Text>
                <Text style={styles.selectHint}>USD</Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo de contacto</Text>
              <TextInput
                value={correoContacto}
                onChangeText={setCorreoContacto}
                placeholder="contacto@poletplus.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                value={telefono}
                onChangeText={setTelefono}
                placeholder="+503 0000-0000"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Dirección de la tienda"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[styles.input, styles.textArea]}
              />
            </View>

            <Pressable
              onPress={guardarConfiguracionTienda}
              disabled={guardandoTienda}
              style={({ pressed }) => [
                styles.primaryButton,
                guardandoTienda && styles.buttonDisabled,
                pressed && !guardandoTienda && styles.buttonPressed,
              ]}
            >
              {guardandoTienda ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Guardar configuración
                </Text>
              )}
            </Pressable>
          </View>

          {/* SEGURIDAD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seguridad</Text>
            <Text style={styles.cardSubtitle}>
              Administra la seguridad de tu cuenta.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                value={nuevaPassword}
                onChangeText={setNuevaPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                placeholder="Repite la contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={cambiarPassword}
              disabled={cambiandoPassword}
              style={({ pressed }) => [
                styles.outlineButton,
                cambiandoPassword && styles.buttonDisabled,
                pressed && !cambiandoPassword && styles.outlineButtonPressed,
              ]}
            >
              {cambiandoPassword ? (
                <ActivityIndicator color="#AD4E4F" size="small" />
              ) : (
                <Text style={styles.outlineButtonText}>Cambiar contraseña</Text>
              )}
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={cerrarSesion}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fdf7f5",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fb",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#AD4E4F",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#AD4E4F",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#f5c8cd",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#7e383b",
    fontWeight: "600",
    fontSize: 14,
  },
  successBox: {
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
    padding: 14,
    borderRadius: 12,
  },
  successText: {
    color: "#15803d",
    fontSize: 14,
    fontWeight: "500",
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f6e2e1",
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#542e30",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: -8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  input: {
    borderWidth: 1,
    borderColor: "#f1d9d7",
    backgroundColor: "#fffafa",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: "#374151",
  },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    color: "#6b7280",
  },
  textArea: {
    minHeight: 84,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fff0f1",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  roleBadgeText: {
    color: "#AD4E4F",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "capitalize",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#f1d9d7",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 15,
    color: "#374151",
  },
  selectHint: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AD4E4F",
  },
  primaryButton: {
    backgroundColor: "#AD4E4F",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#AD4E4F",
    backgroundColor: "#ffffff",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  outlineButtonPressed: {
    backgroundColor: "#fff0f1",
  },
  outlineButtonText: {
    color: "#AD4E4F",
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#f6e2e1",
    marginTop: 6,
  },
  logoutButton: {
    backgroundColor: "#542e30",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});