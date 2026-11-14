import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

type Pedido = {
  id: string;
  clienteNombre?: string;
  clienteEmail?: string;
  total?: number;
  estado?: string;
  fecha?: any;
  items?: any[];
};

const estados = ["Pendiente", "En proceso", "Completado"];

export default function GestionPedidosMovil() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [pedidoEstadoAbierto, setPedidoEstadoAbierto] = useState<string | null>(null);
  const [pedidoAEliminar, setPedidoAEliminar] = useState<Pedido | null>(null);
  const [errorEliminacion, setErrorEliminacion] = useState("");

  useEffect(() => {
    const consulta = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    return onSnapshot(
      consulta,
      (snapshot) => {
        setPedidos(snapshot.docs.map((pedido) => ({ id: pedido.id, ...pedido.data() })) as Pedido[]);
        setCargando(false);
      },
      (error) => {
        console.error("Error al obtener pedidos:", error);
        setCargando(false);
        Alert.alert("No se pudieron cargar los pedidos", "Revisa tu conexión e inténtalo de nuevo.");
      },
    );
  }, []);

  const cambiarEstado = async (pedido: Pedido, estado: string) => {
    setPedidoEstadoAbierto(null);
    try {
      await updateDoc(doc(db, "pedidos", pedido.id), { estado });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Alert.alert("Error", "No se pudo actualizar el estado del pedido.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!pedidoAEliminar) return;
    setErrorEliminacion("");
    try {
      await deleteDoc(doc(db, "pedidos", pedidoAEliminar.id));
      setPedidoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      setErrorEliminacion("No se pudo eliminar el pedido. Revisa los permisos de Firestore e inténtalo de nuevo.");
    }
  };

  const fechaPedido = (fecha: any) => {
    if (!fecha) return "Fecha no disponible";
    const date = fecha?.toDate ? fecha.toDate() : new Date(fecha);
    return Number.isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleDateString("es-SV");
  };

  const pendientes = pedidos.filter((pedido) => (pedido.estado || "Pendiente") === "Pendiente").length;
  const completados = pedidos.filter((pedido) => pedido.estado === "Completado").length;

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.cabecera}>
          <View style={styles.cabeceraTexto}>
            <Text style={styles.titulo}>Gestión de Pedidos</Text>
            <Text style={styles.subtitulo}>Supervisión y estado de las compras de Polet Plus.</Text>
          </View>
          <Pressable style={styles.botonRegresar} onPress={() => router.replace("/admin")}>
            <Text style={styles.botonRegresarTexto}>Regresar</Text>
          </Pressable>
        </View>

        <View style={styles.metricas}>
          <Metrica emoji="📦" etiqueta="Total pedidos" valor={pedidos.length} tono="rosa" />
          <Metrica emoji="⏳" etiqueta="Pendientes" valor={pendientes} tono="ambar" />
          <Metrica emoji="✅" etiqueta="Completados" valor={completados} tono="verde" />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitulo}>Listado de Pedidos</Text>
          {cargando ? (
            <View style={styles.estadoVacio}><ActivityIndicator color="#AD4E4F" /><Text style={styles.mensaje}>Cargando pedidos...</Text></View>
          ) : pedidos.length === 0 ? (
            <Text style={styles.estadoVacio}>No hay pedidos registrados todavía.</Text>
          ) : pedidos.map((pedido) => {
            const estado = pedido.estado || "Pendiente";
            return (
              <View key={pedido.id} style={styles.pedido}>
                <View style={styles.pedidoSuperior}>
                  <View style={styles.cliente}>
                    <Text style={styles.nombre}>{pedido.clienteNombre || "Sin nombre"}</Text>
                    <Text style={styles.correo}>{pedido.clienteEmail || "Sin correo"}</Text>
                  </View>
                  <Text style={styles.total}>${Number(pedido.total || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.filaEstado}>
                  <View style={[styles.etiquetaEstado, estado === "Completado" ? styles.estadoVerde : estado === "En proceso" ? styles.estadoAmbar : styles.estadoRosa]}>
                    <Text style={[styles.etiquetaTexto, estado === "Completado" ? styles.textoVerde : estado === "En proceso" ? styles.textoAmbar : styles.textoRosa]}>{estado}</Text>
                  </View>
                  <Pressable style={styles.selectorEstado} onPress={() => setPedidoEstadoAbierto(pedido.id)}>
                    <Text style={styles.selectorTexto}>Cambiar estado⌄</Text>
                  </Pressable>
                </View>
                <View style={styles.acciones}>
                  <Pressable style={styles.botonDetalle} onPress={() => setPedidoSeleccionado(pedido)}><Text style={styles.botonDetalleTexto}>Ver Detalle</Text></Pressable>
                  <Pressable style={styles.botonBorrar} onPress={() => { setErrorEliminacion(""); setPedidoAEliminar(pedido); }}><Text style={styles.botonBorrarTexto}>Borrar</Text></Pressable>
                </View>
                <Modal transparent visible={pedidoEstadoAbierto === pedido.id} animationType="fade" onRequestClose={() => setPedidoEstadoAbierto(null)}>
                  <Pressable style={styles.fondoModal} onPress={() => setPedidoEstadoAbierto(null)}>
                    <View style={styles.opcionesEstado}>
                      <Text style={styles.modalTitulo}>Cambiar estado</Text>
                      {estados.map((opcion) => <Pressable key={opcion} style={styles.opcion} onPress={() => cambiarEstado(pedido, opcion)}><Text style={styles.opcionTexto}>{opcion}</Text></Pressable>)}
                      <Pressable style={styles.cancelarOpcion} onPress={() => setPedidoEstadoAbierto(null)}><Text style={styles.cancelarTexto}>Cancelar</Text></Pressable>
                    </View>
                  </Pressable>
                </Modal>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal transparent visible={!!pedidoSeleccionado} animationType="slide" onRequestClose={() => setPedidoSeleccionado(null)}>
        <View style={styles.fondoModal}>
          <View style={styles.detalleModal}>
            <View style={styles.detalleCabecera}>
              <View><Text style={styles.modalTitulo}>Detalles del Pedido</Text><Text style={styles.detalleId}>ID: #{pedidoSeleccionado?.id.slice(0, 8).toUpperCase()}</Text></View>
              <Pressable onPress={() => setPedidoSeleccionado(null)}><Text style={styles.cerrar}>✕</Text></Pressable>
            </View>
            <ScrollView style={styles.detalleScroll}>
              <Text style={styles.detalleLinea}><Text style={styles.detalleNegrita}>Nombre: </Text>{pedidoSeleccionado?.clienteNombre || "Sin nombre registrado"}</Text>
              <Text style={styles.detalleLinea}><Text style={styles.detalleNegrita}>Correo: </Text>{pedidoSeleccionado?.clienteEmail || "Sin correo registrado"}</Text>
              <Text style={styles.detalleLinea}><Text style={styles.detalleNegrita}>Fecha: </Text>{fechaPedido(pedidoSeleccionado?.fecha)}</Text>
              <Text style={styles.productosTitulo}>Productos solicitados</Text>
              {pedidoSeleccionado?.items?.map((item, index) => (
                <View style={styles.item} key={`${pedidoSeleccionado.id}-${index}`}>
                  <View style={styles.itemTexto}><Text style={styles.nombre}>{item.nombre || "Producto"}</Text><Text style={styles.correo}>Tallas: {Array.isArray(item.tallas) ? item.tallas.join(", ") : item.talla || item.tallas || "No especificada"} · Cantidad: {item.cantidad || 1}</Text></View>
                  <Text style={styles.total}>${(Number(item.precio || 0) * Number(item.cantidad || 1)).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.totalDetalle}><Text style={styles.nombre}>Monto total</Text><Text style={styles.totalGrande}>${Number(pedidoSeleccionado?.total || 0).toFixed(2)}</Text></View>
            </ScrollView>
            <Pressable style={styles.botonCerrar} onPress={() => setPedidoSeleccionado(null)}><Text style={styles.botonCerrarTexto}>Cerrar</Text></Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!pedidoAEliminar} animationType="fade" onRequestClose={() => setPedidoAEliminar(null)}>
        <View style={styles.fondoModal}>
          <View style={styles.confirmacionModal}>
            <Text style={styles.modalTitulo}>¿Eliminar pedido?</Text>
            <Text style={styles.confirmacionTexto}>Se eliminará el pedido de {pedidoAEliminar?.clienteNombre || "este cliente"}. Esta acción no se puede deshacer.</Text>
            {!!errorEliminacion && <Text style={styles.errorEliminacion}>{errorEliminacion}</Text>}
            <View style={styles.botonesConfirmacion}>
              <Pressable style={styles.botonCancelar} onPress={() => setPedidoAEliminar(null)}><Text style={styles.botonCancelarTexto}>Cancelar</Text></Pressable>
              <Pressable style={styles.botonConfirmarBorrar} onPress={confirmarEliminacion}><Text style={styles.botonConfirmarTexto}>Sí, eliminar</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Metrica({ emoji, etiqueta, valor, tono }: { emoji: string; etiqueta: string; valor: number; tono: "rosa" | "ambar" | "verde" }) {
  return <View style={styles.metrica}><View style={[styles.iconoMetrica, tono === "rosa" ? styles.iconoRosa : tono === "ambar" ? styles.iconoAmbar : styles.iconoVerde]}><Text style={styles.emoji}>{emoji}</Text></View><View style={styles.metricaTexto}><Text style={styles.etiquetaMetrica}>{etiqueta}</Text><Text style={styles.valorMetrica}>{valor}</Text></View></View>;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#FFF9F6" }, contenido: { padding: 20, paddingBottom: 40 },
  cabecera: { marginBottom: 22 }, cabeceraTexto: { marginBottom: 14 }, titulo: { color: "#AD4E4F", fontSize: 26, fontWeight: "800" }, subtitulo: { color: "#596273", fontSize: 13, marginTop: 5, lineHeight: 19 },
  botonRegresar: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "white", borderColor: "#F3C9C9", borderWidth: 1, borderRadius: 12 }, botonRegresarTexto: { color: "#27344A", fontSize: 13, fontWeight: "600" },
  metricas: { gap: 12, marginBottom: 20 }, metrica: { backgroundColor: "white", padding: 15, borderRadius: 16, borderColor: "#F9DADA", borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14, elevation: 1 },
  iconoMetrica: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" }, iconoRosa: { backgroundColor: "#FFF0F0" }, iconoAmbar: { backgroundColor: "#FFFAE9" }, iconoVerde: { backgroundColor: "#E9FBF2" }, emoji: { fontSize: 21 }, metricaTexto: { gap: 2 }, etiquetaMetrica: { color: "#929BAB", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }, valorMetrica: { color: "#17243A", fontSize: 23, fontWeight: "800" },
  panel: { backgroundColor: "white", borderColor: "#F9DADA", borderWidth: 1, borderRadius: 17, overflow: "hidden" }, panelTitulo: { color: "#17243A", fontSize: 17, fontWeight: "700", padding: 18, borderBottomWidth: 1, borderBottomColor: "#FFF0F0" }, estadoVacio: { minHeight: 130, justifyContent: "center", alignItems: "center", padding: 24, gap: 10 }, mensaje: { color: "#777", fontSize: 13 },
  pedido: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#FFF0F0", gap: 14 }, pedidoSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }, cliente: { flex: 1 }, nombre: { color: "#17243A", fontSize: 14, fontWeight: "700" }, correo: { color: "#929BAB", fontSize: 11, marginTop: 3 }, total: { color: "#101C30", fontSize: 14, fontWeight: "800" }, filaEstado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, etiquetaEstado: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }, estadoRosa: { backgroundColor: "#FFE3E6" }, estadoAmbar: { backgroundColor: "#FFF2CC" }, estadoVerde: { backgroundColor: "#DDF8E9" }, etiquetaTexto: { fontSize: 11, fontWeight: "700" }, textoRosa: { color: "#CF2440" }, textoAmbar: { color: "#A46A00" }, textoVerde: { color: "#16824A" }, selectorEstado: { borderColor: "#D9DEE7", borderWidth: 1, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8 }, selectorTexto: { color: "#39465A", fontSize: 11 },
  acciones: { flexDirection: "row", gap: 9 }, botonDetalle: { backgroundColor: "#FFF0F0", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9 }, botonDetalleTexto: { color: "#AD4E4F", fontSize: 12, fontWeight: "700" }, botonBorrar: { backgroundColor: "#FFF0F2", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9 }, botonBorrarTexto: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  fondoModal: { flex: 1, backgroundColor: "rgba(20,25,35,0.48)", justifyContent: "center", alignItems: "center", padding: 20 }, opcionesEstado: { width: "100%", maxWidth: 400, backgroundColor: "white", borderRadius: 18, padding: 20 }, modalTitulo: { color: "#AD4E4F", fontSize: 19, fontWeight: "800" }, opcion: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F5E8E8" }, opcionTexto: { color: "#263449", fontSize: 15 }, cancelarOpcion: { paddingTop: 15, alignItems: "center" }, cancelarTexto: { color: "#AD4E4F", fontWeight: "700" },
  confirmacionModal: { width: "100%", maxWidth: 400, backgroundColor: "white", borderRadius: 18, padding: 22 }, confirmacionTexto: { color: "#596273", fontSize: 14, lineHeight: 21, marginTop: 10 }, errorEliminacion: { color: "#C62845", fontSize: 13, lineHeight: 19, marginTop: 12 }, botonesConfirmacion: { flexDirection: "row", gap: 10, marginTop: 22 }, botonCancelar: { flex: 1, alignItems: "center", padding: 12, borderRadius: 11, borderColor: "#D9DEE7", borderWidth: 1 }, botonCancelarTexto: { color: "#39465A", fontWeight: "700" }, botonConfirmarBorrar: { flex: 1, alignItems: "center", padding: 12, borderRadius: 11, backgroundColor: "#E11D48" }, botonConfirmarTexto: { color: "white", fontWeight: "700" },
  detalleModal: { width: "100%", maxWidth: 500, maxHeight: "90%", backgroundColor: "white", borderRadius: 20, padding: 20 }, detalleCabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: "#F5DEDE", paddingBottom: 14, marginBottom: 14 }, detalleId: { color: "#929BAB", fontSize: 11, marginTop: 4 }, cerrar: { color: "#818895", fontSize: 20, padding: 5 }, detalleScroll: { flexGrow: 0 }, detalleLinea: { color: "#455164", fontSize: 13, marginBottom: 9 }, detalleNegrita: { color: "#17243A", fontWeight: "700" }, productosTitulo: { color: "#697386", fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginTop: 12, marginBottom: 8 }, item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, padding: 12, marginBottom: 8, backgroundColor: "#FFF9F8", borderRadius: 11, borderColor: "#F9E4E4", borderWidth: 1 }, itemTexto: { flex: 1 }, totalDetalle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 }, totalGrande: { color: "#AD4E4F", fontSize: 20, fontWeight: "800" }, botonCerrar: { backgroundColor: "#AD4E4F", padding: 13, borderRadius: 12, alignItems: "center", marginTop: 8 }, botonCerrarTexto: { color: "white", fontSize: 14, fontWeight: "700" },
});
