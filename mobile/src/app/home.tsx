import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
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

// ==============================
// TAMAÑO DEL CARRUSEL
// ==============================

const ANCHO_PANTALLA =
  Dimensions.get("window").width;

const ANCHO_CARRUSEL =
  ANCHO_PANTALLA - 40;

// ==============================
// IMÁGENES DEL CARRUSEL
// ==============================

const slides = [
  require("../../assets/images/POLET6.jpg"),
  require("../../assets/images/POLET7.jpg"),
  require("../../assets/images/POLET8.jpg"),
  require("../../assets/images/POLET9.jpg"),
];

// ==============================
// PRODUCTOS DESTACADOS
// ==============================

const productosDestacados = [
  {
    id: 101,
    nombre: "Vestido Fucsia",
    precio: 6.5,
    imagen: require(
      "../../assets/images/Vestido fucsia.png"
    ),
    talla: "XS",
  },

  {
    id: 102,
    nombre:
      "Vestido de noche color negro",
    precio: 11.99,
    imagen: require(
      "../../assets/images/Vestido de noche color negro.jpeg"
    ),
    talla: "3XL",
  },

  {
    id: 103,
    nombre:
      "Vestido corto de rayas",
    precio: 4.99,
    imagen: require(
      "../../assets/images/Vestido corto de rayas.png"
    ),
    talla: "M",
  },
];

