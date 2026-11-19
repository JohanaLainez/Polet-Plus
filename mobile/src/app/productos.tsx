import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const CATEGORIAS = ["Ropa", "Vestidos", "Bodys", "Accesorios"];
const TALLAS = ["XS", "S", "M", "L", "XL", "Única"];
const FORMULARIO_VACIO = {
  nombre: "",
  precio: "",
  categoria: "Ropa",
  talla: "XS",
  imagen: "",
};
const IMAGENES_LOCALES: Record<string, number> = {
  "Body azul.png": require("../../assets/images/Body azul.png"),
  "Body naranja.png": require("../../assets/images/Body naranja.png"),
  "Body negro.png": require("../../assets/images/Body negro.png"),
  "Pantalon de Mezclilla.png": require("../../assets/images/Pantalon de Mezclilla.png"),
  "Vestido blanco con flores.png": require("../../assets/images/Vestido blanco con flores.png"),
  "Vestido corto de rayas.png": require("../../assets/images/Vestido corto de rayas.png"),
  "Vestido de noche color negro.jpeg": require("../../assets/images/Vestido de noche color negro.jpeg"),
  "Vestido fucsia.png": require("../../assets/images/Vestido fucsia.png"),
  "Vestido largo negro.jpeg": require("../../assets/images/Vestido largo negro.jpeg"),
  "Vestido playero.png": require("../../assets/images/Vestido playero.png"),
  "Camisa-Hello-kitty.jpeg": require("../../assets/images/Camisa-Hello-kitty.jpeg"),
};

type Producto = {
  id: string;
  nombre?: string;
  precio?: number | string;
  categoria?: string;
  talla?: string;
  imagen?: string;
};

