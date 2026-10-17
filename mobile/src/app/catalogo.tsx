import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

// ==========================================
// PRODUCTOS BASE
// ==========================================

const productosBase = [
  {
    id: "base-1",
    nombre: "Vestido blanco con flores",
    precio: 5.99,
    imagen: require(
      "../../assets/images/Vestido blanco con flores.png"
    ),
    tallas: ["XS"],
  },
  {
    id: "base-2",
    nombre: "Body Naranja",
    precio: 6.5,
    imagen: require(
      "../../assets/images/Body naranja.png"
    ),
    tallas: ["S"],
  },
  {
    id: "base-3",
    nombre: "Vestido playero",
    precio: 5.99,
    imagen: require(
      "../../assets/images/Vestido playero.png"
    ),
    tallas: ["M"],
  },
  {
    id: "base-4",
    nombre: "Body Azul",
    precio: 4.99,
    imagen: require(
      "../../assets/images/Body azul.png"
    ),
    tallas: ["L"],
  },
  {
    id: "base-5",
    nombre: "Body negro",
    precio: 5.99,
    imagen: require(
      "../../assets/images/Body negro.png"
    ),
    tallas: ["S"],
  },
  {
    id: "base-6",
    nombre: "Vestido largo negro",
    precio: 5.99,
    imagen: require(
      "../../assets/images/Vestido largo negro.jpeg"
    ),
    tallas: ["XL"],
  },
];

// ==========================================
// TALLAS
// ==========================================

const tallasDisponibles = [
  "Todas",
  "XS",
  "S",
  "M",
  "L",
  "XL",
];

