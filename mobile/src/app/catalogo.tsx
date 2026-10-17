import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

// =========================
// PRODUCTOS BASE (FIJOS)
// =========================
const productosBase = [
  {
    id: "base-1",
    nombre: "Vestido blanco con flores",
    precio: 5.99,
    imagen: require("../../assets/Vestido blanco con flores.png"),
    tallas: ["XS"],
  },
  {
    id: "base-2",
    nombre: "Body Naranja",
    precio: 6.5,
    imagen: require("../../assets/Body naranja.png"),
    tallas: ["S"],
  },
  {
    id: "base-3",
    nombre: "Vestido playero",
    precio: 5.99,
    imagen: require("../../assets/Vestido playero.png"),
    tallas: ["M"],
  },
  {
    id: "base-4",
    nombre: "Body Azul",
    precio: 4.99,
    imagen: require("../../assets/Body azul.png"),
    tallas: ["L"],
  },
  {
    id: "base-5",
    nombre: "Body negro",
    precio: 5.99,
    imagen: require("../../assets/Body negro.png"),
    tallas: ["S"],
  },
  {
    id: "base-6",
    nombre: "Vestido largo negro",
    precio: 5.99,
    imagen: require("../../assets/Vestido largo negro.jpeg"),
    tallas: ["XL"],
  },
];