export default function Home() {
  // ==============================
  // ESTADOS
  // ==============================

  const [
    nombreCliente,
    setNombreCliente,
  ] = useState("Cliente");

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false);

  const [
    slideActual,
    setSlideActual,
  ] = useState(0);

  // ==============================
  // REFERENCIAS
  // ==============================

  const carouselRef =
    useRef<ScrollView>(null);

  const paginaRef =
    useRef<ScrollView>(null);

  const [
    posicionNosotros,
    setPosicionNosotros,
  ] = useState(0);

  const [
    posicionContacto,
    setPosicionContacto,
  ] = useState(0);

  // ==============================
  // VERIFICAR USUARIO
  // ==============================

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
              router.replace("/login");
              return;
            }

            const datosUsuario =
              documentoUsuario.data();

            // Si es administrador,
            // enviarlo al dashboard
            if (
              datosUsuario.rol ===
              "admin"
            ) {
              router.replace("/admin");
              return;
            }

            // Solo clientes pueden
            // permanecer en esta pantalla
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
              "Error verificando cliente:",
              error
            );

            Alert.alert(
              "Error",
              "No se pudo cargar la información del usuario."
            );
          } finally {
            setCargando(false);
          }
        }
      );

    return () =>
      cancelarObservador();
  }, []);

  // ==============================
  // CARRUSEL AUTOMÁTICO
  // ==============================

  useEffect(() => {
    const intervalo = setInterval(
      () => {
        const siguiente =
          slideActual ===
          slides.length - 1
            ? 0
            : slideActual + 1;

        setSlideActual(siguiente);

        carouselRef.current?.scrollTo({
          x:
            siguiente *
            ANCHO_CARRUSEL,
          animated: true,
        });
      },
      4000
    );

    return () =>
      clearInterval(intervalo);
  }, [slideActual]);

  // ==============================
  // DETECTAR SLIDE MANUAL
  // ==============================

  const manejarScrollCarrusel = (
    event: NativeSyntheticEvent<
      NativeScrollEvent
    >
  ) => {
    const posicion =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(
      posicion / ANCHO_CARRUSEL
    );

    setSlideActual(index);
  };

  // ==============================
  // NAVEGAR A SECCIONES
  // ==============================

  const irANosotros = () => {
    setMenuAbierto(false);

    setTimeout(() => {
      paginaRef.current?.scrollTo({
        y: posicionNosotros,
        animated: true,
      });
    }, 200);
  };

  const irAContacto = () => {
    setMenuAbierto(false);

    setTimeout(() => {
      paginaRef.current?.scrollTo({
        y: posicionContacto,
        animated: true,
      });
    }, 200);
  };

  // ==============================
  // CERRAR SESIÓN
  // ==============================

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

  // ==============================
  // CARGANDO
  // ==============================

  if (cargando) {
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
          Cargando Polet Plus...
        </Text>
      </View>
    );
  }

  // ==============================
  // INTERFAZ
  // ==============================

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

          <Text style={styles.saludo}>
            Hola, {nombreCliente}
          </Text>
        </View>

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
              router.push("/carrito")
            }
          >
            <Text
              style={
                styles.iconoCarrito
              }
            >
              🛒
            </Text>
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
                styles.iconoMenu
              }
            >
              ☰
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================
          CONTENIDO
      ========================= */}

      <ScrollView
        ref={paginaRef}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =========================
            HERO
        ========================= */}

        <View style={styles.hero}>
          <Text style={styles.eleva}>
            Eleva
          </Text>

          <Text
            style={
              styles.tuEstilo
            }
          >
            Tu estilo
          </Text>

          {/* CARRUSEL */}

          <View
            style={
              styles.carruselContenedor
            }
          >
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={
                false
              }
              onMomentumScrollEnd={
                manejarScrollCarrusel
              }
            >
              {slides.map(
                (
                  imagen,
                  index
                ) => (
                  <View
                    key={index}
                    style={
                      styles.slide
                    }
                  >
                    <Image
                      source={
                        imagen
                      }
                      style={
                        styles.imagenHero
                      }
                    />
                  </View>
                )
              )}
            </ScrollView>
          </View>

          {/* INDICADORES */}

          <View
            style={
              styles.indicadores
            }
          >
            {slides.map(
              (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicador,
                    slideActual ===
                    index
                      ? styles.indicadorActivo
                      : styles.indicadorInactivo,
                  ]}
                />
              )
            )}
          </View>

          {/* PROMOCIÓN */}

          <View
            style={
              styles.promocion
            }
          >
            <Text
              style={
                styles.promocionTitulo
              }
            >
              DESCUBRE NUESTRA NUEVA
              COLECCIÓN
            </Text>

            <Text
              style={
                styles.promocionTexto
              }
            >
              Estilos pensados para ti
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/catalogo"
              )
            }
          >
            <Text
              style={
                styles.verCatalogo
              }
            >
              VER CATÁLOGO
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================
            NUEVOS INGRESOS
        ========================= */}

        <View
          style={
            styles.productosSeccion
          }
        >
          <View
            style={
              styles.encabezadoSeccion
            }
          >
            <Text
              style={
                styles.tituloSeccion
              }
            >
              Nuevos ingresos
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/catalogo"
                )
              }
            >
              <Text
                style={
                  styles.enlaceCatalogo
                }
              >
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          {productosDestacados.map(
            (producto) => (
              <View
                key={producto.id}
                style={
                  styles.productoCard
                }
              >
                <View
                  style={
                    styles.imagenProductoContenedor
                  }
                >
                  <Image
                    source={
                      producto.imagen
                    }
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
                  {producto.nombre}
                </Text>

                <Text
                  style={
                    styles.productoPrecio
                  }
                >
                  $
                  {producto.precio.toFixed(
                    2
                  )}
                </Text>

                <Text
                  style={
                    styles.productoTalla
                  }
                >
                  Talla:{" "}
                  {producto.talla}
                </Text>

                <TouchableOpacity
                  style={
                    styles.botonProducto
                  }
                  onPress={() =>
                    router.push(
                      "/catalogo"
                    )
                  }
                >
                  <Text
                    style={
                      styles.textoBotonProducto
                    }
                  >
                    Ver en catálogo
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        {/* =========================
            SOBRE NOSOTROS
        ========================= */}

        <View
          onLayout={(event) =>
            setPosicionNosotros(
              event.nativeEvent
                .layout.y
            )
          }
          style={
            styles.sobreNosotros
          }
        >
          <Text
            style={
              styles.tituloCentro
            }
          >
            Sobre Polet Plus
          </Text>

          <Text
            style={
              styles.textoNosotros
            }
          >
            Polet Plus es una tienda
            de ropa en línea creada
            con el objetivo de
            ofrecer prendas modernas
            y accesibles de una forma
            práctica.
          </Text>

          <Text
            style={
              styles.textoNosotros
            }
          >
            Buscamos brindar una
            experiencia de compra
            sencilla, cercana y
            confiable, ofreciendo
            envíos a diferentes
            departamentos de El
            Salvador.
          </Text>

          {/* MISIÓN */}

          <View
            style={
              styles.tarjetaInfo
            }
          >
            <Text
              style={
                styles.tarjetaTitulo
              }
            >
              Nuestra Misión
            </Text>

            <Text
              style={
                styles.tarjetaTexto
              }
            >
              Ofrecer prendas de
              calidad y facilitar el
              proceso de compra en
              línea, brindando a
              nuestros clientes una
              experiencia sencilla y
              accesible.
            </Text>
          </View>

          {/* COMPROMISO */}

          <View
            style={
              styles.tarjetaInfo
            }
          >
            <Text
              style={
                styles.tarjetaTitulo
              }
            >
              Nuestro Compromiso
            </Text>

            <Text
              style={
                styles.tarjetaTexto
              }
            >
              Brindar atención
              personalizada y una
              experiencia de compra
              cómoda, segura y
              confiable para cada
              cliente.
            </Text>
          </View>
        </View>

        {/* =========================
            FOOTER / CONTACTO
        ========================= */}

        <View
          onLayout={(event) =>
            setPosicionContacto(
              event.nativeEvent
                .layout.y
            )
          }
          style={styles.footer}
        >
          <Text
            style={
              styles.footerLogo
            }
          >
            POLET PLUS
          </Text>

          <Text
            style={
              styles.footerTexto
            }
          >
            Moda para todos.
          </Text>

          <Text
            style={
              styles.footerTitulo
            }
          >
            Contacto
          </Text>

          <Text
            style={
              styles.footerTexto
            }
          >
            WhatsApp: 77543266
          </Text>

          <Text
            style={
              styles.footerTexto
            }
          >
            Facebook: Polet Plus
          </Text>

          <Text
            style={
              styles.footerTexto
            }
          >
            El Salvador
          </Text>

          <View
            style={
              styles.footerLinea
            }
          />

          <Text
            style={
              styles.copyright
            }
          >
            © 2026 Polet Plus.
            Todos los derechos
            reservados.
          </Text>
        </View>
      </ScrollView>

      {/* =========================
          MENÚ LATERAL
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
          <TouchableOpacity
            style={
              styles.modalEspacio
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
            {/* CERRAR */}

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
              Hola, {nombreCliente}
            </Text>

            {/* INICIO */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                paginaRef.current?.scrollTo(
                  {
                    y: 0,
                    animated: true,
                  }
                );
              }}
            >
              <Text
                style={
                  styles.menuTextoActivo
                }
              >
                Inicio
              </Text>
            </TouchableOpacity>

            {/* CATÁLOGO */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                router.push(
                  "/catalogo"
                );
              }}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Catálogo
              </Text>
            </TouchableOpacity>

            {/* CARRITO */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={() => {
                setMenuAbierto(
                  false
                );

                router.push(
                  "/carrito"
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

            {/* CUENTA */}

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

            {/* SOBRE NOSOTROS */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={irANosotros}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Sobre nosotros
              </Text>
            </TouchableOpacity>

            {/* CONTACTO */}

            <TouchableOpacity
              style={
                styles.menuOpcion
              }
              onPress={irAContacto}
            >
              <Text
                style={
                  styles.menuTexto
                }
              >
                Contacto
              </Text>
            </TouchableOpacity>

            {/* CERRAR SESIÓN */}

            <TouchableOpacity
              style={[
                styles.menuOpcion,
                styles.logoutContenedor,
              ]}
              onPress={
                cerrarSesion
              }
            >
              <Text
                style={
                  styles.logout
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

// ==============================
// ESTILOS
// ==============================

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#efd2c7",
  },

  // CARGA

  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#efd2c7",
  },

  cargandoTexto: {
    marginTop: 15,
    color: "#AD4E4F",
    fontSize: 16,
    fontWeight: "600",
  },

  // NAVBAR

  navbar: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: "#fff",

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  logo: {
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#AD4E4F",
  },

  saludo: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  navbarDerecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  botonNavbar: {
    width: 44,
    height: 44,
    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#AD4E4F",
  },

  iconoCarrito: {
    fontSize: 20,
  },

  iconoMenu: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },

  // HERO

  hero: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },

  eleva: {
    fontSize: 30,
    fontStyle: "italic",
    color: "#AD4E4F",
  },

  tuEstilo: {
    marginTop: 2,
    marginBottom: 25,

    fontSize: 48,
    fontWeight: "600",
    color: "#AD4E4F",
  },

  carruselContenedor: {
    width: ANCHO_CARRUSEL,
    overflow: "hidden",
    borderRadius: 28,
  },

  slide: {
    width: ANCHO_CARRUSEL,
  },

  imagenHero: {
    width: ANCHO_CARRUSEL,
    height: 470,
    borderRadius: 28,
    resizeMode: "cover",
  },

  indicadores: {
    flexDirection: "row",
    gap: 9,
    marginTop: 16,
  },

  indicador: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  indicadorActivo: {
    backgroundColor: "#AD4E4F",
  },

  indicadorInactivo: {
    backgroundColor: "#fff",
  },

  promocion: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#AD4E4F",
    borderRadius: 30,

    paddingHorizontal: 20,
    paddingVertical: 12,

    marginTop: 24,

    alignItems: "center",
  },

  promocionTitulo: {
    textAlign: "center",
    color: "#AD4E4F",
    fontSize: 16,
    fontWeight: "bold",
  },

  promocionTexto: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },

  verCatalogo: {
    marginTop: 18,
    color: "#AD4E4F",
    fontSize: 14,
    fontWeight: "bold",
  },

  // PRODUCTOS

  productosSeccion: {
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  encabezadoSeccion: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  tituloSeccion: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#AD4E4F",
  },

  enlaceCatalogo: {
    color: "#AD4E4F",
    fontWeight: "600",
  },

  productoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 28,
    alignItems: "center",
  },

  imagenProductoContenedor: {
    width: "100%",
    height: 390,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 15,
  },

  productoImagen: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  productoNombre: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
  },

  productoPrecio: {
    marginTop: 7,
    fontSize: 18,
    color: "#222",
  },

  productoTalla: {
    marginTop: 6,
    color: "#777",
    fontSize: 14,
  },

  botonProducto: {
    marginTop: 16,

    backgroundColor: "#AD4E4F",
    borderRadius: 25,

    paddingHorizontal: 25,
    paddingVertical: 12,
  },

  textoBotonProducto: {
    color: "#fff",
    fontWeight: "bold",
  },

  // SOBRE NOSOTROS

  sobreNosotros: {
    paddingHorizontal: 24,
    paddingVertical: 45,
  },

  tituloCentro: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#AD4E4F",
    marginBottom: 25,
  },

  textoNosotros: {
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 15,
  },

  tarjetaInfo: {
    marginTop: 18,
    padding: 25,

    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.45)",
  },

  tarjetaTitulo: {
    textAlign: "center",
    color: "#AD4E4F",
    fontSize: 21,
    fontWeight: "bold",
  },

  tarjetaTexto: {
    marginTop: 12,
    textAlign: "center",
    color: "#555",
    lineHeight: 22,
  },

  // FOOTER

  footer: {
    backgroundColor: "#AD4E4F",
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  footerLogo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  footerTitulo: {
    marginTop: 25,
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  footerTexto: {
    color: "#fff",
    marginTop: 7,
  },

  footerLinea: {
    height: 1,
    marginTop: 25,
    backgroundColor:
      "rgba(255,255,255,0.35)",
  },

  copyright: {
    marginTop: 15,
    textAlign: "center",
    color: "#fff",
    fontSize: 12,
  },

  // MODAL

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

    backgroundColor: "#fff",

    paddingTop: 55,
    paddingHorizontal: 25,
  },

  cerrarMenuBoton: {
    alignSelf: "flex-end",
    padding: 5,
  },

  cerrarMenu: {
    fontSize: 28,
    color: "#AD4E4F",
  },

  menuLogo: {
    marginTop: 15,

    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,

    color: "#AD4E4F",
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
    fontSize: 17,
    color: "#444",
  },

  menuTextoActivo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#AD4E4F",
  },

  logoutContenedor: {
    marginTop: 20,
  },

  logout: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#AD4E4F",
  },
});