export default function ProductosAdmin() {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [productoBorrar, setProductoBorrar] = useState<Producto | null>(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarProductos = useCallback(async () => {
    setCargando(true);
      setError("");
    try {
      const resultado = await getDocs(collection(db, "productos"));
      const lista = resultado.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Producto[];
      lista.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      setProductos(lista);
    } catch (e) {
      console.error("No se pudieron cargar los productos:", e);
      setError("No se pudieron cargar los productos. Revisa tu conexión y los permisos de Firestore.");
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
          await cargarProductos();
        } else {
          router.replace("/inicio");
        }
      } catch (e) {
        console.error("No se pudo verificar el administrador:", e);
        setError("No se pudo verificar tu acceso de administrador.");
      } finally {
        setVerificando(false);
      }
    });
    return cancelar;
  }, [cargarProductos]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();
    if (!texto) return productos;
    return productos.filter((producto) =>
      (producto.nombre || "").toLocaleLowerCase().includes(texto),
    );
  }, [busqueda, productos]);

  const abrirCrear = () => {
    setProductoEditar(null);
    setFormulario(FORMULARIO_VACIO);
    setMensaje("");
    setModalAbierto(true);
  };

  const abrirEditar = (producto: Producto) => {
    setProductoEditar(producto);
    setFormulario({
      nombre: producto.nombre || "",
      precio: String(producto.precio ?? ""),
      categoria: producto.categoria || "Ropa",
      talla: producto.talla || "Única",
      imagen: producto.imagen || "",
    });
    setMensaje("");
    setModalAbierto(true);
  };

  const guardarProducto = async () => {
    const nombre = formulario.nombre.trim();
    const precio = Number(formulario.precio);
    if (!nombre || !formulario.precio.trim() || !Number.isFinite(precio) || precio < 0) {
      setMensaje("Escribe un nombre y un precio válido (0 o mayor).");
      return;
    }

    setGuardando(true);
    setMensaje("");
    const datos = {
      nombre,
      precio,
      categoria: formulario.categoria,
      talla: formulario.talla,
      imagen: formulario.imagen.trim(),
    };
    try {
      if (productoEditar) {
        await updateDoc(doc(db, "productos", productoEditar.id), datos);
      } else {
        await addDoc(collection(db, "productos"), {
          ...datos,
          fechaCreacion: serverTimestamp(),
        });
      }
      setModalAbierto(false);
      setProductoEditar(null);
      await cargarProductos();
    } catch (e) {
      console.error("No se pudo guardar el producto:", e);
      setMensaje("No se pudo guardar. Revisa los permisos de Firestore.");
    } finally {
      setGuardando(false);
    }
  };

  const borrarProducto = async () => {
    if (!productoBorrar) return;
    setGuardando(true);
    try {
      await deleteDoc(doc(db, "productos", productoBorrar.id));
      setProductoBorrar(null);
      await cargarProductos();
    } catch (e) {
      console.error("No se pudo borrar el producto:", e);
      setMensaje("No se pudo borrar. Revisa los permisos de Firestore.");
      setProductoBorrar(null);
    } finally {
      setGuardando(false);
    }
  };

  if (verificando || (autorizado && cargando && productos.length === 0 && !error)) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#AD4E4F" />
        <Text style={styles.cargandoTexto}>Cargando productos…</Text>
      </View>
    );
  }

  if (!autorizado) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.cargandoTexto}>{error || "Verificando acceso…"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <TouchableOpacity style={styles.volver} onPress={() => router.replace("/admin")}>
          <Text style={styles.volverTexto}>‹  Admin</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Gestión de productos</Text>
        <Text style={styles.subtitulo}>Administra prendas, precios y tallas.</Text>
      </View>

      <View style={styles.barraAcciones}>
        <TextInput
          style={styles.buscar}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar producto…"
          placeholderTextColor="#a58d80"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.botonAgregar} onPress={abrirCrear}>
          <Text style={styles.botonAgregarTexto}>＋ Agregar</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cargando ? (
        <View style={styles.cargandoLista}>
          <ActivityIndicator color="#AD4E4F" />
          <Text style={styles.vacioTexto}>Actualizando catálogo…</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>No hay productos</Text>
              <Text style={styles.vacioTexto}>
                {busqueda ? "Prueba otra búsqueda." : "Agrega el primer producto al catálogo."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const uri = item.imagen || "";
            const nombreImagen = decodeURIComponent(uri.split("/").pop() || uri);
            const imagenLocal = IMAGENES_LOCALES[nombreImagen];
            const imagenWeb = /^https?:\/\//i.test(uri);
            return (
              <View style={styles.productoCard}>
                {imagenLocal ? (
                    <Image source={imagenLocal} style={styles.imagen} resizeMode="cover" alt={item.nombre || "Imagen del producto"} />
                ) : imagenWeb ? (
                  <Image source={{ uri }} style={styles.imagen} resizeMode="cover" alt={item.nombre || "Imagen del producto"} />
                ) : (
                  <View style={[styles.imagen, styles.imagenVacia]}>
                    <Text style={styles.iconoPrenda}>◇</Text>
                  </View>
                )}
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre} numberOfLines={2}>{item.nombre || "Producto"}</Text>
                  <Text style={styles.productoId}>ID: {item.id.slice(0, 8)}</Text>
                  <View style={styles.etiquetas}>
                    <Text style={styles.etiqueta}>{item.categoria || "Ropa"}</Text>
                    <Text style={styles.talla}>Talla {item.talla || "Única"}</Text>
                  </View>
                  <Text style={styles.precio}>${Number(item.precio || 0).toFixed(2)}</Text>
                  <View style={styles.botonesFila}>
                    <TouchableOpacity style={styles.botonEditar} onPress={() => abrirEditar(item)}>
                      <Text style={styles.botonEditarTexto}>✎ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botonBorrar} onPress={() => { setMensaje(""); setProductoBorrar(item); }}>
                      <Text style={styles.botonBorrarTexto}>⌫ Borrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modalAbierto} animationType="slide" transparent onRequestClose={() => setModalAbierto(false)}>
        <KeyboardAvoidingView style={styles.modalFondo} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>{productoEditar ? "Editar producto" : "Agregar producto"}</Text>
              <Text style={styles.label}>Nombre del producto</Text>
              <TextInput
                style={styles.input}
                value={formulario.nombre}
                onChangeText={(nombre) => setFormulario((actual) => ({ ...actual, nombre }))}
                placeholder="Ej. Vestido fucsia"
                placeholderTextColor="#a58d80"
              />
              <Text style={styles.label}>Precio ($)</Text>
              <TextInput
                style={styles.input}
                value={formulario.precio}
                onChangeText={(precio) => setFormulario((actual) => ({ ...actual, precio }))}
                placeholder="0.00"
                placeholderTextColor="#a58d80"
                keyboardType="decimal-pad"
              />
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.opciones}>
                {CATEGORIAS.map((categoria) => (
                  <TouchableOpacity
                    key={categoria}
                    style={[styles.opcion, formulario.categoria === categoria && styles.opcionActiva]}
                    onPress={() => setFormulario((actual) => ({ ...actual, categoria }))}
                  >
                    <Text style={[styles.opcionTexto, formulario.categoria === categoria && styles.opcionTextoActivo]}>{categoria}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Talla</Text>
              <View style={styles.opciones}>
                {TALLAS.map((talla) => (
                  <TouchableOpacity
                    key={talla}
                    style={[styles.opcion, formulario.talla === talla && styles.opcionActiva]}
                    onPress={() => setFormulario((actual) => ({ ...actual, talla }))}
                  >
                    <Text style={[styles.opcionTexto, formulario.talla === talla && styles.opcionTextoActivo]}>{talla}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>URL de imagen (opcional)</Text>
              <TextInput
                style={styles.input}
                value={formulario.imagen}
                onChangeText={(imagen) => setFormulario((actual) => ({ ...actual, imagen }))}
                placeholder="https://…"
                placeholderTextColor="#a58d80"
                autoCapitalize="none"
              />
              {mensaje ? <Text style={styles.error}>{mensaje}</Text> : null}
              <View style={styles.modalBotones}>
                <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalAbierto(false)}>
                  <Text style={styles.cancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botonGuardar, guardando && styles.deshabilitado]} onPress={guardarProducto} disabled={guardando}>
                  <Text style={styles.guardarTexto}>{guardando ? "Guardando…" : "Guardar"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={Boolean(productoBorrar)} transparent animationType="fade" onRequestClose={() => setProductoBorrar(null)}>
        <View style={styles.modalFondo}>
          <View style={styles.confirmarCard}>
            <Text style={styles.modalTitulo}>¿Borrar producto?</Text>
            <Text style={styles.confirmarTexto}>{productoBorrar?.nombre} se eliminará del catálogo.</Text>
            {mensaje ? <Text style={styles.error}>{mensaje}</Text> : null}
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setProductoBorrar(null)}>
                <Text style={styles.cancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonEliminar, guardando && styles.deshabilitado]} onPress={borrarProducto} disabled={guardando}>
                <Text style={styles.guardarTexto}>{guardando ? "Borrando…" : "Borrar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#fcf5f2" },
  centrado: { flex: 1, backgroundColor: "#fcf5f2", justifyContent: "center", alignItems: "center", padding: 24 },
  cargandoTexto: { marginTop: 12, color: "#8c7468", textAlign: "center" },
  encabezado: { backgroundColor: "#fcf5f2", paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  volver: { alignSelf: "flex-start", marginBottom: 16, paddingVertical: 5 },
  volverTexto: { color: "#AD4E4F", fontSize: 15, fontWeight: "700" },
  titulo: { color: "#9e4a49", fontSize: 27, lineHeight: 33, fontWeight: "800" },
  subtitulo: { color: "#8c7468", fontSize: 14, marginTop: 5 },
  barraAcciones: { flexDirection: "row", gap: 9, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#f0e6e1" },
  buscar: { flex: 1, minWidth: 0, borderRadius: 12, borderWidth: 1, borderColor: "#f4e3da", backgroundColor: "#fcf8f5", paddingHorizontal: 13, paddingVertical: 11, color: "#4a3b32", fontSize: 14 },
  botonAgregar: { borderRadius: 12, backgroundColor: "#b85d5c", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  botonAgregarTexto: { color: "#fff", fontWeight: "700", fontSize: 13 },
  lista: { padding: 14, paddingBottom: 32, gap: 12 },
  productoCard: { flexDirection: "row", padding: 12, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e8e4", gap: 12, elevation: 1 },
  imagen: { width: 76, height: 92, borderRadius: 12, backgroundColor: "#f6eee9" },
  imagenVacia: { alignItems: "center", justifyContent: "center" },
  iconoPrenda: { fontSize: 32, color: "#c2877f" },
  productoInfo: { flex: 1, minWidth: 0 },
  productoNombre: { color: "#4a3b32", fontWeight: "800", fontSize: 15 },
  productoId: { color: "#b09b8e", fontSize: 11, marginTop: 3 },
  etiquetas: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 8 },
  etiqueta: { color: "#b85d5c", backgroundColor: "#fbebe6", borderRadius: 20, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: "700" },
  talla: { color: "#7a6254", fontSize: 12 },
  precio: { marginTop: 7, color: "#4a3b32", fontSize: 16, fontWeight: "800" },
  botonesFila: { flexDirection: "row", gap: 8, marginTop: 10 },
  botonEditar: { backgroundColor: "#fbebe6", borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 },
  botonEditarTexto: { color: "#b85d5c", fontSize: 12, fontWeight: "700" },
  botonBorrar: { backgroundColor: "#fff0f1", borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 },
  botonBorrarTexto: { color: "#d13d58", fontSize: 12, fontWeight: "700" },
  vacio: { alignItems: "center", padding: 30, marginTop: 15, backgroundColor: "#fff", borderRadius: 18 },
  vacioTitulo: { color: "#4a3b32", fontWeight: "800", fontSize: 17 },
  vacioTexto: { color: "#8c7468", marginTop: 6, textAlign: "center", fontSize: 13 },
  cargandoLista: { padding: 30, alignItems: "center" },
  error: { color: "#b4233d", fontSize: 13, marginHorizontal: 16, marginTop: 8 },
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(35, 25, 22, 0.48)", padding: 16 },
  modalCard: { maxHeight: "90%", backgroundColor: "#fff", borderRadius: 22, padding: 20 },
  confirmarCard: { backgroundColor: "#fff", borderRadius: 22, padding: 22 },
  modalTitulo: { color: "#4a3b32", fontSize: 21, fontWeight: "800", marginBottom: 16 },
  confirmarTexto: { color: "#8c7468", lineHeight: 20 },
  label: { color: "#8c7468", fontSize: 13, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  input: { borderRadius: 11, borderWidth: 1, borderColor: "#eadbd4", backgroundColor: "#fcf8f5", paddingHorizontal: 12, paddingVertical: 11, color: "#4a3b32", fontSize: 15 },
  opciones: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  opcion: { borderRadius: 20, borderWidth: 1, borderColor: "#eadbd4", paddingHorizontal: 11, paddingVertical: 7 },
  opcionActiva: { backgroundColor: "#b85d5c", borderColor: "#b85d5c" },
  opcionTexto: { color: "#7a6254", fontSize: 12 },
  opcionTextoActivo: { color: "#fff", fontWeight: "700" },
  modalBotones: { flexDirection: "row", gap: 10, marginTop: 20 },
  botonCancelar: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 11, borderWidth: 1, borderColor: "#eadbd4", paddingVertical: 12 },
  cancelarTexto: { color: "#7a6254", fontWeight: "700" },
  botonGuardar: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#b85d5c", paddingVertical: 12 },
  botonEliminar: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#c83d53", paddingVertical: 12 },
  guardarTexto: { color: "#fff", fontWeight: "800" },
  deshabilitado: { opacity: 0.6 },
});
