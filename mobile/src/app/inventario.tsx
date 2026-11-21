import { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { router } from "expo-router";

// ==============================
// TIPOS
// ==============================

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  talla: string;
  stock: number;
  precio: number;
};

type FiltroEstado =
  | "Todos"
  | "Disponible"
  | "Stock bajo"
  | "Agotado";

const FILTROS: FiltroEstado[] = [
  "Todos",
  "Disponible",
  "Stock bajo",
  "Agotado",
];

// ==============================
// DATOS DE DEMOSTRACIÓN
// (los mismos de la versión web)
// ==============================

const PRODUCTOS_INICIALES: Producto[] = [
  { id: 1, nombre: "Vestido blanco con flores", categoria: "Vestidos", talla: "M", stock: 15, precio: 28.5 },
  { id: 2, nombre: "Vestido corto de rayas", categoria: "Vestidos", talla: "S", stock: 8, precio: 25.0 },
  { id: 3, nombre: "Vestido fucsia", categoria: "Vestidos", talla: "M", stock: 4, precio: 30.0 },
  { id: 4, nombre: "Pantalón de Mezclilla", categoria: "Pantalones", talla: "L", stock: 3, precio: 32.5 },
  { id: 5, nombre: "Vestido de noche color negro", categoria: "Vestidos", talla: "S", stock: 0, precio: 45.0 },
  { id: 6, nombre: "Body azul", categoria: "Bodys", talla: "M", stock: 12, precio: 18.5 },
  { id: 7, nombre: "Body naranja", categoria: "Bodys", talla: "S", stock: 7, precio: 18.5 },
  { id: 8, nombre: "Body negro", categoria: "Bodys", talla: "M", stock: 10, precio: 18.5 },
];

// ==============================
// ESTADO SEGÚN STOCK
// ==============================

const obtenerEstado = (stock: number) => {
  if (stock === 0) {
    return { texto: "Agotado", fondo: "#fee2e2", color: "#b91c1c" };
  }

  if (stock <= 5) {
    return { texto: "Stock bajo", fondo: "#ffedd5", color: "#c2410c" };
  }

  return { texto: "Disponible", fondo: "#dcfce7", color: "#15803d" };
};

