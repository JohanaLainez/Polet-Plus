"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, User, X } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Catalogo() {
  const productos = [
    {
      id: 1,
      nombre: "Vestido blanco con flores",
      precio: 5.99,
      imagen: "/Vestido blanco con flores.png",
      tallas: ["XS"],
    },
    {
      id: 2,
      nombre: "Body Naranja",
      precio: 6.50,
      imagen: "/Body naranja.png",
      tallas: ["S"],
    },
    {
      id: 3,
      nombre: "Vestido playero",
      precio: 5.99,
      imagen: "/Vestido playero.png",
      tallas: ["M"],
    },
    {
      id: 4,
      nombre: "Body Azul",
      precio: 4.99,
      imagen: "/Body azul.png",
      tallas: ["L"],
    },
    {
      id: 5,
      nombre: "Body negro",
      precio: 5.99,
      imagen: "/Body negro.png",
      tallas: ["S"],
    },
    {
      id: 6,
      nombre: "Vestido largo negro",
      precio: 5.99,
      imagen: "/Vestido largo negro.jpeg",
      tallas: ["XL"],
    },
  ];

  const [busqueda, setBusqueda] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("Todas");

  // ESTADOS DEL CARRITO Y MODAL
  const [carrito, setCarrito] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // CONTROL DE RENDERIZADO EN CLIENTE
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideTalla =
      tallaSeleccionada === "Todas" ||
      producto.tallas.includes(tallaSeleccionada);

    return coincideNombre && coincideTalla;
  });

  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.id === producto.id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  // FUNCIÓN PARA OBTENER LA CANTIDAD EN EL CARRITO DE UN PRODUCTO ESPECÍFICO
  const obtenerCantidadEnCarrito = (productoId) => {
    const item = carrito.find((item) => item.id === productoId);
    return item ? item.cantidad : 0;
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const confirmarPedido = async () => {
    if (carrito.length === 0) return;

    setGuardando(true);
    try {
      const usuario = auth?.currentUser;

      await addDoc(collection(db, "pedidos"), {
        clienteNombre:
          usuario?.displayName ||
          (usuario?.email ? usuario.email.split("@")[0] : "Cliente Anónimo"),
        clienteEmail: usuario?.email || "Sin correo",
        items: carrito,
        total: parseFloat(totalCarrito.toFixed(2)),
        estado: "Pendiente",
        fecha: serverTimestamp(),
      });

      alert("¡Pedido realizado con éxito!");
      setCarrito([]);
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al realizar el pedido:", error);
      alert("Error en Firebase: " + error.message);
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
            onClick={() => setModalAbierto(true)}
            className="relative rounded-md bg-[#AD4E4F] p-3 text-white cursor-pointer"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-600 hover:text-[#AD4E4F]"
          >
            <span>Cuenta</span>
            <User size={20} />
          </Link>
        </div>
      </nav>

      {/* ENCABEZADO */}
      <section className="px-8 pb-8 pt-14 text-center">
        <h1 className="text-4xl font-bold text-[#AD4E4F]">Catálogo</h1>
        <p className="mt-3 text-gray-600">
          Descubre nuestras prendas disponibles.
        </p>
      </section>

      {/* BUSCADOR Y FILTROS */}
      <section className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-5 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#AD4E4F] md:max-w-md text-gray-800"
          />

          <select
            value={tallaSeleccionada}
            onChange={(e) => setTallaSeleccionada(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#AD4E4F] text-gray-800"
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {productosFiltrados.map((producto) => {
            const cantidad = obtenerCantidadEnCarrito(producto.id);

            return (
              <div
                key={producto.id}
                className="rounded-2xl bg-white/55 p-5 text-center shadow-sm"
              >
                <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-3">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                  {producto.nombre}
                </h2>

                <p className="mt-2 text-lg font-medium text-gray-800">
                  ${producto.precio.toFixed(2)}
                </p>

                <p className="mt-2 text-gray-600">
                  Tallas: {producto.tallas.join(", ")}
                </p>

                <button
                  onClick={() => agregarAlCarrito(producto)}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#AD4E4F] px-7 py-3 text-white transition hover:opacity-90 cursor-pointer font-medium w-full sm:w-auto"
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

        {productosFiltrados.length === 0 && (
          <p className="py-16 text-center text-lg text-gray-600">
            No se encontraron productos.
          </p>
        )}
      </section>

      {/* MODAL DEL CARRITO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart size={22} className="text-[#AD4E4F]" /> Tu Carrito
                </h2>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                  title="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {carrito.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    Tu carrito está vacío.
                  </p>
                ) : (
                  carrito.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-12 h-12 object-cover rounded-lg bg-white"
                        />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.precio.toFixed(2)} x {item.cantidad}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800 text-sm">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </span>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded bg-red-50 cursor-pointer"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {carrito.length > 0 ? (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">Total:</span>
                  <span className="text-2xl font-bold text-[#AD4E4F]">
                    ${totalCarrito.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={confirmarPedido}
                  disabled={guardando}
                  className="w-full rounded-xl bg-[#AD4E4F] py-3 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? "Procesando pedido..." : "Confirmar Pedido"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={vaciarCarrito}
                    className="flex-1 rounded-xl border border-red-300 text-red-600 py-2 text-sm font-medium hover:bg-red-50 transition cursor-pointer"
                  >
                    Borrar
                  </button>

                  <button
                    onClick={() => setModalAbierto(false)}
                    className="flex-1 rounded-xl border border-gray-300 text-gray-700 py-2 text-sm font-medium hover:bg-gray-100 transition cursor-pointer"
                  >
                    Regresar
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t pt-4">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="w-full rounded-xl bg-gray-100 py-3 text-gray-700 font-medium hover:bg-gray-200 transition cursor-pointer"
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