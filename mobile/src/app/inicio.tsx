import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function AdminDashboardFull() {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Métricas
  const [pedidosPendientes, setPedidosPendientes] = useState(8);
  const [pedidosEntregados, setPedidosEntregados] = useState(24);
  const [totalProductos, setTotalProductos] = useState(36);
  const [ultimosPedidos, setUltimosPedidos] = useState<any[]>([]);

  // PROTEGER RUTA ADMIN Y MANDAR CLIENTES AL CATÁLOGO
  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setVerificando(false);
        router.replace("/login");
        return;
      }

      try {
        const referenciaUsuario = doc(db, "users", usuario.uid);
        const documentoUsuario = await getDoc(referenciaUsuario);

        if (!documentoUsuario.exists()) {
          // Si el usuario no tiene documento en Firestore, redirigir al catálogo por defecto
          setVerificando(false);
          router.replace("/catalogo");
          return;
        }

        const datosUsuario = documentoUsuario.data();

        if (datosUsuario.rol === "admin") {
          // SI ES ADMIN -> ACCESO PERMITIDO AL DASHBOARD
          setAutorizado(true);
          setNombreAdmin(datosUsuario.nombre || "Administrador");
        } else {
          // SI ES CLIENTE -> REDIRIGIR INMEDIATAMENTE AL CATÁLOGO
          router.replace("/catalogo");
        }
      } catch (error) {
        console.error("Error verificando permisos:", error);
        router.replace("/catalogo");
      } finally {
        setVerificando(false);
      }
    });

    return () => cancelarObservador();
  }, []);

  // CARGAR DATOS EN TIEMPO REAL DESDE FIRESTORE (SOLO SI ES ADMIN)
  useEffect(() => {
    if (!autorizado) return;

    const unsubPedidos = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (docs.length > 0) {
        const pendientes = docs.filter(
          (p: any) => p.estado === "Pendiente" || !p.estado
        ).length;
        const entregados = docs.filter(
          (p: any) => p.estado === "Entregado"
        ).length;

        setPedidosPendientes(pendientes);
        setPedidosEntregados(entregados);
        setUltimosPedidos(docs.slice(0, 5));
      }
    });

    const unsubProductos = onSnapshot(
      collection(db, "productos"),
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          setTotalProductos(snapshot.docs.length);
        }
      }
    );

    return () => {
      unsubPedidos();
      unsubProductos();
    };
  }, [autorizado]);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const pedidosSemana = [
    { dia: "Lun", cantidad: 5 },
    { dia: "Mar", cantidad: 8 },
    { dia: "Mié", cantidad: 4 },
    { dia: "Jue", cantidad: 10 },
    { dia: "Vie", cantidad: 15 },
    { dia: "Sáb", cantidad: 10 },
    { dia: "Dom", cantidad: 6 },
  ];

  const maxPedidos = Math.max(...pedidosSemana.map((dia) => dia.cantidad));
  const totalPedidosSemana = pedidosSemana.reduce(
    (total, dia) => total + dia.cantidad,
    0
  );

  // PANTALLA DE VERIFICACIÓN
  if (verificando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AD4E4F" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  // Si no está autorizado (cliente redirigiéndose o sin permisos), no renderizar el Dashboard
  if (!autorizado) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* NAVBAR SUPERIOR CON MENÚ HAMBURGUESA */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => setMenuAbierto(true)}
          style={styles.hamburgerButton}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/inicio")}>
          <Text style={styles.brandText}>POLET PLUS</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cerrarSesion} style={styles.logoutIconButton}>
          <Text style={{ fontSize: 16 }}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* MENÚ LATERAL (DRAWER / MODAL) COMPLETO */}
      <Modal
        visible={menuAbierto}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuAbierto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarBrand}>POLET PLUS</Text>
              <TouchableOpacity onPress={() => setMenuAbierto(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarNav}>
              <TouchableOpacity
                style={[styles.sidebarLink, styles.sidebarLinkActive]}
                onPress={() => setMenuAbierto(false)}
              >
                <Text style={styles.sidebarLinkActiveText}>📊 Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarLink}
                onPress={() => {
                  setMenuAbierto(false);
                  router.push("/catalogo");
                }}
              >
                <Text style={styles.sidebarLinkText}>📦 Productos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarLink}
                onPress={() => {
                  setMenuAbierto(false);
                  router.push("/catalogo");
                }}
              >
                <Text style={styles.sidebarLinkText}>🛍️ Pedidos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarLink}
                onPress={() => setMenuAbierto(false)}
              >
                <Text style={styles.sidebarLinkText}>🗃️ Inventario</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarLink}
                onPress={() => setMenuAbierto(false)}
              >
                <Text style={styles.sidebarLinkText}>👥 Clientes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarLink}
                onPress={() => setMenuAbierto(false)}
              >
                <Text style={styles.sidebarLinkText}>⚙️ Configuración</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidebarLink, { marginTop: 40 }]}
                onPress={cerrarSesion}
              >
                <Text style={[styles.sidebarLinkText, { color: "#ef4444" }]}>
                  🚪 Cerrar sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ENCABEZADO Y SESIÓN */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.pageTitle}>Dashboard</Text>
            <Text style={styles.pageSubtitle}>Resumen general de Polet Plus</Text>
          </View>

          <View style={styles.userInfoCard}>
            <Text style={styles.userLabel}>Sesión iniciada como</Text>
            <Text style={styles.userName}>{nombreAdmin}</Text>
          </View>
        </View>

        {/* TARJETAS METRICAS */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pedidos pendientes</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{pedidosPendientes}</Text>
              <Text style={styles.metricIcon}>🛍️</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pedidos entregados</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{pedidosEntregados}</Text>
              <Text style={styles.metricIcon}>📈</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Productos disponibles</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricValue}>{totalProductos}</Text>
              <Text style={styles.metricIcon}>📦</Text>
            </View>
          </View>
        </View>

        {/* GRÁFICA DE PEDIDOS */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Pedidos de la semana</Text>
              <Text style={styles.cardSubtitle}>Cantidad de pedidos por día</Text>
            </View>
            <View style={styles.iconPill}>
              <Text style={{ fontSize: 16 }}>📈</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {pedidosSemana.map((item) => {
              const alturaPorcentaje = (item.cantidad / maxPedidos) * 100;
              return (
                <View key={item.dia} style={styles.chartColumn}>
                  <Text style={styles.chartValueText}>{item.cantidad}</Text>

                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${alturaPorcentaje}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.chartDayText}>{item.dia}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterLabel}>Total de pedidos</Text>
            <Text style={styles.chartFooterValue}>
              {totalPedidosSemana} pedidos
            </Text>
          </View>
        </View>

        {/* PEDIDOS RECIENTES */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Pedidos recientes</Text>
            <TouchableOpacity onPress={() => router.push("/catalogo")}>
              <Text style={styles.linkText}>Ver todos ↗</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {ultimosPedidos.length > 0 ? (
              ultimosPedidos.map((pedido, index) => (
                <View key={pedido.id || index} style={styles.recentItem}>
                  <View>
                    <Text style={styles.orderIdText}>
                      #{pedido.id ? pedido.id.slice(0, 5) : `00${index + 1}`}
                    </Text>
                    <Text style={styles.clientNameText}>
                      {pedido.clienteNombre || "Cliente"}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.orderAmountText}>
                      ${(Number(pedido.total) || 28).toFixed(2)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        pedido.estado === "Entregado"
                          ? styles.statusGreen
                          : styles.statusOrange,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          pedido.estado === "Entregado"
                            ? styles.statusGreenText
                            : styles.statusOrangeText,
                        ]}
                      >
                        {pedido.estado || "Pendiente"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <>
                <View style={styles.recentItem}>
                  <View>
                    <Text style={styles.orderIdText}>#001</Text>
                    <Text style={styles.clientNameText}>Andrea R.</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.orderAmountText}>$28.00</Text>
                    <View style={[styles.statusBadge, styles.statusOrange]}>
                      <Text style={[styles.statusText, styles.statusOrangeText]}>
                        Pendiente
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.recentItem}>
                  <View>
                    <Text style={styles.orderIdText}>#002</Text>
                    <Text style={styles.clientNameText}>Sofía L.</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.orderAmountText}>$28.00</Text>
                    <View style={[styles.statusBadge, styles.statusGreen]}>
                      <Text style={[styles.statusText, styles.statusGreenText]}>
                        Entregado
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.recentItem}>
                  <View>
                    <Text style={styles.orderIdText}>#003</Text>
                    <Text style={styles.clientNameText}>Daniel M.</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.orderAmountText}>$42.00</Text>
                    <View style={[styles.statusBadge, styles.statusOrange]}>
                      <Text style={[styles.statusText, styles.statusOrangeText]}>
                        Pendiente
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.adminOrdersButton}
            onPress={() => router.push("/catalogo")}
          >
            <Text style={styles.adminOrdersButtonText}>
              Administrar pedidos
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f8fb" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#AD4E4F",
  },
  navbar: {
    height: 60,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  hamburgerButton: { padding: 6 },
  hamburgerIcon: { fontSize: 22, color: "#AD4E4F" },
  brandText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AD4E4F",
    letterSpacing: 2,
  },
  logoutIconButton: { backgroundColor: "#fdf0f1", padding: 8, borderRadius: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
  },
  sidebar: {
    width: "75%",
    backgroundColor: "#ffffff",
    height: "100%",
    padding: 20,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  sidebarBrand: { fontSize: 20, fontWeight: "bold", color: "#AD4E4F" },
  closeIcon: { fontSize: 20, fontWeight: "bold", color: "#6b7280" },
  sidebarNav: { gap: 10 },
  sidebarLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sidebarLinkActive: { backgroundColor: "#fdf0f1" },
  sidebarLinkActiveText: { color: "#AD4E4F", fontWeight: "bold", fontSize: 16 },
  sidebarLinkText: { color: "#4b5563", fontWeight: "600", fontSize: 16 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pageTitle: { fontSize: 26, fontWeight: "bold", color: "#111827" },
  pageSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  userInfoCard: { alignItems: "flex-end" },
  userLabel: { fontSize: 11, color: "#6b7280" },
  userName: { fontSize: 13, fontWeight: "bold", color: "#AD4E4F" },
  metricsGrid: { gap: 12, marginBottom: 20 },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    elevation: 2,
  },
  metricLabel: { fontSize: 13, color: "#6b7280" },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  metricValue: { fontSize: 32, fontWeight: "bold", color: "#AD4E4F" },
  metricIcon: { fontSize: 24 },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 20,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  iconPill: { backgroundColor: "#fdf0f1", padding: 8, borderRadius: 10 },
  chartContainer: {
    flexDirection: "row",
    height: 180,
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  chartValueText: { fontSize: 10, color: "#9ca3af", marginBottom: 4 },
  barTrack: {
    height: 120,
    width: 20,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#DCA4A5",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartDayText: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  chartFooterLabel: { fontSize: 13, color: "#6b7280" },
  chartFooterValue: { fontSize: 14, fontWeight: "bold", color: "#AD4E4F" },
  linkText: { color: "#AD4E4F", fontWeight: "bold", fontSize: 14 },
  recentList: { marginTop: 12 },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  orderIdText: { fontSize: 14, fontWeight: "bold", color: "#1f2937" },
  clientNameText: { fontSize: 13, color: "#6b7280" },
  orderAmountText: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  statusOrange: { backgroundColor: "#fff7ed" },
  statusOrangeText: { color: "#f97316" },
  statusGreen: { backgroundColor: "#f0fdf4" },
  statusGreenText: { color: "#16a34a" },
  statusText: { fontSize: 11, fontWeight: "600" },
  adminOrdersButton: {
    backgroundColor: "#fdf0f1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  adminOrdersButtonText: { color: "#AD4E4F", fontWeight: "bold", fontSize: 14 },
});