export default function Catalogo() {
  const [productos, setProductos] = useState<any[]>(productosBase);
  const [busqueda, setBusqueda] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("Todas");

  // Carrito de compras
  const [carrito, setCarrito] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // =========================
  // OBTENER PRODUCTOS DE FIRESTORE
  // =========================
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "productos"),
      (snapshot) => {
        const productosFirestore = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));
        setProductos([...productosBase, ...productosFirestore]);
      },
      (error) => {
        console.error("Error al obtener productos de Firestore:", error);
      }
    );

    return () => unsub();
  }, []);

  // =========================
  // FUNCIONES DEL CARRITO
  // =========================
  const agregarAlCarrito = (producto: any) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.id === producto.id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== productoId));
  };

  const vaciarCarrito = () => setCarrito([]);

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalCarrito = carrito.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * item.cantidad,
    0
  );

  const obtenerCantidadEnCarrito = (productoId: string) => {
    const item = carrito.find((i) => i.id === productoId);
    return item ? item.cantidad : 0;
  };

  // =========================
  // FILTRAR PRODUCTOS
  // =========================
  const productosFiltrados = productos.filter((producto: any) => {
    const coincideNombre = (producto.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const tallasProducto = Array.isArray(producto.tallas)
      ? producto.tallas
      : producto.talla
      ? [producto.talla]
      : [];

    const coincideTalla =
      tallaSeleccionada === "Todas" || tallasProducto.includes(tallaSeleccionada);

    return coincideNombre && coincideTalla;
  });

  // =========================
  // CONFIRMAR PEDIDO
  // =========================
  const confirmarPedido = async () => {
    if (carrito.length === 0) return;

    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert(
        "Sesión requerida",
        "Debes iniciar sesión antes de realizar un pedido."
      );
      setModalAbierto(false);
      router.push("/login");
      return;
    }

    setGuardando(true);

    try {
      let nombreCliente = "Cliente";
      const referenciaUsuario = doc(db, "users", usuario.uid);
      const documentoUsuario = await getDoc(referenciaUsuario);

      if (documentoUsuario.exists()) {
        const datosUsuario = documentoUsuario.data();
        nombreCliente =
          datosUsuario.nombre ||
          usuario.displayName ||
          usuario.email?.split("@")[0] ||
          "Cliente";
      } else {
        nombreCliente =
          usuario.displayName || usuario.email?.split("@")[0] || "Cliente";
      }

      await addDoc(collection(db, "pedidos"), {
        clienteNombre: nombreCliente,
        clienteEmail: usuario.email || "Sin correo",
        usuarioId: usuario.uid,
        items: carrito,
        total: parseFloat(totalCarrito.toFixed(2)),
        estado: "Pendiente",
        fecha: serverTimestamp(),
      });

      Alert.alert("¡Éxito!", "¡Pedido realizado con éxito!");
      vaciarCarrito();
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al realizar el pedido:", error);
      Alert.alert("Error", "No se pudo realizar el pedido. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const opcionesTalla = ["Todas", "XS", "S", "M", "L", "XL"];

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.brandText}>POLET PLUS</Text>
        </TouchableOpacity>

        <View style={styles.navRight}>
          <TouchableOpacity
            style={styles.cartIconButton}
            onPress={() => setModalAbierto(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.cartIconText}>🛒</Text>
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ENCABEZADO DE SECCIÓN */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>CATALOGO</Text>
          <Text style={styles.headerSubtitle}>
            Descubre nuestras prendas disponibles.
          </Text>
        </View>

        {/* BUSCADOR Y FILTRO DE TALLAS */}
        <View style={styles.filterCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor="#888"
            value={busqueda}
            onChangeText={setBusqueda}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tallasScroll}
          >
            {opcionesTalla.map((talla) => {
              const activa = tallaSeleccionada === talla;
              return (
                <TouchableOpacity
                  key={talla}
                  style={[styles.tallaPill, activa && styles.tallaPillActive]}
                  onPress={() => setTallaSeleccionada(talla)}
                >
                  <Text
                    style={[
                      styles.tallaPillText,
                      activa && styles.tallaPillTextActive,
                    ]}
                  >
                    {talla === "Todas" ? "Todas las tallas" : talla}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* GRID DE PRODUCTOS */}
        {productosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron productos.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {productosFiltrados.map((producto: any) => {
              const cantidad = obtenerCantidadEnCarrito(producto.id);
              const precioNumerico = Number(producto.precio) || 0;

              return (
                <View key={producto.id} style={styles.productCard}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={
                        typeof producto.imagen === "string"
                          ? { uri: producto.imagen }
                          : producto.imagen
                      }
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={styles.productTitle} numberOfLines={2}>
                    {producto.nombre}
                  </Text>

                  <Text style={styles.productPrice}>
                    ${precioNumerico.toFixed(2)}
                  </Text>

                  <Text style={styles.productSizes}>
                    Tallas:{" "}
                    {Array.isArray(producto.tallas)
                      ? producto.tallas.join(", ")
                      : producto.talla || "Única"}
                  </Text>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => agregarAlCarrito(producto)}
                    activeOpacity={0.8}
                  >
                    {cantidad > 0 ? (
                      <View style={styles.addMoreRow}>
                        <Text style={styles.addButtonText}>Agregar más</Text>
                        <View style={styles.countCircle}>
                          <Text style={styles.countCircleText}>{cantidad}</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.addButtonText}>Agregar al carrito</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* MODAL CARRITO DE COMPRAS */}
      <Modal visible={modalAbierto} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalDrawer}>
            {/* CABECERA DEL MODAL */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalCartIcon}>🛒</Text>
                <Text style={styles.modalTitle}>Tu Carrito</Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalAbierto(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* LISTA DE ITEMS */}
            <ScrollView style={styles.modalBody}>
              {carrito.length === 0 ? (
                <Text style={styles.emptyCartText}>Tu carrito está vacío.</Text>
              ) : (
                carrito.map((item) => (
                  <View key={item.id} style={styles.cartItemRow}>
                    <View style={styles.cartItemLeft}>
                      <Image
                        source={
                          typeof item.imagen === "string"
                            ? { uri: item.imagen }
                            : item.imagen
                        }
                        style={styles.cartItemImage}
                      />
                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemTitle}>{item.nombre}</Text>
                        <Text style={styles.cartItemSub}>
                          ${(Number(item.precio) || 0).toFixed(2)} x {item.cantidad}
                        </Text>
                        <Text style={styles.cartItemTalla}>
                          Talla:{" "}
                          {Array.isArray(item.tallas)
                            ? item.tallas.join(", ")
                            : item.talla || "No especificada"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cartItemRight}>
                      <Text style={styles.cartItemPrice}>
                        ${((Number(item.precio) || 0) * item.cantidad).toFixed(2)}
                      </Text>

                      <TouchableOpacity
                        onPress={() => eliminarDelCarrito(item.id)}
                        style={styles.deleteBadge}
                      >
                        <Text style={styles.deleteBadgeText}>Borrar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* PIE DEL MODAL */}
            {carrito.length > 0 ? (
              <View style={styles.modalFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>
                    ${totalCarrito.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmarPedido}
                  disabled={guardando}
                >
                  {guardando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Confirmar Pedido
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={styles.clearCartButton}
                    onPress={vaciarCarrito}
                  >
                    <Text style={styles.clearCartText}>Borrar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.returnButton}
                    onPress={() => setModalAbierto(false)}
                  >
                    <Text style={styles.returnText}>Regresar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.returnButtonFull}
                  onPress={() => setModalAbierto(false)}
                >
                  <Text style={styles.returnText}>Regresar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#efd2c7",
  },
  navbar: {
    height: 60,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  brandText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#AD4E4F",
    letterSpacing: 2,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartIconButton: {
    backgroundColor: "#AD4E4F",
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartIconText: {
    fontSize: 18,
    color: "#ffffff",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#AD4E4F",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginTop: 6,
  },
  filterCard: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
    marginBottom: 12,
  },
  tallasScroll: {
    flexDirection: "row",
  },
  tallaPill: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  tallaPillActive: {
    backgroundColor: "#AD4E4F",
    borderColor: "#AD4E4F",
  },
  tallaPillText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  tallaPillTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#4b5563",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between", // Distribuye los elementos en pares
  },
 productCard: {
    width: "48%", // 48% permite que exactamente dos tarjetas entren en una fila
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginTop: 6,
  },
  productSizes: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#AD4E4F",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  addMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countCircle: {
    backgroundColor: "#ffffff",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  countCircleText: {
    color: "#AD4E4F",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalDrawer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    paddingBottom: 14,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalCartIcon: {
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#9ca3af",
    fontWeight: "bold",
  },
  modalBody: {
    maxHeight: 320,
    marginVertical: 12,
  },
  emptyCartText: {
    textAlign: "center",
    color: "#6b7280",
    paddingVertical: 40,
    fontSize: 15,
  },
  cartItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cartItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  cartItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  cartItemSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cartItemTalla: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 1,
  },
  cartItemRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  deleteBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteBadgeText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "600",
  },
  modalFooter: {
    borderTopWidth: 1,
    borderColor: "#f3f4f6",
    paddingTop: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#AD4E4F",
  },
  confirmButton: {
    backgroundColor: "#AD4E4F",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerActions: {
    flexDirection: "row",
    gap: 10,
  },
  clearCartButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingVertical: 10,
    alignItems: "center",
  },
  clearCartText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  returnButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 10,
    alignItems: "center",
  },
  returnButtonFull: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    alignItems: "center",
  },
  returnText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
});