export default function Catalogo() {
  // ========================================
  // ESTADOS GENERALES
  // ========================================

  const [cargando, setCargando] =
    useState(true);

  const [nombreCliente, setNombreCliente] =
    useState("Cliente");

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  // ========================================
  // PRODUCTOS
  // ========================================

  const [productos, setProductos] =
    useState<any[]>(productosBase);

  // ========================================
  // FILTROS
  // ========================================

  const [busqueda, setBusqueda] =
    useState("");

  const [
    tallaSeleccionada,
    setTallaSeleccionada,
  ] = useState("Todas");

  // ========================================
  // CARRITO
  // ========================================

  const [carrito, setCarrito] =
    useState<any[]>([]);

  const [
    carritoAbierto,
    setCarritoAbierto,
  ] = useState(false);

  const [guardando, setGuardando] =
    useState(false);

  // ========================================
  // VERIFICAR USUARIO
  // ========================================

  useEffect(() => {
    const cancelarObservador =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            router.replace("/login");
            return;
          }

          try {
            const referenciaUsuario = doc(
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
              router.replace("/login");
              return;
            }

            const datosUsuario =
              documentoUsuario.data();

            // Si es admin, enviarlo
            // a su dashboard
            if (
              datosUsuario.rol === "admin"
            ) {
              router.replace("/admin");
              return;
            }

            if (
              datosUsuario.rol !==
              "cliente"
            ) {
              router.replace("/login");
              return;
            }

            setNombreCliente(
              datosUsuario.nombre ||
                "Cliente"
            );
          } catch (error) {
            console.log(
              "Error verificando usuario:",
              error
            );

            Alert.alert(
              "Error",
              "No se pudo verificar el usuario."
            );
          } finally {
            setCargando(false);
          }
        }
      );

    return () =>
      cancelarObservador();
  }, []);

  // ========================================
  // PRODUCTOS DE FIRESTORE
  // ========================================

  useEffect(() => {
    const cancelarProductos =
      onSnapshot(
        collection(db, "productos"),

        (snapshot) => {
          const productosFirestore =
            snapshot.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data(),
              })
            );

          setProductos([
            ...productosBase,
            ...productosFirestore,
          ]);
        },

        (error) => {
          console.log(
            "Error obteniendo productos:",
            error
          );
        }
      );

    return () =>
      cancelarProductos();
  }, []);

  // ========================================
  // FILTRAR PRODUCTOS
  // ========================================

  const productosFiltrados =
    productos.filter((producto) => {
      const nombre =
        producto.nombre || "";

      const coincideNombre =
        nombre
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          );

      const tallasProducto =
        Array.isArray(
          producto.tallas
        )
          ? producto.tallas
          : producto.talla
          ? [producto.talla]
          : [];

      const coincideTalla =
        tallaSeleccionada ===
          "Todas" ||
        tallasProducto.includes(
          tallaSeleccionada
        );

      return (
        coincideNombre &&
        coincideTalla
      );
    });

  // ========================================
  // AGREGAR AL CARRITO
  // ========================================

  const agregarAlCarrito = (
    producto: any
  ) => {
    setCarrito(
      (carritoActual) => {
        const existe =
          carritoActual.find(
            (item) =>
              item.id === producto.id
          );

        if (existe) {
          return carritoActual.map(
            (item) =>
              item.id === producto.id
                ? {
                    ...item,
                    cantidad:
                      item.cantidad + 1,
                  }
                : item
          );
        }

        return [
          ...carritoActual,
          {
            ...producto,
            cantidad: 1,
          },
        ];
      }
    );
  };

  // ========================================
  // ELIMINAR DEL CARRITO
  // ========================================

  const eliminarDelCarrito = (
    productoId: string
  ) => {
    setCarrito(
      carrito.filter(
        (item) =>
          item.id !== productoId
      )
    );
  };

  // ========================================
  // VACIAR CARRITO
  // ========================================

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // ========================================
  // CANTIDAD POR PRODUCTO
  // ========================================

  const obtenerCantidadEnCarrito = (
    productoId: string
  ) => {
    const producto =
      carrito.find(
        (item) =>
          item.id === productoId
      );

    return producto
      ? producto.cantidad
      : 0;
  };

  // ========================================
  // TOTAL DE ARTÍCULOS
  // ========================================

  const totalItems =
    carrito.reduce(
      (total, item) =>
        total + item.cantidad,
      0
    );

  // ========================================
  // TOTAL DEL CARRITO
  // ========================================

  const totalCarrito =
    carrito.reduce(
      (total, item) =>
        total +
        Number(item.precio || 0) *
          item.cantidad,
      0
    );

  // ========================================
  // CONFIRMAR PEDIDO
  // ========================================

  const confirmarPedido =
    async () => {
      if (
        carrito.length === 0
      ) {
        return;
      }

      const usuario =
        auth.currentUser;

      if (!usuario) {
        Alert.alert(
          "Sesión requerida",
          "Debes iniciar sesión antes de realizar un pedido."
        );

        setCarritoAbierto(false);

        return;
      }

      try {
        setGuardando(true);

        let nombre =
          nombreCliente ||
          "Cliente";

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
          documentoUsuario.exists()
        ) {
          const datosUsuario =
            documentoUsuario.data();

          nombre =
            datosUsuario.nombre ||
            nombreCliente ||
            "Cliente";
        }

        await addDoc(
          collection(
            db,
            "pedidos"
          ),
          {
            clienteNombre:
              nombre,

            clienteEmail:
              usuario.email ||
              "Sin correo",

            usuarioId:
              usuario.uid,

            items:
              carrito.map(
                (item) => ({
                  id: item.id,
                  nombre:
                    item.nombre,
                  precio:
                    Number(
                      item.precio
                    ) || 0,
                  cantidad:
                    item.cantidad,

                  tallas:
                    item.tallas ||
                    [],

                  talla:
                    item.talla ||
                    null,
                })
              ),

            total:
              parseFloat(
                totalCarrito.toFixed(
                  2
                )
              ),

            estado:
              "Pendiente",

            fecha:
              serverTimestamp(),
          }
        );

        Alert.alert(
          "Pedido realizado",
          "¡Tu pedido fue realizado con éxito!"
        );

        vaciarCarrito();

        setCarritoAbierto(false);
      } catch (error) {
        console.log(
          "Error creando pedido:",
          error
        );

        Alert.alert(
          "Error",
          "No se pudo realizar el pedido. Intenta nuevamente."
        );
      } finally {
        setGuardando(false);
      }
    };

  // ========================================
  // CERRAR SESIÓN
  // ========================================

  const cerrarSesion =
    async () => {
      try {
        await signOut(auth);

        setMenuAbierto(false);

        router.replace("/");
      } catch (error) {
        console.log(
          "Error cerrando sesión:",
          error
        );
      }
    };

  // ========================================
  // OBTENER IMAGEN
  // ========================================

  const obtenerImagen = (
    producto: any
  ) => {
    // Las imágenes locales
    // importadas con require()
    // son números en React Native
    if (
      typeof producto.imagen ===
      "number"
    ) {
      return producto.imagen;
    }

    // Productos de Firebase
    // pueden traer una URL
    if (
      typeof producto.imagen ===
        "string" &&
      producto.imagen.startsWith(
        "http"
      )
    ) {
      return {
        uri: producto.imagen,
      };
    }

    return require(
      "../../assets/images/expo-logo.png"
    );
  };

  // ========================================
  // PANTALLA DE CARGA
  // ========================================

  if (cargando) {
    return (
      <View
        style={styles.cargando}
      >
        <ActivityIndicator
          size="large"
          color="#AD4E4F"
        />

        <Text
          style={
            styles.cargandoTexto
          }
        >
          Cargando catálogo...
        </Text>
      </View>
    );
  }

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <View style={styles.pantalla}>
      {/* =================================
          NAVBAR
      ================================= */}

      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() =>
            router.replace(
              "/home"
            )
          }
        >
          <Text style={styles.logo}>
            POLET PLUS
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.navbarDerecha
          }
        >
          {/* CARRITO */}

          <TouchableOpacity
            style={
              styles.botonNavbar
            }
            onPress={() =>
              setCarritoAbierto(
                true
              )
            }
          >
            <Text
              style={
                styles.carritoIcono
              }
            >
              🛒
            </Text>

            {totalItems > 0 && (
              <View
                style={
                  styles.contador
                }
              >
                <Text
                  style={
                    styles.contadorTexto
                  }
                >
                  {totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* MENÚ */}

          <TouchableOpacity
            style={
              styles.botonNavbar
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
      </View>

      {/* =================================
          CONTENIDO
      ================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =================================
            ENCABEZADO
        ================================= */}

        <View
          style={
            styles.encabezado
          }
        >
          <Text
            style={
              styles.titulo
            }
          >
            Catálogo
          </Text>

          <Text
            style={
              styles.subtitulo
            }
          >
            Descubre nuestras
            prendas disponibles.
          </Text>
        </View>

        {/* =================================
            BUSCADOR
        ================================= */}

        <View
          style={
            styles.filtrosContenedor
          }
        >
          <TextInput
            style={styles.buscador}
            placeholder="Buscar producto..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={
              setBusqueda
            }
          />

          {/* TALLAS */}

          <Text
            style={
              styles.filtroTitulo
            }
          >
            Filtrar por talla
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.tallasContenedor
            }
          >
            {tallasDisponibles.map(
              (talla) => (
                <TouchableOpacity
                  key={talla}
                  style={[
                    styles.tallaBoton,

                    tallaSeleccionada ===
                    talla
                      ? styles.tallaActiva
                      : styles.tallaInactiva,
                  ]}
                  onPress={() =>
                    setTallaSeleccionada(
                      talla
                    )
                  }
                >
                  <Text
                    style={[
                      styles.tallaTexto,

                      tallaSeleccionada ===
                      talla
                        ? styles.tallaTextoActivo
                        : styles.tallaTextoInactivo,
                    ]}
                  >
                    {talla}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* =================================
            PRODUCTOS
        ================================= */}

        <View
          style={
            styles.productosSeccion
          }
        >
          {productosFiltrados.length ===
          0 ? (
            <Text
              style={
                styles.sinProductos
              }
            >
              No se encontraron
              productos.
            </Text>
          ) : (
            productosFiltrados.map(
              (producto) => {
                const cantidad =
                  obtenerCantidadEnCarrito(
                    producto.id
                  );

                const precio =
                  Number(
                    producto.precio
                  ) || 0;

                const tallas =
                  Array.isArray(
                    producto.tallas
                  )
                    ? producto.tallas.join(
                        ", "
                      )
                    : producto.talla ||
                      "Única";

                return (
                  <View
                    key={
                      producto.id
                    }
                    style={
                      styles.productoCard
                    }
                  >
                    <View
                      style={
                        styles.imagenContenedor
                      }
                    >
                      <Image
                        source={obtenerImagen(
                          producto
                        )}
                        style={
                          styles.productoImagen
                        }
                      />
                    </View>

                    <Text
                      style={
                        styles.productoNombre
                      }
                    >
                      {
                        producto.nombre
                      }
                    </Text>

                    <Text
                      style={
                        styles.productoPrecio
                      }
                    >
                      $
                      {precio.toFixed(
                        2
                      )}
                    </Text>

                    <Text
                      style={
                        styles.productoTalla
                      }
                    >
                      Tallas:{" "}
                      {tallas}
                    </Text>

                    <TouchableOpacity
                      style={
                        styles.botonAgregar
                      }
                      onPress={() =>
                        agregarAlCarrito(
                          producto
                        )
                      }
                    >
                      {cantidad >
                      0 ? (
                        <View
                          style={
                            styles.botonContenido
                          }
                        >
                          <Text
                            style={
                              styles.botonAgregarTexto
                            }
                          >
                            Agregar más
                          </Text>

                          <View
                            style={
                              styles.cantidadBadge
                            }
                          >
                            <Text
                              style={
                                styles.cantidadTexto
                              }
                            >
                              {
                                cantidad
                              }
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text
                          style={
                            styles.botonAgregarTexto
                          }
                        >
                          Agregar al carrito
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }
            )
          )}
        </View>
      </ScrollView>

      {/* =================================
          MODAL CARRITO
      ================================= */}

      <Modal
        visible={
          carritoAbierto
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setCarritoAbierto(
            false
          )
        }
      >
        <View
          style={
            styles.carritoFondo
          }
        >
          <View
            style={
              styles.carritoPanel
            }
          >
            {/* CABECERA */}

            <View
              style={
                styles.carritoHeader
              }
            >
              <Text
                style={
                  styles.carritoTitulo
                }
              >
                🛒 Tu Carrito
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCarritoAbierto(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.cerrarCarrito
                  }
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* PRODUCTOS */}

            <ScrollView
              style={
                styles.carritoLista
              }
            >
              {carrito.length ===
              0 ? (
                <Text
                  style={
                    styles.carritoVacio
                  }
                >
                  Tu carrito está
                  vacío.
                </Text>
              ) : (
                carrito.map(
                  (item) => (
                    <View
                      key={
                        item.id
                      }
                      style={
                        styles.itemCarrito
                      }
                    >
                      <Image
                        source={obtenerImagen(
                          item
                        )}
                        style={
                          styles.itemImagen
                        }
                      />

                      <View
                        style={
                          styles.itemInfo
                        }
                      >
                        <Text
                          style={
                            styles.itemNombre
                          }
                        >
                          {
                            item.nombre
                          }
                        </Text>

                        <Text
                          style={
                            styles.itemDetalle
                          }
                        >
                          $
                          {Number(
                            item.precio
                          ).toFixed(
                            2
                          )}{" "}
                          x{" "}
                          {
                            item.cantidad
                          }
                        </Text>

                        <Text
                          style={
                            styles.itemSubtotal
                          }
                        >
                          Subtotal: $
                          {(
                            Number(
                              item.precio
                            ) *
                            item.cantidad
                          ).toFixed(
                            2
                          )}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            eliminarDelCarrito(
                              item.id
                            )
                          }
                        >
                          <Text
                            style={
                              styles.eliminarTexto
                            }
                          >
                            Borrar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )
              )}
            </ScrollView>

            {/* PARTE INFERIOR */}

            {carrito.length >
              0 && (
              <View
                style={
                  styles.carritoFooter
                }
              >
                <View
                  style={
                    styles.totalFila
                  }
                >
                  <Text
                    style={
                      styles.totalLabel
                    }
                  >
                    Total:
                  </Text>

                  <Text
                    style={
                      styles.totalValor
                    }
                  >
                    $
                    {totalCarrito.toFixed(
                      2
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.botonConfirmar
                  }
                  onPress={
                    confirmarPedido
                  }
                  disabled={
                    guardando
                  }
                >
                  <Text
                    style={
                      styles.botonConfirmarTexto
                    }
                  >
                    {guardando
                      ? "Procesando pedido..."
                      : "Confirmar Pedido"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.botonVaciar
                  }
                  onPress={
                    vaciarCarrito
                  }
                >
                  <Text
                    style={
                      styles.botonVaciarTexto
                    }
                  >
                    Vaciar carrito
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* =================================
          MENÚ HAMBURGUESA
      ================================= */}

      <Modal
        visible={
          menuAbierto
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMenuAbierto(false)
        }
      >
        <View
          style={
            styles.menuFondo
          }
        >
          <TouchableOpacity
            style={
              styles.menuEspacio
            }
            activeOpacity={1}
            onPress={() =>
              setMenuAbierto(false)
            }
          />

          <View
            style={
              styles.menuPanel
            }
          >
            <TouchableOpacity
              style={
                styles.cerrarMenuBoton
              }
              onPress={() =>
                setMenuAbierto(false)
              }
            >
              <Text
                style={
                  styles.cerrarMenu
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
              Hola,{" "}
              {nombreCliente}
            </Text>

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                router.replace(
                  "/home"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Inicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() =>
                setMenuAbierto(
                  false
                )
              }
            >
              <Text
                style={
                  styles.menuActivo
                }
              >
                Catálogo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                setCarritoAbierto(
                  true
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Carrito
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                router.push(
                  "/cuenta"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Mi cuenta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                router.replace(
                  "/home"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Sobre nosotros
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                router.replace(
                  "/home"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Contacto
              </Text>
            </TouchableOpacity>

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

// ==========================================
// ESTILOS
// ==========================================

const styles =
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor:
        "#efd2c7",
    },

    // CARGANDO

    cargando: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "#efd2c7",
    },

    cargandoTexto: {
      marginTop: 15,
      color: "#AD4E4F",
      fontSize: 16,
      fontWeight: "600",
    },

    // NAVBAR

    navbar: {
      backgroundColor: "#fff",

      paddingTop: 52,
      paddingBottom: 14,
      paddingHorizontal: 20,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },

    logo: {
      color: "#AD4E4F",
      fontSize: 23,
      fontWeight: "bold",
      letterSpacing: 2,
    },

    navbarDerecha: {
      flexDirection: "row",
      gap: 8,
    },

    botonNavbar: {
      width: 44,
      height: 44,

      borderRadius: 10,

      backgroundColor:
        "#AD4E4F",

      justifyContent:
        "center",

      alignItems: "center",
    },

    carritoIcono: {
      fontSize: 20,
    },

    menuIcono: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
    },

    contador: {
      position: "absolute",

      right: -6,
      top: -6,

      width: 21,
      height: 21,

      borderRadius: 11,

      backgroundColor:
        "#f59e0b",

      justifyContent:
        "center",

      alignItems: "center",
    },

    contadorTexto: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
    },

    // ENCABEZADO

    encabezado: {
      alignItems: "center",

      paddingTop: 40,
      paddingBottom: 25,
      paddingHorizontal: 20,
    },

    titulo: {
      color: "#AD4E4F",
      fontSize: 36,
      fontWeight: "bold",
    },

    subtitulo: {
      marginTop: 8,

      color: "#666",
      fontSize: 15,
      textAlign: "center",
    },

    // FILTROS

    filtrosContenedor: {
      marginHorizontal: 20,

      padding: 18,

      borderRadius: 18,

      backgroundColor:
        "rgba(255,255,255,0.65)",
    },

    buscador: {
      backgroundColor: "#fff",

      borderWidth: 1,
      borderColor: "#ddd",

      borderRadius: 12,

      paddingHorizontal: 16,
      paddingVertical: 13,

      color: "#333",
      fontSize: 15,
    },

    filtroTitulo: {
      marginTop: 18,
      marginBottom: 10,

      fontWeight: "600",
      color: "#555",
    },

    tallasContenedor: {
      gap: 8,
      paddingRight: 10,
    },

    tallaBoton: {
      paddingHorizontal: 17,
      paddingVertical: 10,

      borderRadius: 20,

      borderWidth: 1,
    },

    tallaActiva: {
      backgroundColor:
        "#AD4E4F",

      borderColor:
        "#AD4E4F",
    },

    tallaInactiva: {
      backgroundColor: "#fff",

      borderColor: "#ddd",
    },

    tallaTexto: {
      fontWeight: "600",
    },

    tallaTextoActivo: {
      color: "#fff",
    },

    tallaTextoInactivo: {
      color: "#555",
    },

    // PRODUCTOS

    productosSeccion: {
      paddingHorizontal: 20,
      paddingVertical: 30,
    },

    sinProductos: {
      paddingVertical: 60,
      textAlign: "center",

      color: "#666",
      fontSize: 16,
    },

    productoCard: {
      backgroundColor:
        "rgba(255,255,255,0.65)",

      borderRadius: 20,

      padding: 15,

      marginBottom: 25,

      alignItems: "center",
    },

    imagenContenedor: {
      width: "100%",
      height: 390,

      borderRadius: 16,

      overflow: "hidden",

      backgroundColor: "#fff",

      justifyContent:
        "center",

      alignItems: "center",
    },

    productoImagen: {
      width: "100%",
      height: "100%",

      resizeMode: "contain",
    },

    productoNombre: {
      marginTop: 16,

      color: "#222",

      fontSize: 20,
      fontWeight: "600",

      textAlign: "center",
    },

    productoPrecio: {
      marginTop: 8,

      fontSize: 18,
      fontWeight: "500",

      color: "#333",
    },

    productoTalla: {
      marginTop: 7,

      color: "#666",
      fontSize: 14,
    },

    botonAgregar: {
      marginTop: 17,

      backgroundColor:
        "#AD4E4F",

      borderRadius: 25,

      paddingHorizontal: 25,
      paddingVertical: 13,

      minWidth: 190,

      alignItems: "center",
    },

    botonContenido: {
      flexDirection: "row",

      alignItems: "center",

      gap: 10,
    },

    botonAgregarTexto: {
      color: "#fff",

      fontWeight: "bold",
      fontSize: 15,
    },

    cantidadBadge: {
      width: 25,
      height: 25,

      borderRadius: 13,

      backgroundColor: "#fff",

      justifyContent:
        "center",

      alignItems: "center",
    },

    cantidadTexto: {
      color: "#AD4E4F",

      fontWeight: "bold",

      fontSize: 12,
    },

    // CARRITO

    carritoFondo: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.45)",

      justifyContent: "flex-end",
    },

    carritoPanel: {
      height: "90%",

      backgroundColor: "#fff",

      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,

      padding: 22,
    },

    carritoHeader: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      paddingBottom: 15,

      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },

    carritoTitulo: {
      color: "#333",

      fontSize: 21,
      fontWeight: "bold",
    },

    cerrarCarrito: {
      color: "#AD4E4F",

      fontSize: 25,
    },

    carritoLista: {
      flex: 1,

      marginTop: 15,
    },

    carritoVacio: {
      marginTop: 70,

      textAlign: "center",

      color: "#777",
      fontSize: 16,
    },

    itemCarrito: {
      flexDirection: "row",

      padding: 12,

      marginBottom: 12,

      borderRadius: 14,

      backgroundColor:
        "#f8f8f8",
    },

    itemImagen: {
      width: 80,
      height: 90,

      backgroundColor: "#fff",

      borderRadius: 10,

      resizeMode: "contain",
    },

    itemInfo: {
      flex: 1,

      marginLeft: 13,

      justifyContent:
        "center",
    },

    itemNombre: {
      color: "#333",

      fontSize: 15,
      fontWeight: "bold",
    },

    itemDetalle: {
      marginTop: 5,

      color: "#666",
    },

    itemSubtotal: {
      marginTop: 4,

      color: "#333",
      fontWeight: "600",
    },

    eliminarTexto: {
      marginTop: 7,

      color: "#dc2626",

      fontWeight: "600",
    },

    carritoFooter: {
      paddingTop: 15,

      borderTopWidth: 1,
      borderTopColor: "#eee",
    },

    totalFila: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 15,
    },

    totalLabel: {
      color: "#666",

      fontSize: 16,
    },

    totalValor: {
      color: "#AD4E4F",

      fontSize: 25,
      fontWeight: "bold",
    },

    botonConfirmar: {
      backgroundColor:
        "#AD4E4F",

      borderRadius: 12,

      paddingVertical: 14,

      alignItems: "center",
    },

    botonConfirmarTexto: {
      color: "#fff",

      fontWeight: "bold",

      fontSize: 16,
    },

    botonVaciar: {
      marginTop: 10,

      borderWidth: 1,
      borderColor: "#ef4444",

      borderRadius: 12,

      paddingVertical: 12,

      alignItems: "center",
    },

    botonVaciarTexto: {
      color: "#dc2626",

      fontWeight: "600",
    },

    // MENÚ

    menuFondo: {
      flex: 1,

      flexDirection: "row",

      backgroundColor:
        "rgba(0,0,0,0.4)",
    },

    menuEspacio: {
      width: "25%",
    },

    menuPanel: {
      width: "75%",
      height: "100%",

      backgroundColor: "#fff",

      paddingTop: 55,
      paddingHorizontal: 25,
    },

    cerrarMenuBoton: {
      alignSelf: "flex-end",
    },

    cerrarMenu: {
      color: "#AD4E4F",

      fontSize: 28,
    },

    menuLogo: {
      marginTop: 20,

      color: "#AD4E4F",

      fontSize: 24,
      fontWeight: "bold",

      letterSpacing: 2,
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