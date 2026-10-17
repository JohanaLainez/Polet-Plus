import { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";

import { router } from "expo-router";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function Admin() {
  // =============================
  // ESTADOS
  // =============================

  const [verificando, setVerificando] =
    useState(true);

  const [autorizado, setAutorizado] =
    useState(false);

  const [nombreAdmin, setNombreAdmin] =
    useState("");

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  // =============================
  // DATOS DE EJEMPLO
  // =============================

  const pedidosSemana = [
    { dia: "Lun", cantidad: 5 },
    { dia: "Mar", cantidad: 8 },
    { dia: "Mié", cantidad: 4 },
    { dia: "Jue", cantidad: 10 },
    { dia: "Vie", cantidad: 15 },
    { dia: "Sáb", cantidad: 10 },
    { dia: "Dom", cantidad: 6 },
  ];

  const pedidosRecientes = [
    {
      id: "#001",
      cliente: "Andrea R.",
      total: 28,
      estado: "Pendiente",
    },
    {
      id: "#002",
      cliente: "Sofía L.",
      total: 28,
      estado: "Entregado",
    },
    {
      id: "#003",
      cliente: "Daniel M.",
      total: 42,
      estado: "Pendiente",
    },
  ];

  const maxPedidos = Math.max(
    ...pedidosSemana.map(
      (dia) => dia.cantidad
    )
  );

  const totalPedidosSemana =
    pedidosSemana.reduce(
      (total, dia) =>
        total + dia.cantidad,
      0
    );

  // =============================
  // PROTEGER RUTA ADMIN
  // =============================

  useEffect(() => {
    const cancelarObservador =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            setVerificando(false);

            router.replace(
              "/login"
            );

            return;
          }

          try {
            const referenciaUsuario =
              doc(
                db,
                "users",
                usuario.uid
              );

            const documentoUsuario =
              await getDoc(
                referenciaUsuario
              );

            if (
              !documentoUsuario.exists()
            ) {
              router.replace(
                "/login"
              );

              return;
            }

            const datosUsuario =
              documentoUsuario.data();

            if (
              datosUsuario.rol ===
              "admin"
            ) {
              setAutorizado(true);

              setNombreAdmin(
                datosUsuario.nombre ||
                  "Administrador"
              );
            } else {
              // Si es cliente
              router.replace(
                "/home"
              );
            }
          } catch (error) {
            console.log(
              "Error verificando permisos:",
              error
            );

            Alert.alert(
              "Error",
              "No se pudo verificar el usuario."
            );

            router.replace(
              "/login"
            );
          } finally {
            setVerificando(false);
          }
        }
      );

    return () =>
      cancelarObservador();
  }, []);

  // =============================
  // CERRAR SESIÓN
  // =============================

  const cerrarSesion = async () => {
    try {
      await signOut(auth);

      setMenuAbierto(false);

      router.replace("/");
    } catch (error) {
      console.log(
        "Error al cerrar sesión:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudo cerrar la sesión."
      );
    }
  };

  // =============================
  // CARGANDO
  // =============================

  if (verificando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color="#AD4E4F"
        />

        <Text
          style={
            styles.cargandoTexto
          }
        >
          Verificando acceso...
        </Text>
      </View>
    );
  }

  // Evitar mostrar contenido
  // si no tiene autorización
  if (!autorizado) {
    return null;
  }

  // =============================
  // INTERFAZ
  // =============================

  return (
    <View style={styles.pantalla}>
      {/* =========================
          NAVBAR
      ========================= */}

      <View style={styles.navbar}>
        <View>
          <Text style={styles.logo}>
            POLET PLUS
          </Text>

          <Text
            style={
              styles.panelTexto
            }
          >
            Panel administrativo
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.menuBoton
          }
          onPress={() =>
            setMenuAbierto(true)
          }
        >
          <Text
            style={
              styles.menuIcono
            }
          >
            ☰
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================
          CONTENIDO
      ========================= */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contenido
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ENCABEZADO */}

        <View>
          <Text
            style={
              styles.dashboardTitulo
            }
          >
            Dashboard
          </Text>

          <Text
            style={
              styles.dashboardSubtitulo
            }
          >
            Resumen general de
            Polet Plus
          </Text>

          <Text
            style={
              styles.sesionTexto
            }
          >
            Sesión iniciada como
          </Text>

          <Text
            style={
              styles.nombreAdmin
            }
          >
            {nombreAdmin}
          </Text>
        </View>

        {/* =========================
            TARJETAS PRINCIPALES
        ========================= */}

        <View
          style={
            styles.tarjetasContenedor
          }
        >
          {/* PENDIENTES */}

          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() =>
              router.push(
                "/pedidos"
              )
            }
          >
            <Text
              style={
                styles.tarjetaLabel
              }
            >
              Pedidos pendientes
            </Text>

            <Text
              style={
                styles.tarjetaNumero
              }
            >
              8
            </Text>
          </TouchableOpacity>

          {/* ENTREGADOS */}

          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() =>
              router.push(
                "/pedidos"
              )
            }
          >
            <Text
              style={
                styles.tarjetaLabel
              }
            >
              Pedidos entregados
            </Text>

            <Text
              style={
                styles.tarjetaNumero
              }
            >
              24
            </Text>
          </TouchableOpacity>

          {/* PRODUCTOS */}

          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() =>
              router.push(
                "/productos"
              )
            }
          >
            <Text
              style={
                styles.tarjetaLabel
              }
            >
              Productos disponibles
            </Text>

            <Text
              style={
                styles.tarjetaNumero
              }
            >
              36
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            GRÁFICA
        ========================= */}

        <View
          style={
            styles.graficaCard
          }
        >
          <View
            style={
              styles.graficaHeader
            }
          >
            <View>
              <Text
                style={
                  styles.seccionTitulo
                }
              >
                Pedidos de la semana
              </Text>

              <Text
                style={
                  styles.descripcion
                }
              >
                Cantidad de pedidos
                por día
              </Text>
            </View>

            <Text
              style={
                styles.graficaIcono
              }
            >
              ↗
            </Text>
          </View>

          {/* BARRAS */}

          <View
            style={
              styles.grafica
            }
          >
            {pedidosSemana.map(
              (dia) => {
                const porcentaje =
                  dia.cantidad /
                  maxPedidos;

                return (
                  <View
                    key={dia.dia}
                    style={
                      styles.barraGrupo
                    }
                  >
                    <Text
                      style={
                        styles.barraCantidad
                      }
                    >
                      {
                        dia.cantidad
                      }
                    </Text>

                    <View
                      style={
                        styles.barraContenedor
                      }
                    >
                      <View
                        style={[
                          styles.barra,
                          {
                            height:
                              `${porcentaje * 100}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.barraDia
                      }
                    >
                      {dia.dia}
                    </Text>
                  </View>
                );
              }
            )}
          </View>

          {/* TOTAL */}

          <View
            style={
              styles.totalSemana
            }
          >
            <Text
              style={
                styles.totalLabel
              }
            >
              Total de pedidos
            </Text>

            <Text
              style={
                styles.totalNumero
              }
            >
              {
                totalPedidosSemana
              }{" "}
              pedidos
            </Text>
          </View>
        </View>

        {/* =========================
            PEDIDOS RECIENTES
        ========================= */}

        <View
          style={
            styles.pedidosCard
          }
        >
          <View
            style={
              styles.seccionHeader
            }
          >
            <Text
              style={
                styles.seccionTitulo
              }
            >
              Pedidos recientes
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/pedidos"
                )
              }
            >
              <Text
                style={
                  styles.verTodos
                }
              >
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          {pedidosRecientes.map(
            (pedido) => (
              <View
                key={pedido.id}
                style={
                  styles.pedidoFila
                }
              >
                <View>
                  <Text
                    style={
                      styles.pedidoId
                    }
                  >
                    {pedido.id}
                  </Text>

                  <Text
                    style={
                      styles.pedidoCliente
                    }
                  >
                    {
                      pedido.cliente
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.pedidoDerecha
                  }
                >
                  <Text
                    style={
                      styles.pedidoTotal
                    }
                  >
                    $
                    {pedido.total.toFixed(
                      2
                    )}
                  </Text>

                  <View
                    style={[
                      styles.estado,
                      pedido.estado ===
                      "Entregado"
                        ? styles.estadoEntregado
                        : styles.estadoPendiente,
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoTexto,
                        pedido.estado ===
                        "Entregado"
                          ? styles.textoEntregado
                          : styles.textoPendiente,
                      ]}
                    >
                      {
                        pedido.estado
                      }
                    </Text>
                  </View>
                </View>
              </View>
            )
          )}

          <TouchableOpacity
            style={
              styles.botonAdministrar
            }
            onPress={() =>
              router.push(
                "/pedidos"
              )
            }
          >
            <Text
              style={
                styles.textoAdministrar
              }
            >
              Administrar pedidos
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            ADMINISTRACIÓN
        ========================= */}

        <Text
          style={
            styles.administracionTitulo
          }
        >
          Administración
        </Text>

        {/* PRODUCTOS */}

        <TouchableOpacity
          style={
            styles.opcionAdmin
          }
          onPress={() =>
            router.push(
              "/productos"
            )
          }
        >
          <Text
            style={
              styles.opcionTitulo
            }
          >
            Productos
          </Text>

          <Text
            style={
              styles.opcionDescripcion
            }
          >
            Ver y administrar productos
          </Text>
        </TouchableOpacity>

        {/* PEDIDOS */}

        <TouchableOpacity
          style={
            styles.opcionAdmin
          }
          onPress={() =>
            router.push(
              "/pedidos"
            )
          }
        >
          <Text
            style={
              styles.opcionTitulo
            }
          >
            Pedidos
          </Text>

          <Text
            style={
              styles.opcionDescripcion
            }
          >
            Revisar pedidos de clientes
          </Text>
        </TouchableOpacity>

        {/* INVENTARIO */}

        <TouchableOpacity
          style={
            styles.opcionAdmin
          }
          onPress={() =>
            router.push(
              "/inventario"
            )
          }
        >
          <Text
            style={
              styles.opcionTitulo
            }
          >
            Inventario
          </Text>

          <Text
            style={
              styles.opcionDescripcion
            }
          >
            Revisar disponibilidad
            de productos
          </Text>
        </TouchableOpacity>

        {/* CLIENTES */}

        <TouchableOpacity
          style={
            styles.opcionAdmin
          }
          onPress={() =>
            router.push(
              "/clientes"
            )
          }
        >
          <Text
            style={
              styles.opcionTitulo
            }
          >
            Clientes
          </Text>

          <Text
            style={
              styles.opcionDescripcion
            }
          >
            Consultar usuarios
            registrados
          </Text>
        </TouchableOpacity>

        {/* CONFIGURACIÓN */}

        <TouchableOpacity
          style={
            styles.opcionAdmin
          }
          onPress={() =>
            router.push(
              "/configuracion"
            )
          }
        >
          <Text
            style={
              styles.opcionTitulo
            }
          >
            Configuración
          </Text>

          <Text
            style={
              styles.opcionDescripcion
            }
          >
            Configuración de Polet Plus
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* =========================
          MENÚ HAMBURGUESA
      ========================= */}

      <Modal
        visible={menuAbierto}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMenuAbierto(false)
        }
      >
        <View
          style={
            styles.modalFondo
          }
        >
          {/* FONDO OSCURO */}

          <TouchableOpacity
            style={
              styles.modalEspacio
            }
            activeOpacity={1}
            onPress={() =>
              setMenuAbierto(false)
            }
          />

          {/* PANEL */}

          <View
            style={
              styles.menuPanel
            }
          >
            <TouchableOpacity
              style={
                styles.cerrarBoton
              }
              onPress={() =>
                setMenuAbierto(false)
              }
            >
              <Text
                style={
                  styles.cerrarTexto
                }
              >
                ✕
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.menuLogo
              }
            >
              POLET PLUS
            </Text>

            <Text
              style={
                styles.menuUsuario
              }
            >
              {nombreAdmin}
            </Text>

            {/* DASHBOARD */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() =>
                setMenuAbierto(false)
              }
            >
              <Text
                style={
                  styles.menuActivo
                }
              >
                Dashboard
              </Text>
            </TouchableOpacity>

            {/* PRODUCTOS */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(false);

                router.push(
                  "/productos"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Productos
              </Text>
            </TouchableOpacity>

            {/* PEDIDOS */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(false);

                router.push(
                  "/pedidos"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Pedidos
              </Text>
            </TouchableOpacity>

            {/* INVENTARIO */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(false);

                router.push(
                  "/inventario"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Inventario
              </Text>
            </TouchableOpacity>

            {/* CLIENTES */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(false);

                router.push(
                  "/clientes"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Clientes
              </Text>
            </TouchableOpacity>

            {/* CONFIGURACIÓN */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(false);

                router.push(
                  "/configuracion"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Configuración
              </Text>
            </TouchableOpacity>

            {/* CERRAR SESIÓN */}

            <TouchableOpacity
              style={[
                styles.menuOpcion,
                styles.logoutOpcion,
              ]}
              onPress={
                cerrarSesion
              }
            >
              <Text
                style={
                  styles.logoutTexto
                }
              >
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =============================
// ESTILOS
// =============================

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#f7f8fb",
  },

  container: {
    flex: 1,
  },

  contenido: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 50,
  },

  // CARGA

  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fb",
  },

  cargandoTexto: {
    marginTop: 15,
    color: "#AD4E4F",
    fontSize: 17,
    fontWeight: "600",
  },

  // NAVBAR

  navbar: {
    backgroundColor: "#fff",

    paddingTop: 52,
    paddingBottom: 15,
    paddingHorizontal: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  logo: {
    color: "#AD4E4F",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  panelTexto: {
    color: "#888",
    marginTop: 3,
    fontSize: 13,
  },

  menuBoton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#AD4E4F",

    justifyContent: "center",
    alignItems: "center",
  },

  menuIcono: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },

  // DASHBOARD

  dashboardTitulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
  },

  dashboardSubtitulo: {
    marginTop: 5,
    color: "#777",
    fontSize: 15,
  },

  sesionTexto: {
    marginTop: 18,
    fontSize: 12,
    color: "#999",
  },

  nombreAdmin: {
    marginTop: 2,
    color: "#AD4E4F",
    fontWeight: "bold",
    fontSize: 16,
  },

  // TARJETAS

  tarjetasContenedor: {
    marginTop: 28,
    gap: 15,
  },

  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,

    borderWidth: 1,
    borderColor: "#f0f0f0",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  tarjetaLabel: {
    color: "#777",
    fontSize: 14,
  },

  tarjetaNumero: {
    marginTop: 10,
    color: "#AD4E4F",
    fontWeight: "bold",
    fontSize: 36,
  },

  // GRÁFICA

  graficaCard: {
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,

    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  graficaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  seccionTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },

  descripcion: {
    marginTop: 4,
    color: "#888",
    fontSize: 13,
  },

  graficaIcono: {
    backgroundColor: "#fdf0f1",
    color: "#AD4E4F",
    fontSize: 20,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 8,
  },

  grafica: {
    height: 240,
    marginTop: 30,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",

    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  barraGrupo: {
    flex: 1,
    height: "100%",

    alignItems: "center",
    justifyContent: "flex-end",
  },

  barraCantidad: {
    marginBottom: 6,
    fontSize: 11,
    color: "#999",
  },

  barraContenedor: {
    height: 170,
    width: "65%",

    justifyContent: "flex-end",
    alignItems: "center",
  },

  barra: {
    width: "100%",
    backgroundColor: "#DCA4A5",

    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,

    minHeight: 5,
  },

  barraDia: {
    marginTop: 8,
    marginBottom: 8,
    color: "#777",
    fontSize: 11,
  },

  totalSemana: {
    marginTop: 17,

    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: "#777",
    fontSize: 13,
  },

  totalNumero: {
    color: "#AD4E4F",
    fontSize: 13,
    fontWeight: "bold",
  },

  // PEDIDOS

  pedidosCard: {
    marginTop: 25,
    padding: 20,

    backgroundColor: "#fff",
    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  seccionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 10,
  },

  verTodos: {
    color: "#AD4E4F",
    fontWeight: "600",
  },

  pedidoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 16,

    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  pedidoId: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },

  pedidoCliente: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  pedidoDerecha: {
    alignItems: "flex-end",
  },

  pedidoTotal: {
    fontWeight: "bold",
    color: "#555",
  },

  estado: {
    marginTop: 5,

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 15,
  },

  estadoPendiente: {
    backgroundColor: "#fff3e6",
  },

  estadoEntregado: {
    backgroundColor: "#e9f8ee",
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: "600",
  },

  textoPendiente: {
    color: "#e58a30",
  },

  textoEntregado: {
    color: "#38a169",
  },

  botonAdministrar: {
    marginTop: 18,

    backgroundColor: "#fdf0f1",

    paddingVertical: 13,

    borderRadius: 12,

    alignItems: "center",
  },

  textoAdministrar: {
    color: "#AD4E4F",
    fontWeight: "bold",
  },

  // ADMINISTRACIÓN

  administracionTitulo: {
    marginTop: 32,
    marginBottom: 15,

    fontSize: 23,
    fontWeight: "bold",

    color: "#222",
  },

  opcionAdmin: {
    backgroundColor: "#fff",

    borderRadius: 16,
    padding: 18,

    marginBottom: 13,

    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  opcionTitulo: {
    color: "#AD4E4F",
    fontSize: 17,
    fontWeight: "bold",
  },

  opcionDescripcion: {
    marginTop: 5,
    color: "#888",
    fontSize: 13,
  },

  // MENÚ

  modalFondo: {
    flex: 1,
    flexDirection: "row",

    backgroundColor:
      "rgba(0,0,0,0.4)",
  },

  modalEspacio: {
    width: "25%",
  },

  menuPanel: {
    width: "75%",
    height: "100%",

    paddingTop: 55,
    paddingHorizontal: 25,

    backgroundColor: "#fff",
  },

  cerrarBoton: {
    alignSelf: "flex-end",
  },

  cerrarTexto: {
    color: "#AD4E4F",
    fontSize: 28,
  },

  menuLogo: {
    marginTop: 20,

    color: "#AD4E4F",
    fontSize: 24,
    fontWeight: "bold",
  },

  menuUsuario: {
    marginTop: 5,
    marginBottom: 25,

    color: "#777",
  },

  menuOpcion: {
    paddingVertical: 17,

    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  menuTexto: {
    color: "#444",
    fontSize: 17,
  },

  menuActivo: {
    color: "#AD4E4F",
    fontSize: 17,
    fontWeight: "bold",
  },

  logoutOpcion: {
    marginTop: 20,
  },

  logoutTexto: {
    color: "#AD4E4F",
    fontSize: 17,
    fontWeight: "bold",
  },
});