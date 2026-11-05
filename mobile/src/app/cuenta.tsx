import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function Cuenta() {
  const [usuario, setUsuario] = useState<any>(null);
  const [datosUsuario, setDatosUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (usuarioActual) => {
      if (!usuarioActual) {
        router.replace("/login");
        return;
      }

      setUsuario(usuarioActual);

      try {
        // DATOS PERSONALES
        const referenciaUsuario = doc(db, "users", usuarioActual.uid);
        const documentoUsuario = await getDoc(referenciaUsuario);

        if (documentoUsuario.exists()) {
          setDatosUsuario(documentoUsuario.data());
        }

        // PEDIDOS DEL USUARIO
        const consultaPedidos = query(
          collection(db, "pedidos"),
          where("clienteEmail", "==", usuarioActual.email)
        );

        const resultadoPedidos = await getDocs(consultaPedidos);

        const listaPedidos = resultadoPedidos.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        listaPedidos.sort((a: any, b: any) => {
          const fechaA = a.fecha?.toDate?.()?.getTime() || 0;
          const fechaB = b.fecha?.toDate?.()?.getTime() || 0;
          return fechaB - fechaA;
        });

        setPedidos(listaPedidos);
      } catch (error) {
        console.log("Error cargando la cuenta:", error);
      } finally {
        setCargando(false);
      }
    });

    return () => cancelar();
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.log("Error cerrando sesión:", error);
    }
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#AD4E4F" />
        <Text style={styles.cargandoTexto}>Cargando tu cuenta...</Text>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>POLET PLUS</Text>
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Text style={styles.volver}>← Regresar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.titulo}>Mi cuenta</Text>
        <Text style={styles.subtitulo}>
          Consulta tu información personal y tus pedidos.
        </Text>

        {/* INFORMACIÓN PERSONAL */}
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>Información personal</Text>

          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>Nombre</Text>
            <Text style={styles.datoValor}>
              {datosUsuario?.nombre || "No disponible"}
            </Text>
          </View>

          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>Correo electrónico</Text>
            <Text style={styles.datoValor}>{usuario?.email}</Text>
          </View>
        </View>

        {/* PEDIDOS */}
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>Mis pedidos</Text>

          {pedidos.length === 0 ? (
            <View style={styles.sinPedidos}>
              <Text style={styles.sinPedidosTexto}>
                Todavía no tienes pedidos.
              </Text>

              <TouchableOpacity
                style={styles.botonCatalogo}
                onPress={() => router.push("/catalogo")}
              >
                <Text style={styles.botonCatalogoTexto}>Ver catálogo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            pedidos.map((pedido) => (
              <View key={pedido.id} style={styles.pedido}>
                <View style={styles.pedidoCabecera}>
                  <Text style={styles.pedidoNumero}>
                    #{pedido.id.substring(0, 8).toUpperCase()}
                  </Text>

                  <Text
                    style={[
                      styles.pedidoEstado,
                      pedido.estado === "Completado" &&
                        styles.estadoCompletado,
                      pedido.estado === "En proceso" && styles.estadoProceso,
                    ]}
                  >
                    {pedido.estado || "Pendiente"}
                  </Text>
                </View>

                <Text style={styles.pedidoFecha}>
                  {pedido.fecha?.toDate
                    ? pedido.fecha.toDate().toLocaleDateString("es-SV")
                    : "Fecha no disponible"}
                </Text>

                {pedido.items?.map((item: any, index: number) => (
                  <View key={index} style={styles.item}>
                    {item.imagen && (
                      <Image
                        source={{ uri: item.imagen }}
                        style={styles.itemImagen}
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemNombre}>{item.nombre}</Text>
                      <Text style={styles.itemDetalle}>
                        Cantidad: {item.cantidad || 1}
                      </Text>
                    </View>
                    <Text style={styles.itemPrecio}>
                      $
                      {(
                        Number(item.precio || 0) * Number(item.cantidad || 1)
                      ).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <Text style={styles.pedidoTotal}>
                  Total: ${Number(pedido.total || 0).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logout} onPress={cerrarSesion}>
          <Text style={styles.logoutTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#efd2c7" },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#efd2c7",
  },
  cargandoTexto: { marginTop: 15, color: "#AD4E4F", fontWeight: "600" },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AD4E4F",
    letterSpacing: 2,
  },
  volver: { color: "#666", fontWeight: "600" },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#AD4E4F",
    marginTop: 20,
    marginHorizontal: 20,
  },
  subtitulo: { color: "#666", marginTop: 5, marginHorizontal: 20 },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 20,
  },
  tarjetaTitulo: { fontSize: 18, fontWeight: "bold", color: "#333" },
  dato: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  datoEtiqueta: { fontSize: 12, color: "#AD4E4F", fontWeight: "600" },
  datoValor: { marginTop: 4, color: "#333", fontSize: 15 },
  sinPedidos: { alignItems: "center", paddingVertical: 25 },
  sinPedidosTexto: { color: "#999", marginBottom: 15 },
  botonCatalogo: {
    backgroundColor: "#AD4E4F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botonCatalogoTexto: { color: "#fff", fontWeight: "600" },
  pedido: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  pedidoCabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pedidoNumero: { fontWeight: "700", color: "#333" },
  pedidoEstado: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AD4E4F",
    backgroundColor: "#fdecec",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  estadoCompletado: { color: "#15803d", backgroundColor: "#dcfce7" },
  estadoProceso: { color: "#b45309", backgroundColor: "#fef3c7" },
  pedidoFecha: { color: "#999", fontSize: 12, marginTop: 4 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  itemImagen: { width: 44, height: 44, borderRadius: 8 },
  itemNombre: { fontWeight: "600", color: "#333" },
  itemDetalle: { color: "#999", fontSize: 12 },
  itemPrecio: { fontWeight: "700", color: "#AD4E4F" },
  pedidoTotal: {
    marginTop: 12,
    textAlign: "right",
    fontWeight: "700",
    color: "#AD4E4F",
  },
  logout: {
    marginHorizontal: 20,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutTexto: { color: "#dc2626", fontWeight: "700" },
});