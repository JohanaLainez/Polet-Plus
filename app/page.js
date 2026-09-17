"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";

import CuentaMenu from "../components/CuentaMenu";
import { useCarrito } from "../context/CarritoContext";

import { db, auth } from "../lib/firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

export default function Home() {
  // =========================
  // CARRUSEL PRINCIPAL
  // =========================

  const slides = [
    ["/POLET6.jpg", "/POLET7.jpg"],
    ["/POLET8.jpg", "/POLET9.jpg"],
  ];

  const [slideActual, setSlideActual] = useState(0);

  // =========================
  // ESTADO DE PEDIDO
  // =========================

  const [guardando, setGuardando] = useState(false);

  // =========================
  // CARRITO COMPARTIDO
  // =========================

  const {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    modalAbierto,
    setModalAbierto,
    totalItems,
    totalCarrito,
  } = useCarrito();

  // =========================
  // PRODUCTOS DESTACADOS
  // =========================

  const productosDestacados = [
    {
      id: 101,
      nombre: "Vestido Fucsia",
      precio: 6.5,
      imagen: "/Vestido fucsia.png",
      tallas: ["XS"],
    },
    {
      id: 102,
      nombre: "Vestido de noche color negro",
      precio: 11.99,
      imagen: "/Vestido de noche color negro.jpeg",
      tallas: ["3XL"],
    },
    {
      id: 103,
      nombre: "Vestido corto de rayas",
      precio: 4.99,
      imagen: "/Vestido corto de rayas.png",
      tallas: ["M"],
    },
  ];

  // =========================
  // CARRUSEL AUTOMÁTICO
  // =========================

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActual((anterior) =>
        anterior === slides.length - 1
          ? 0
          : anterior + 1
      );
    }, 4000);

    return () => clearInterval(intervalo);
  }, [slides.length]);

  const siguienteSlide = () => {
    setSlideActual((anterior) =>
      anterior === slides.length - 1
        ? 0
        : anterior + 1
    );
  };

  const slideAnterior = () => {
    setSlideActual((anterior) =>
      anterior === 0
        ? slides.length - 1
        : anterior - 1
    );
  };

  // =========================
  // CANTIDAD DEL PRODUCTO
  // =========================

  const obtenerCantidadEnCarrito = (productoId) => {
    const item = carrito.find(
      (item) => item.id === productoId
    );

    return item ? item.cantidad : 0;
  };

  // =========================
  // CONFIRMAR PEDIDO
  // =========================

  const confirmarPedido = async () => {
    if (carrito.length === 0) {
      return;
    }

    const usuario = auth.currentUser;

    if (!usuario) {
      alert(
        "Debes iniciar sesión antes de realizar un pedido."
      );

      setModalAbierto(false);
      return;
    }

    setGuardando(true);

    try {
      let nombreCliente = "Cliente";

      // BUSCAR NOMBRE REAL EN FIRESTORE
      const referenciaUsuario = doc(
        db,
        "users",
        usuario.uid
      );

      const documentoUsuario = await getDoc(
        referenciaUsuario
      );

      if (documentoUsuario.exists()) {
        const datosUsuario =
          documentoUsuario.data();

        nombreCliente =
          datosUsuario.nombre ||
          usuario.displayName ||
          usuario.email?.split("@")[0] ||
          "Cliente";
      } else {
        nombreCliente =
          usuario.displayName ||
          usuario.email?.split("@")[0] ||
          "Cliente";
      }

      // CREAR PEDIDO
      await addDoc(collection(db, "pedidos"), {
        clienteNombre: nombreCliente,

        clienteEmail:
          usuario.email || "Sin correo",

        usuarioId: usuario.uid,

        items: carrito,

        total: parseFloat(
          totalCarrito.toFixed(2)
        ),

        estado: "Pendiente",

        fecha: serverTimestamp(),
      });

      alert("¡Pedido realizado con éxito!");

      vaciarCarrito();
      setModalAbierto(false);
    } catch (error) {
      console.error(
        "Error al realizar el pedido:",
        error
      );

      alert(
        "No se pudo realizar el pedido. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#efd2c7]">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="flex items-center justify-between bg-white px-8 py-4">

        {/* LADO IZQUIERDO */}
        <div className="flex items-center gap-10">

          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.15em] text-[#AD4E4F]"
          >
            POLET PLUS
          </Link>

          {/* MENÚ */}
          <div className="flex items-center gap-8">

            <Link
              href="/"
              className="rounded-md bg-[#AD4E4F] px-7 py-3 text-white"
            >
              Inicio
            </Link>

            <Link
              href="/catalogo"
              className="text-gray-600 transition hover:text-[#AD4E4F]"
            >
              Catálogo
            </Link>

            <a
              href="#nosotros"
              className="text-gray-600 transition hover:text-[#AD4E4F]"
            >
              Sobre nosotros
            </a>

            <a
              href="#contacto"
              className="text-gray-600 transition hover:text-[#AD4E4F]"
            >
              Contacto
            </a>

          </div>

        </div>

        {/* LADO DERECHO */}
        <div className="flex items-center gap-6">

          {/* CARRITO */}
          <button
            type="button"
            onClick={() =>
              setModalAbierto(true)
            }
            className="relative rounded-md bg-[#AD4E4F] p-3 text-white transition hover:opacity-90"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          {/* CUENTA */}
          <CuentaMenu />

        </div>

      </nav>

      {/* =========================
          HERO
      ========================= */}

      <section className="bg-[#efd2c7] px-5 py-10 md:px-10">

        <div className="mb-8 text-center">

          <p className="text-3xl italic text-[#AD4E4F] md:text-5xl">
            Eleva
          </p>

          <h1 className="text-5xl font-semibold text-[#AD4E4F] md:text-7xl">
            Tu estilo
          </h1>

        </div>

        {/* CARRUSEL */}
        <div className="relative mx-auto max-w-6xl overflow-hidden">

          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${
                slideActual * 100
              }%)`,
            }}
          >

            {slides.map(
              (slide, index) => (
                <div
                  key={index}
                  className="grid min-w-full grid-cols-1 gap-4 px-1 sm:grid-cols-2"
                >

                  {slide.map(
                    (
                      imagen,
                      imgIndex
                    ) => (
                      <div
                        key={imgIndex}
                        className="h-[360px] overflow-hidden rounded-[28px] bg-white sm:h-[430px] md:h-[500px]"
                      >

                        <img
                          src={imagen}
                          alt={`Colección Polet Plus ${
                            index * 2 +
                            imgIndex +
                            1
                          }`}
                          className="h-full w-full object-cover object-center"
                        />

                      </div>
                    )
                  )}

                </div>
              )
            )}

          </div>

          {/* FLECHA IZQUIERDA */}
          <button
            type="button"
            onClick={slideAnterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-3xl text-[#AD4E4F] shadow-md transition hover:bg-white"
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          {/* FLECHA DERECHA */}
          <button
            type="button"
            onClick={siguienteSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-3xl text-[#AD4E4F] shadow-md transition hover:bg-white"
            aria-label="Siguiente imagen"
          >
            ›
          </button>

        </div>

        {/* INDICADORES */}
        <div className="mt-6 flex justify-center gap-3">

          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() =>
                setSlideActual(index)
              }
              className={`h-3 w-3 rounded-full transition ${
                slideActual === index
                  ? "bg-[#AD4E4F]"
                  : "bg-white"
              }`}
              aria-label={`Ir al grupo ${
                index + 1
              }`}
            />
          ))}

        </div>

        {/* PROMOCIÓN */}
        <div className="mx-auto mt-8 max-w-xl text-center">

          <div className="rounded-full border-2 border-[#AD4E4F] px-6 py-3">

            <p className="text-lg font-bold text-[#AD4E4F] md:text-xl">
              DESCUBRE NUESTRA NUEVA COLECCIÓN
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Estilos pensados para ti
            </p>

          </div>

          <Link
            href="/catalogo"
            className="mt-5 inline-block text-sm font-semibold text-[#AD4E4F] hover:underline"
          >
            VER CATÁLOGO
          </Link>

        </div>

      </section>

      {/* =========================
          PRODUCTOS DESTACADOS
      ========================= */}

      <section
        id="catalogo"
        className="bg-[#efd2c7] px-8 py-16 md:px-10"
      >

        <div className="mb-10 flex items-center justify-between">

          <h2 className="text-3xl font-bold text-[#AD4E4F]">
            Nuevos ingresos
          </h2>

          <Link
            href="/catalogo"
            className="font-medium text-[#AD4E4F] hover:underline"
          >
            Ver catálogo completo
          </Link>

        </div>

        <div className="grid gap-10 md:grid-cols-3">

          {productosDestacados.map(
            (producto) => {
              const cantidad =
                obtenerCantidadEnCarrito(
                  producto.id
                );

              return (
                <div
                  key={producto.id}
                  className="text-center"
                >

                  {/* IMAGEN */}
                  <div className="mb-5 flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-4">

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="max-h-full max-w-full object-contain"
                    />

                  </div>

                  {/* NOMBRE */}
                  <h3 className="text-xl font-semibold">
                    {producto.nombre}
                  </h3>

                  {/* PRECIO */}
                  <p className="mt-2 text-lg">
                    $
                    {producto.precio.toFixed(
                      2
                    )}
                  </p>

                  {/* TALLA */}
                  <p className="mt-2 text-gray-500">
                    Talla:{" "}
                    {producto.tallas.join(
                      ", "
                    )}
                  </p>

                  {/* AGREGAR */}
                  <button
                    type="button"
                    onClick={() =>
                      agregarAlCarrito(
                        producto
                      )
                    }
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#AD4E4F] px-6 py-3 text-white transition hover:opacity-90"
                  >

                    {cantidad > 0 ? (
                      <>
                        <span>
                          Agregar más
                        </span>

                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#AD4E4F]">
                          {cantidad}
                        </span>
                      </>
                    ) : (
                      "Agregar al carrito"
                    )}

                  </button>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* =========================
          SOBRE NOSOTROS
      ========================= */}

      <section
        id="nosotros"
        className="bg-[#efd2c7] px-8 py-16 md:px-20"
      >

        <div className="mx-auto max-w-6xl">

          <h2 className="mb-8 text-center text-3xl font-bold text-[#AD4E4F]">
            Sobre Polet Plus
          </h2>

          <div className="mx-auto max-w-5xl text-center text-gray-700">

            <p className="leading-7">

              <span className="font-bold text-[#AD4E4F]">
                Polet Plus
              </span>{" "}

              es una tienda de ropa en línea
              creada con el objetivo de
              ofrecer prendas modernas y
              accesibles de una forma
              práctica. Nuestro catálogo se
              comparte actualmente por
              medios digitales, facilitando
              a nuestros clientes conocer
              los productos, tallas y
              precios disponibles.

            </p>

            <p className="mt-5 leading-7">

              Buscamos brindar una
              experiencia de compra
              sencilla, cercana y
              confiable, ofreciendo envíos
              a diferentes departamentos
              de El Salvador.

            </p>

          </div>

          {/* MISIÓN Y COMPROMISO */}
          <div className="mt-14 grid gap-10 md:grid-cols-2">

            <div className="rounded-2xl bg-white/40 p-8 text-center">

              <h3 className="text-2xl font-bold text-[#AD4E4F]">
                Nuestra Misión
              </h3>

              <p className="mt-4 leading-7 text-gray-700">
                Ofrecer prendas de calidad
                y facilitar el proceso de
                compra en línea, brindando
                a nuestros clientes una
                experiencia sencilla y
                accesible.
              </p>

            </div>

            <div className="rounded-2xl bg-white/40 p-8 text-center">

              <h3 className="text-2xl font-bold text-[#AD4E4F]">
                Nuestro Compromiso
              </h3>

              <p className="mt-4 leading-7 text-gray-700">
                Brindar atención
                personalizada y una
                experiencia de compra
                cómoda, segura y confiable
                para cada uno de nuestros
                clientes.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer
        id="contacto"
        className="bg-[#AD4E4F] px-10 py-10 text-white"
      >

        <div className="grid gap-8 md:grid-cols-3">

          <div>

            <h3 className="text-xl font-bold">
              POLET PLUS
            </h3>

            <p className="mt-3">
              Moda para todos.
            </p>

          </div>

          <div>

            <h3 className="font-semibold">
              Enlaces
            </h3>

            <div className="mt-3 flex flex-col gap-2">

              <a
                href="#"
                className="hover:underline"
              >
                Inicio
              </a>

              <Link
                href="/catalogo"
                className="hover:underline"
              >
                Catálogo
              </Link>

              <a
                href="#nosotros"
                className="hover:underline"
              >
                Sobre nosotros
              </a>

              <a
                href="#contacto"
                className="hover:underline"
              >
                Contacto
              </a>

            </div>

          </div>

          <div>

            <h3 className="font-semibold">
              Contacto
            </h3>

            <p className="mt-3">
              WhatsApp: 77543266
            </p>

            <p className="mt-1">
              Facebook: Polet Plus
            </p>

            <p className="mt-1">
              El Salvador
            </p>

          </div>

        </div>

        <div className="mt-10 border-t border-white/30 pt-5 text-center text-sm">
          © 2026 Polet Plus. Todos los derechos reservados.
        </div>

      </footer>

      {/* =========================
          PANEL DEL CARRITO
      ========================= */}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

          <div className="flex h-full w-full max-w-md flex-col justify-between bg-white p-6 shadow-2xl">

            <div>

              {/* CABECERA */}
              <div className="flex items-center justify-between border-b pb-4">

                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">

                  <ShoppingCart
                    size={22}
                    className="text-[#AD4E4F]"
                  />

                  Tu Carrito

                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setModalAbierto(false)
                  }
                  className="rounded-full p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>

              </div>

              {/* PRODUCTOS */}
              <div className="mt-6 max-h-[55vh] space-y-4 overflow-y-auto pr-1">

                {carrito.length === 0 ? (

                  <p className="py-10 text-center text-gray-500">
                    Tu carrito está vacío.
                  </p>

                ) : (

                  carrito.map((item) => (

                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >

                      <div className="flex items-center gap-3">

                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="h-12 w-12 rounded-lg bg-white object-cover"
                        />

                        <div>

                          <p className="text-sm font-semibold text-gray-800">
                            {item.nombre}
                          </p>

                          <p className="text-xs text-gray-500">
                            $
                            {item.precio.toFixed(
                              2
                            )}{" "}
                            x {item.cantidad}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <span className="text-sm font-bold text-gray-800">
                          $
                          {(
                            item.precio *
                            item.cantidad
                          ).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarDelCarrito(
                              item.id
                            )
                          }
                          className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100 hover:text-red-700"
                        >
                          Borrar
                        </button>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </div>

            {/* PARTE INFERIOR */}
            {carrito.length > 0 ? (

              <div className="space-y-3 border-t pt-4">

                <div className="mb-2 flex items-center justify-between">

                  <span className="font-medium text-gray-600">
                    Total:
                  </span>

                  <span className="text-2xl font-bold text-[#AD4E4F]">
                    $
                    {totalCarrito.toFixed(2)}
                  </span>

                </div>

                {/* CONFIRMAR */}
                <button
                  type="button"
                  onClick={confirmarPedido}
                  disabled={guardando}
                  className="w-full rounded-xl bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {guardando
                    ? "Procesando pedido..."
                    : "Confirmar Pedido"}

                </button>

                <div className="flex gap-2">

                  {/* VACIAR */}
                  <button
                    type="button"
                    onClick={vaciarCarrito}
                    className="flex-1 rounded-xl border border-red-300 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Borrar
                  </button>

                  {/* CERRAR */}
                  <button
                    type="button"
                    onClick={() =>
                      setModalAbierto(false)
                    }
                    className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Regresar
                  </button>

                </div>

              </div>

            ) : (

              <div className="border-t pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setModalAbierto(false)
                  }
                  className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Regresar
                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </main>
  );
}