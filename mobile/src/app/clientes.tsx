import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type Cliente = {
  id: string;
  nombre?: string;
  email?: string;
  rol?: string;
  fechaRegistro?: any;
};

function obtenerFecha(fecha: Cliente["fechaRegistro"]): Date | null {
  if (!fecha) return null;
  try {
    const resultado = typeof fecha?.toDate === "function"
      ? fecha.toDate()
      : fecha?.seconds
        ? new Date(fecha.seconds * 1000)
        : new Date(fecha);
    return Number.isNaN(resultado.getTime()) ? null : resultado;
  } catch {
    return null;
  }
}

function formatearFecha(fecha: Cliente["fechaRegistro"]): string {
  const date = obtenerFecha(fecha);
  if (!date) return "No disponible";
  return date.toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type TipoIcono = "usuarios" | "usuario" | "nuevo" | "verificado";

function IconoResumen({ tipo }: { tipo: TipoIcono }) {
  if (tipo === "usuarios") {
    return (
      <View style={styles.iconoLienzo}>
        <View style={[styles.iconoCabeza, styles.cabezaIzquierda]} />
        <View style={[styles.iconoCabeza, styles.cabezaDerecha]} />
        <View style={[styles.iconoCuerpo, styles.cuerpoIzquierdo]} />
        <View style={[styles.iconoCuerpo, styles.cuerpoDerecho]} />
      </View>
    );
  }

  if (tipo === "usuario" || tipo === "nuevo" || tipo === "verificado") {
    return (
      <View style={styles.iconoLienzo}>
        <View style={[styles.iconoCabeza, styles.cabezaCentro]} />
        <View style={[styles.iconoCuerpo, styles.cuerpoCentro]} />
        {tipo === "nuevo" ? (
          <View style={styles.iconoMas}>
            <View style={styles.iconoMasVertical} />
            <View style={styles.iconoMasHorizontal} />
          </View>
        ) : tipo === "verificado" ? (
          <View style={styles.iconoCheque}>
            <View style={styles.chequeCorto} />
            <View style={styles.chequeLargo} />
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}

export default function ClientesAdmin() {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo">("todos");
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const [error, setError] = useState("");

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const consulta = query(collection(db, "users"), where("rol", "==", "cliente"));
      const resultado = await getDocs(consulta);
      const lista = resultado.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Cliente[];
      lista.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      setClientes(lista);
    } catch (e) {
      console.error("No se pudieron cargar los clientes:", e);
      setError("No se pudieron cargar los clientes. Revisa la conexión y los permisos de Firestore.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        router.replace("/login");
        setVerificando(false);
        return;
      }
      try {
        const perfil = await getDoc(doc(db, "users", usuario.uid));
        if (perfil.exists() && perfil.data().rol === "admin") {
          setAutorizado(true);
          await cargarClientes();
        } else {
          router.replace("/inicio");
        }
      } catch (e) {
        console.error("No se pudo verificar el acceso de administrador:", e);
        setError("No se pudo verificar tu acceso de administrador.");
      } finally {
        setVerificando(false);
      }
    });
    return cancelar;
  }, [cargarClientes]);

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();
    return clientes.filter((cliente) => {
      const coincideTexto = `${cliente.nombre || ""} ${cliente.email || ""}`
        .toLocaleLowerCase()
        .includes(texto);
      // Los perfiles con rol "cliente" se consideran activos en el panel web.
      const coincideEstado = filtroEstado === "todos" || cliente.rol === "cliente";
      return coincideTexto && coincideEstado;
    });
  }, [busqueda, clientes, filtroEstado]);

  const nuevosEsteMes = clientes.filter((cliente) => {
    const fecha = obtenerFecha(cliente.fechaRegistro);
    const ahora = new Date();
    return fecha && fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
  }).length;

  if (verificando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#AD4E4F" />
        <Text style={styles.cargandoTexto}>Verificando acceso…</Text>
      </View>
    );
  }

  if (!autorizado) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>{error || "Redirigiendo…"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <TouchableOpacity style={styles.volver} onPress={() => router.replace("/admin")}>
          <Text style={styles.volverTexto}>‹  Admin</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Gestión de clientes</Text>
        <Text style={styles.subtitulo}>Administra la información de tus clientes registrados.</Text>
      </View>

      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <>
            <View style={styles.resumen}>
              <View style={styles.resumenCard}>
                <View style={styles.resumenIcono}><IconoResumen tipo="usuarios" /></View>
                <View style={styles.resumenInfo}>
                  <Text style={styles.resumenLabel}>Total de clientes</Text>
                  <Text style={styles.resumenNumero}>{clientes.length}</Text>
                </View>
              </View>
              <View style={styles.resumenCard}>
                <View style={styles.resumenIcono}><IconoResumen tipo="usuario" /></View>
                <View style={styles.resumenInfo}>
                  <Text style={styles.resumenLabel}>Clientes activos</Text>
                  <Text style={styles.resumenNumero}>{clientes.length}</Text>
                </View>
              </View>
              <View style={styles.resumenCard}>
                <View style={styles.resumenIcono}><IconoResumen tipo="nuevo" /></View>
                <View style={styles.resumenInfo}>
                  <Text style={styles.resumenLabel}>Nuevos este mes</Text>
                  <Text style={styles.resumenNumero}>{nuevosEsteMes}</Text>
                </View>
              </View>
              <View style={styles.resumenCard}>
                <View style={styles.resumenIcono}><IconoResumen tipo="verificado" /></View>
                <View style={styles.resumenInfo}>
                  <Text style={styles.resumenLabel}>Registrados</Text>
                  <Text style={styles.resumenNumero}>{clientes.length}</Text>
                </View>
              </View>
            </View>

            <View style={styles.listadoHeader}>
              <Text style={styles.listadoTitulo}>Listado de clientes</Text>
              <TextInput
                style={styles.buscar}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar nombre o correo…"
                placeholderTextColor="#a58d80"
                autoCapitalize="none"
                keyboardType="default"
              />
              <View style={styles.filtros}>
                <TouchableOpacity
                  style={[styles.filtro, filtroEstado === "todos" && styles.filtroActivo]}
                  onPress={() => setFiltroEstado("todos")}
                >
                  <Text style={[styles.filtroTexto, filtroEstado === "todos" && styles.filtroTextoActivo]}>Todos ({clientes.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filtro, filtroEstado === "activo" && styles.filtroActivo]}
                  onPress={() => setFiltroEstado("activo")}
                >
                  <Text style={[styles.filtroTexto, filtroEstado === "activo" && styles.filtroTextoActivo]}>Activos</Text>
                </TouchableOpacity>
              </View>
              {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
              {cargando ? (
                <View style={styles.actualizando}>
                  <ActivityIndicator size="small" color="#AD4E4F" />
                  <Text style={styles.cargandoTexto}>Cargando clientes…</Text>
                </View>
              ) : null}
            </View>
          </>
        )}
        ListEmptyComponent={cargando ? null : (
          <View style={styles.vacio}>
            <Text style={styles.vacioTitulo}>No se encontraron clientes</Text>
            <Text style={styles.vacioTexto}>{busqueda ? "Prueba otra búsqueda." : "Los clientes registrados aparecerán aquí."}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.clienteCard}>
            <View style={styles.clienteFila}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{(item.nombre || "C").charAt(0).toLocaleUpperCase()}</Text>
              </View>
              <View style={styles.clienteInfo}>
                <Text style={styles.clienteNombre} numberOfLines={1}>{item.nombre || "Sin nombre"}</Text>
                <Text style={styles.clienteId}>ID: {item.id.slice(0, 8)}…</Text>
                <Text style={styles.correo} numberOfLines={1}>{item.email || "Sin correo"}</Text>
              </View>
            </View>
            <View style={styles.detallesFila}>
              <Text style={styles.registro}>Registro: {formatearFecha(item.fechaRegistro)}</Text>
              <View style={styles.badges}>
                <Text style={styles.rolBadge}>Cliente</Text>
                <Text style={styles.estadoBadge}>Activo</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.verPerfil} onPress={() => setSeleccionado(item)}>
              <Text style={styles.verPerfilTexto}>◎  Ver perfil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={!cargando && clientesFiltrados.length > 0 ? (
          <Text style={styles.pieLista}>{clientesFiltrados.length} cliente{clientesFiltrados.length === 1 ? "" : "s"}</Text>
        ) : null}
        refreshing={cargando && autorizado}
        onRefresh={cargarClientes}
      />

      <Modal visible={Boolean(seleccionado)} transparent animationType="fade" onRequestClose={() => setSeleccionado(null)}>
        <View style={styles.modalFondo}>
          <View style={styles.perfilCard}>
            <Text style={styles.modalTitulo}>Perfil del cliente</Text>
            <View style={styles.perfilCabecera}>
              <View style={[styles.avatar, styles.avatarGrande]}>
                <Text style={[styles.avatarTexto, styles.avatarTextoGrande]}>{(seleccionado?.nombre || "C").charAt(0).toLocaleUpperCase()}</Text>
              </View>
              <Text style={styles.perfilNombre}>{seleccionado?.nombre || "Sin nombre"}</Text>
              <Text style={styles.perfilCorreo}>{seleccionado?.email || "Sin correo"}</Text>
            </View>
            <View style={styles.perfilDatos}>
              <Text style={styles.datoLabel}>Nombre completo</Text>
              <Text style={styles.datoValor}>{seleccionado?.nombre || "No disponible"}</Text>
              <Text style={styles.datoLabel}>Correo electrónico</Text>
              <Text style={styles.datoValor}>{seleccionado?.email || "No disponible"}</Text>
              <Text style={styles.datoLabel}>Fecha de registro</Text>
              <Text style={styles.datoValor}>{formatearFecha(seleccionado?.fechaRegistro)}</Text>
              <Text style={styles.datoLabel}>Rol</Text>
              <Text style={styles.datoValor}>Cliente</Text>
            </View>
            <TouchableOpacity style={styles.cerrarPerfil} onPress={() => setSeleccionado(null)}>
              <Text style={styles.cerrarPerfilTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#fdf7f5" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#fdf7f5" },
  cargandoTexto: { color: "#8c7468", fontSize: 13, marginTop: 8 },
  errorTexto: { color: "#b4233d", fontSize: 13, marginTop: 10, lineHeight: 19 },
  encabezado: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14 },
  volver: { alignSelf: "flex-start", marginBottom: 14, paddingVertical: 5 },
  volverTexto: { color: "#AD4E4F", fontSize: 15, fontWeight: "700" },
  titulo: { color: "#AD4E4F", fontSize: 27, lineHeight: 34, fontWeight: "800" },
  subtitulo: { color: "#7d8797", fontSize: 14, lineHeight: 20, marginTop: 5 },
  lista: { paddingHorizontal: 14, paddingBottom: 30 },
  resumen: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  resumenCard: { width: "48%", minHeight: 91, flexGrow: 1, flexBasis: "43%", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 17, borderWidth: 1, borderColor: "#f6e2e1", padding: 12, elevation: 1 },
  resumenIcono: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#fff0f1", alignItems: "center", justifyContent: "center" },
  iconoLienzo: { width: 24, height: 24, position: "relative" },
  iconoCabeza: { position: "absolute", width: 9, height: 9, borderRadius: 5, borderWidth: 1.8, borderColor: "#AD4E4F" },
  cabezaIzquierda: { top: 3, left: 2 },
  cabezaDerecha: { top: 3, right: 2 },
  cabezaCentro: { top: 1, left: 7.5 },
  iconoCuerpo: { position: "absolute", height: 8, borderWidth: 1.8, borderBottomWidth: 0, borderColor: "#AD4E4F", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  cuerpoIzquierdo: { width: 13, left: 0, bottom: 2 },
  cuerpoDerecho: { width: 13, right: 0, bottom: 2 },
  cuerpoCentro: { width: 15, left: 4.5, bottom: 1 },
  iconoMas: { position: "absolute", width: 10, height: 10, right: -1, bottom: 1, borderRadius: 5, backgroundColor: "#fff0f1", alignItems: "center", justifyContent: "center" },
  iconoMasVertical: { position: "absolute", width: 1.8, height: 8, borderRadius: 2, backgroundColor: "#AD4E4F" },
  iconoMasHorizontal: { position: "absolute", width: 8, height: 1.8, borderRadius: 2, backgroundColor: "#AD4E4F" },
  iconoCheque: { position: "absolute", width: 10, height: 10, right: -1, bottom: 1, borderRadius: 5, backgroundColor: "#fff0f1" },
  chequeCorto: { position: "absolute", width: 2, height: 4, left: 2, top: 4, borderRadius: 1, backgroundColor: "#AD4E4F", transform: [{ rotate: "-45deg" }] },
  chequeLargo: { position: "absolute", width: 2, height: 6, left: 5, top: 2, borderRadius: 1, backgroundColor: "#AD4E4F", transform: [{ rotate: "45deg" }] },
  resumenInfo: { flex: 1, minWidth: 0 },
  resumenLabel: { color: "#667085", fontSize: 11 },
  resumenNumero: { color: "#AD4E4F", fontSize: 25, fontWeight: "800", marginTop: 2 },
  listadoHeader: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#f6e2e1", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 15 },
  listadoTitulo: { color: "#542e30", fontSize: 19, fontWeight: "800", marginBottom: 13 },
  buscar: { borderRadius: 12, borderWidth: 1, borderColor: "#f1d9d7", backgroundColor: "#fffafa", paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: "#344054" },
  filtros: { flexDirection: "row", gap: 8, marginTop: 10 },
  filtro: { borderRadius: 20, borderWidth: 1, borderColor: "#f1d9d7", paddingHorizontal: 12, paddingVertical: 7 },
  filtroActivo: { backgroundColor: "#fff0f1", borderColor: "#f3c9cd" },
  filtroTexto: { color: "#7d8797", fontSize: 12 },
  filtroTextoActivo: { color: "#AD4E4F", fontWeight: "700" },
  actualizando: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  clienteCard: { padding: 14, backgroundColor: "#fff", borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#f6e2e1" },
  clienteFila: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fce4e6", alignItems: "center", justifyContent: "center" },
  avatarTexto: { color: "#AD4E4F", fontSize: 18, fontWeight: "800" },
  clienteInfo: { flex: 1, minWidth: 0 },
  clienteNombre: { color: "#24324b", fontSize: 15, fontWeight: "700" },
  clienteId: { color: "#98a2b3", fontSize: 11, marginTop: 2 },
  correo: { color: "#667085", fontSize: 13, marginTop: 5 },
  detallesFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 12 },
  registro: { color: "#667085", fontSize: 12 },
  badges: { flexDirection: "row", gap: 7 },
  rolBadge: { overflow: "hidden", borderRadius: 16, backgroundColor: "#fff0f1", color: "#AD4E4F", paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: "700" },
  estadoBadge: { overflow: "hidden", borderRadius: 16, backgroundColor: "#d9f7e8", color: "#16804b", paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: "700" },
  verPerfil: { alignSelf: "flex-start", marginTop: 12, borderRadius: 10, backgroundColor: "#fff0f1", paddingHorizontal: 13, paddingVertical: 8 },
  verPerfilTexto: { color: "#AD4E4F", fontSize: 13, fontWeight: "700" },
  vacio: { alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f6e2e1", borderBottomLeftRadius: 18, borderBottomRightRadius: 18, padding: 28 },
  vacioTitulo: { color: "#542e30", fontSize: 16, fontWeight: "800" },
  vacioTexto: { color: "#7d8797", fontSize: 13, marginTop: 6, textAlign: "center" },
  pieLista: { color: "#8c7468", textAlign: "center", paddingVertical: 14, fontSize: 12 },
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(35, 25, 22, 0.48)", padding: 18 },
  perfilCard: { borderRadius: 22, backgroundColor: "#fff", padding: 21 },
  modalTitulo: { color: "#542e30", fontSize: 20, fontWeight: "800" },
  perfilCabecera: { alignItems: "center", paddingVertical: 19 },
  avatarGrande: { width: 72, height: 72, borderRadius: 36 },
  avatarTextoGrande: { fontSize: 29 },
  perfilNombre: { color: "#24324b", fontSize: 19, fontWeight: "800", marginTop: 10, textAlign: "center" },
  perfilCorreo: { color: "#667085", fontSize: 13, marginTop: 4, textAlign: "center" },
  perfilDatos: { borderRadius: 14, backgroundColor: "#fffafa", padding: 14 },
  datoLabel: { color: "#98a2b3", fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginTop: 9 },
  datoValor: { color: "#344054", fontSize: 14, marginTop: 3 },
  cerrarPerfil: { marginTop: 16, alignItems: "center", borderRadius: 12, backgroundColor: "#AD4E4F", paddingVertical: 12 },
  cerrarPerfilTexto: { color: "#fff", fontWeight: "800" },
});