export default function Inventario() {
  // ==============================
  // ESTADOS
  // ==============================

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("Todos");
  const [productos, setProductos] =
    useState<Producto[]>(PRODUCTOS_INICIALES);

  // ==============================
  // SUMAR / RESTAR STOCK
  // ==============================

  const cambiarStock = (id: number, cantidad: number) => {
    setProductos((productosActuales) =>
      productosActuales.map((producto) =>
        producto.id === id
          ? { ...producto, stock: Math.max(0, producto.stock + cantidad) }
          : producto
      )
    );
  };

  // ==============================
  // RESUMEN
  // ==============================

  const totalProductos = productos.length;

  const unidadesDisponibles = productos.reduce(
    (total, producto) => total + producto.stock,
    0
  );

  const productosStockBajo = productos.filter(
    (producto) => producto.stock > 0 && producto.stock <= 5
  ).length;

  const productosAgotados = productos.filter(
    (producto) => producto.stock === 0
  ).length;

  // ==============================
  // BÚSQUEDA Y FILTRO
  // ==============================

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideBusqueda = producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincideFiltro =
        filtro === "Todos" ||
        (filtro === "Disponible" && producto.stock > 5) ||
        (filtro === "Stock bajo" && producto.stock > 0 && producto.stock <= 5) ||
        (filtro === "Agotado" && producto.stock === 0);

      return coincideBusqueda && coincideFiltro;
    });
  }, [productos, busqueda, filtro]);

  // ==============================
  // ACCIONES SIN IMPLEMENTAR
  // (en la web estos botones tampoco hacen nada todavía)
  // ==============================

  const funcionPendiente = (nombre: string) => {
    Alert.alert(nombre, "Esta función todavía no está disponible.");
  };

  // ==============================
  // INTERFAZ
  // ==============================

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View style={styles.encabezado}>
          <TouchableOpacity
            style={styles.botonVolver}
            onPress={() => router.replace("/admin")}
            accessibilityLabel="Volver al panel"
          >
            <Text style={styles.botonVolverTexto}>←</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>Inventario</Text>
            <Text style={styles.subtitulo}>
              Control y seguimiento de existencias de productos.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botonEntrada}
          onPress={() => funcionPendiente("Registrar entrada")}
        >
          <Text style={styles.botonEntradaTexto}>+ Registrar entrada</Text>
        </TouchableOpacity>

        {/* TARJETAS DE RESUMEN */}
        <View style={styles.resumen}>
          <View style={styles.resumenTarjeta}>
            <View style={styles.resumenFila}>
              <Text style={styles.resumenEtiqueta}>Productos</Text>
              <View style={[styles.icono, { backgroundColor: "#fbebe6" }]}>
                <Text style={styles.iconoTexto}>📦</Text>
              </View>
            </View>
            <Text style={styles.resumenNumero}>{totalProductos}</Text>
            <Text style={styles.resumenNota}>Productos registrados</Text>
          </View>

          <View style={styles.resumenTarjeta}>
            <View style={styles.resumenFila}>
              <Text style={styles.resumenEtiqueta}>Unidades</Text>
              <View style={[styles.icono, { backgroundColor: "#eff6ff" }]}>
                <Text style={styles.iconoTexto}>🗃️</Text>
              </View>
            </View>
            <Text style={styles.resumenNumero}>{unidadesDisponibles}</Text>
            <Text style={styles.resumenNota}>Existencias actuales</Text>
          </View>

          <View style={styles.resumenTarjeta}>
            <View style={styles.resumenFila}>
              <Text style={styles.resumenEtiqueta}>Stock bajo</Text>
              <View style={[styles.icono, { backgroundColor: "#fff7ed" }]}>
                <Text style={styles.iconoTexto}>⚠️</Text>
              </View>
            </View>
            <Text style={styles.resumenNumero}>{productosStockBajo}</Text>
            <Text style={[styles.resumenNota, { color: "#ea580c" }]}>
              Requieren reposición
            </Text>
          </View>

          <View style={styles.resumenTarjeta}>
            <View style={styles.resumenFila}>
              <Text style={styles.resumenEtiqueta}>Agotados</Text>
              <View style={[styles.icono, { backgroundColor: "#fef2f2" }]}>
                <Text style={styles.iconoTexto}>🚫</Text>
              </View>
            </View>
            <Text style={styles.resumenNumero}>{productosAgotados}</Text>
            <Text style={[styles.resumenNota, { color: "#dc2626" }]}>
              Sin existencias
            </Text>
          </View>
        </View>

        {/* EXISTENCIAS */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Existencias</Text>
          <Text style={styles.seccionSubtitulo}>
            Consulta y actualiza las cantidades disponibles.
          </Text>

          {/* BUSCADOR */}
          <TextInput
            style={styles.buscador}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar producto..."
            placeholderTextColor="#b09b8e"
            autoCorrect={false}
            returnKeyType="search"
          />

          {/* FILTRO */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtros}
            keyboardShouldPersistTaps="handled"
          >
            {FILTROS.map((opcion) => {
              const activo = filtro === opcion;

              return (
                <TouchableOpacity
                  key={opcion}
                  style={[styles.filtro, activo && styles.filtroActivo]}
                  onPress={() => setFiltro(opcion)}
                >
                  <Text
                    style={[
                      styles.filtroTexto,
                      activo && styles.filtroTextoActivo,
                    ]}
                  >
                    {opcion}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* LISTA */}
          {productosFiltrados.length === 0 ? (
            <Text style={styles.vacio}>No se encontraron productos.</Text>
          ) : (
            productosFiltrados.map((producto) => {
              const estado = obtenerEstado(producto.stock);

              return (
                <View key={producto.id} style={styles.producto}>
                  {/* PRODUCTO */}
                  <View style={styles.productoCabecera}>
                    <View style={styles.productoIcono}>
                      <Text style={styles.iconoTexto}>📦</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.productoNombre}>
                        {producto.nombre}
                      </Text>
                      <Text style={styles.productoSku}>
                        SKU-{String(producto.id).padStart(4, "0")}
                      </Text>
                    </View>

                    <View
                      style={[styles.estado, { backgroundColor: estado.fondo }]}
                    >
                      <Text style={[styles.estadoTexto, { color: estado.color }]}>
                        {estado.texto}
                      </Text>
                    </View>
                  </View>

                  {/* DATOS */}
                  <View style={styles.productoDatos}>
                    <View style={styles.categoria}>
                      <Text style={styles.categoriaTexto}>
                        {producto.categoria}
                      </Text>
                    </View>

                    <Text style={styles.productoDato}>
                      Talla: {producto.talla}
                    </Text>

                    <Text style={styles.productoPrecio}>
                      ${producto.precio.toFixed(2)}
                    </Text>
                  </View>

                  {/* STOCK + ACCIÓN */}
                  <View style={styles.productoPie}>
                    <View style={styles.stock}>
                      <TouchableOpacity
                        style={[
                          styles.botonStock,
                          producto.stock === 0 && styles.botonStockInactivo,
                        ]}
                        onPress={() => cambiarStock(producto.id, -1)}
                        disabled={producto.stock === 0}
                        accessibilityLabel={`Restar una unidad de ${producto.nombre}`}
                      >
                        <Text style={styles.botonStockTexto}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.stockNumero}>{producto.stock}</Text>

                      <TouchableOpacity
                        style={styles.botonStock}
                        onPress={() => cambiarStock(producto.id, 1)}
                        accessibilityLabel={`Sumar una unidad de ${producto.nombre}`}
                      >
                        <Text style={styles.botonStockTexto}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.botonEditar}
                      onPress={() => funcionPendiente("Editar producto")}
                    >
                      <Text style={styles.botonEditarTexto}>✏️ Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* AVISO */}
        <View style={styles.aviso}>
          <Text style={styles.avisoTitulo}>Información del inventario</Text>
          <Text style={styles.avisoTexto}>
            Los datos mostrados actualmente son datos de demostración para
            representar la gestión de existencias del sistema. Posteriormente
            pueden conectarse con la colección de productos de Firebase.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ==============================
// ESTILOS
// ==============================

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#fcf5f2",
  },

  contenido: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },

  // ENCABEZADO
  encabezado: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  botonVolver: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecdd3",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  botonVolverTexto: {
    fontSize: 20,
    color: "#666",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#9e4a49",
  },

  subtitulo: {
    marginTop: 2,
    fontSize: 13,
    color: "#8c7468",
  },

  botonEntrada: {
    marginTop: 18,
    backgroundColor: "#b85d5c",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  botonEntradaTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // RESUMEN
  resumen: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 20,
  },

  resumenTarjeta: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  resumenFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resumenEtiqueta: {
    fontSize: 12,
    color: "#8c7468",
  },

  resumenNumero: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a3b32",
  },

  resumenNota: {
    marginTop: 4,
    fontSize: 11,
    color: "#b09b8e",
  },

  icono: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  iconoTexto: {
    fontSize: 15,
  },

  // EXISTENCIAS
  seccion: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  seccionTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a3b32",
  },

  seccionSubtitulo: {
    marginTop: 3,
    fontSize: 13,
    color: "#8c7468",
  },

  buscador: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#f4e3da",
    backgroundColor: "#fcf8f5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#4a3b32",
  },

  filtros: {
    gap: 8,
    paddingVertical: 12,
  },

  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f4e3da",
    backgroundColor: "#fcf8f5",
  },

  filtroActivo: {
    backgroundColor: "#b85d5c",
    borderColor: "#b85d5c",
  },

  filtroTexto: {
    fontSize: 13,
    color: "#4a3b32",
    fontWeight: "500",
  },

  filtroTextoActivo: {
    color: "#fff",
    fontWeight: "700",
  },

  vacio: {
    textAlign: "center",
    paddingVertical: 36,
    fontSize: 14,
    color: "#8c7468",
  },

  // PRODUCTO
  producto: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 14,
    padding: 12,
  },

  productoCabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  productoIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fbebe6",
    alignItems: "center",
    justifyContent: "center",
  },

  productoNombre: {
    fontWeight: "700",
    color: "#4a3b32",
    fontSize: 14,
  },

  productoSku: {
    marginTop: 1,
    fontSize: 11,
    color: "#b09b8e",
  },

  estado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: "700",
  },

  productoDatos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },

  categoria: {
    backgroundColor: "#fbebe6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoriaTexto: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b85d5c",
  },

  productoDato: {
    fontSize: 13,
    color: "#7a6254",
  },

  productoPrecio: {
    marginLeft: "auto",
    fontSize: 15,
    fontWeight: "700",
    color: "#4a3b32",
  },

  productoPie: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  stock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  botonStock: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  botonStockInactivo: {
    opacity: 0.3,
  },

  botonStockTexto: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "600",
  },

  stockNumero: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b32",
  },

  botonEditar: {
    backgroundColor: "#fbebe6",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  botonEditarTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b85d5c",
  },

  // AVISO
  aviso: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f4e3da",
    padding: 16,
  },

  avisoTitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a3b32",
  },

  avisoTexto: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#8c7468",
  },
});