"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

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
      imagen: "Vestido playero.png",
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

  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideTalla =
      tallaSeleccionada === "Todas" ||
      producto.tallas.includes(tallaSeleccionada);

    return coincideNombre && coincideTalla;
  });

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
            className="rounded-md bg-[#AD4E4F] p-3 text-white"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
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

        <h1 className="text-4xl font-bold text-[#AD4E4F]">
          Catálogo
        </h1>

        <p className="mt-3 text-gray-600">
          Descubre nuestras prendas disponibles.
        </p>

      </section>

      {/* BUSCADOR Y FILTROS */}
      <section className="mx-auto max-w-7xl px-8">

        <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-5 md:flex-row md:items-center md:justify-between">

          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#AD4E4F] md:max-w-md"
          />

          {/* FILTRO POR TALLA */}
          <select
            value={tallaSeleccionada}
            onChange={(e) => setTallaSeleccionada(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#AD4E4F]"
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

          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="rounded-2xl bg-white/55 p-5 text-center shadow-sm"
            >

              {/* IMAGEN */}
              <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-3">

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="max-h-full max-w-full object-contain"
                />

              </div>

              {/* INFORMACIÓN */}
              <h2 className="mt-5 text-xl font-semibold text-gray-900">
                {producto.nombre}
              </h2>

              <p className="mt-2 text-lg font-medium">
                ${producto.precio.toFixed(2)}
              </p>

              <p className="mt-2 text-gray-600">
                Tallas: {producto.tallas.join(", ")}
              </p>

              <button
                className="mt-5 rounded-full bg-[#AD4E4F] px-7 py-3 text-white transition hover:opacity-90"
              >
                Agregar al carrito
              </button>

            </div>
          ))}

        </div>

        {/* SI NO HAY RESULTADOS */}
        {productosFiltrados.length === 0 && (
          <p className="py-16 text-center text-lg text-gray-600">
            No se encontraron productos.
          </p>
        )}

      </section>

    </main>
  );
}