"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";

import CuentaMenu from "../../components/CuentaMenu";
import { useCarrito } from "../../context/CarritoContext";

import { db, auth } from "../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

// =========================
// PRODUCTOS BASE (FIJOS)
// =========================
const productosBase = [
  {
    id: "base-1",
    nombre: "Vestido blanco con flores",
    precio: 5.99,
    imagen: "/Vestido blanco con flores.png",
    tallas: ["XS"],
  },
  {
    id: "base-2",
    nombre: "Body Naranja",
    precio: 6.5,
    imagen: "/Body naranja.png",
    tallas: ["S"],
  },
  {
    id: "base-3",
    nombre: "Vestido playero",
    precio: 5.99,
    imagen: "/Vestido playero.png",
    tallas: ["M"],
  },
  {
    id: "base-4",
    nombre: "Body Azul",
    precio: 4.99,
    imagen: "/Body azul.png",
    tallas: ["L"],
  },
  {
    id: "base-5",
    nombre: "Body negro",
    precio: 5.99,
    imagen: "/Body negro.png",
    tallas: ["S"],
  },
  {
    id: "base-6",
    nombre: "Vestido largo negro",
    precio: 5.99,
    imagen: "/Vestido largo negro.jpeg",
    tallas: ["XL"],
  },
];

export default function Catalogo() {
  // Manejo de hidratación (mounted)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // =========================
  // PRODUCTOS COMBINADOS
  // =========================
  const [productos, setProductos] = useState(productosBase);

  useEffect(() => {
    // Escucha la colección "productos" en Firestore y los une con los productos base
    const unsub = onSnapshot(
      collection(db, "productos"),
      (snapshot) => {
        const productosFirestore = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));
        
        // Unimos los fijos con los que vienen de Firebase
        setProductos([...productosBase, ...productosFirestore]);
      },
      (error) => {
        console.error("Error al obtener productos de Firestore:", error);
      }
    );

    return () => unsub();
  }, []);

  // =========================
  // FILTROS & ESTADOS
  // =========================
  const [busqueda, setBusqueda] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("Todas");
  const [guardando, setGuardando] = useState(false);

  // =========================
  // CARRITO COMPARTIDO (CONTEXTO)
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
  // FILTRAR PRODUCTOS
  // =========================
  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = (producto.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const tallasProducto = Array.isArray(producto.tallas)
      ? producto.tallas
      : producto.talla
      ? [producto.talla]
      : [];

    const coincideTalla =
      tallaSeleccionada === "Todas" ||
      tallasProducto.includes(tallaSeleccionada);

    return coincideNombre && coincideTalla;
  });

  // =========================
  // CANTIDAD EN CARRITO
  // =========================
  const obtenerCantidadEnCarrito = (productoId) => {
    const item = carrito.find((item) => item.id === productoId);
    return item ? item.cantidad : 0;
  };

  // =========================
  // CONFIRMAR PEDIDO
  // =========================
  const confirmarPedido = async () => {
    if (carrito.length === 0) return;

    const usuario = auth.currentUser;

    if (!usuario) {
      alert("Debes iniciar sesión antes de realizar un pedido.");
      setModalAbierto(false);
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
          usuario.displayName ||
          usuario.email?.split("@")[0] ||
          "Cliente";
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

      alert("¡Pedido realizado con éxito!");
      vaciarCarrito();
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al realizar el pedido:", error);
      alert("No se pudo realizar el pedido. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#efd2c7]">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white px-8 py-4">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.15em] text-[#AD4E4F]"
          >
            POLET PLUS
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 transition hover:text-[#AD4E4F]"
            >
              Inicio
            </Link>

            <Link
              href="/catalogo"
              className="rounded-md bg-[#AD4E4F] px-7 py-3 text-white"
            >
              Catálogo
            </Link>

            <Link
              href="/#nosotros"
              className="text-gray-600 transition hover:text-[#AD4E4F]"
            >
              Sobre nosotros
            </Link>

            <Link
              href="/#contacto"
              className="text-gray-600 transition hover:text-[#AD4E4F]"
            >
              Contacto
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="relative rounded-md bg-[#AD4E4F] p-3 text-white transition hover:opacity-90 cursor-pointer"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <CuentaMenu />
        </div>
      </nav>

      {/* ENCABEZADO */}
      <section className="px-8 pb-8 pt-14 text-center">
        <h1 className="text-4xl font-bold text-[#AD4E4F]">Catálogo</h1>
        <p className="mt-3 text-gray-600">Descubre nuestras prendas disponibles.</p>
      </section>

      {/* BUSCADOR Y FILTROS */}
      <section className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-5 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-[#AD4E4F] md:max-w-md"
          />

          <select
            value={tallaSeleccionada}
            onChange={(e) => setTallaSeleccionada(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-[#AD4E4F]"
          >
            <option value="Todas">Todas las tallas</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="mx-auto max-w-7xl px-8 py-12">
        {productosFiltrados.length === 0 ? (
          <p className="py-16 text-center text-lg text-gray-600">
            No se encontraron productos.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productosFiltrados.map((producto) => {
              const cantidad = obtenerCantidadEnCarrito(producto.id);
              const precioNumerico = Number(producto.precio) || 0;

              return (
                <div
                  key={producto.id}
                  className="rounded-2xl bg-white/55 p-5 text-center shadow-sm"
                >
                  <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-3">
                    <img
                      src={producto.imagen || "https://via.placeholder.com/300"}
                      alt={producto.nombre}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-gray-900">
                    {producto.nombre}
                  </h2>

                  <p className="mt-2 text-lg font-medium text-gray-800">
                    ${precioNumerico.toFixed(2)}
                  </p>

                  <p className="mt-2 text-gray-600">
                    Tallas:{" "}
                    {Array.isArray(producto.tallas)
                      ? producto.tallas.join(", ")
                      : producto.talla || "Única"}
                  </p>

                  <button
                    type="button"
                    onClick={() => agregarAlCarrito(producto)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#AD4E4F] px-7 py-3 font-medium text-white transition hover:opacity-90 sm:w-auto cursor-pointer"
                  >
                    {cantidad > 0 ? (
                      <>
                        <span>Agregar más</span>
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
            })}
          </div>
        )}
      </section>

      {/* MODAL DEL CARRITO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col justify-between bg-white p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <ShoppingCart size={22} className="text-[#AD4E4F]" />
                  Tu Carrito
                </h2>

                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Cerrar carrito"
                >
                  <X size={20} />
                </button>
              </div>

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

                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.nombre}
                          </p>

                          <p className="text-xs text-gray-500">
                            ${Number(item.precio).toFixed(2)} x {item.cantidad}
                          </p>

                          <p className="text-xs text-gray-400">
                            Talla:{" "}
                            {Array.isArray(item.tallas)
                              ? item.tallas.join(", ")
                              : item.talla || "No especificada"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">
                          ${(Number(item.precio) * item.cantidad).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100 hover:text-red-700 cursor-pointer"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TOTAL Y ACCIONES DEL CARRITO */}
            {carrito.length > 0 ? (
              <div className="space-y-3 border-t pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-[#AD4E4F]">
                    ${totalCarrito.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={confirmarPedido}
                  disabled={guardando}
                  className="w-full rounded-xl bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? "Procesando pedido..." : "Confirmar Pedido"}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={vaciarCarrito}
                    className="flex-1 rounded-xl border border-red-300 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
                  >
                    Borrar
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                  >
                    Regresar
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition hover:bg-gray-200 cursor-pointer"
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