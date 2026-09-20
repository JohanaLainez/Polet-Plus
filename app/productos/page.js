"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  // Estado del formulario incluyendo la Talla
  const [formulario, setFormulario] = useState({
    nombre: "",
    precio: "",
    categoria: "Ropa",
    talla: "XS",
    imagen: "",
    descripcion: "",
  });

  // =========================
  // 1. LEER PRODUCTOS
  // =========================
  const obtenerProductos = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const lista = querySnapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));
      setProductos(lista);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // Abrir modal para CREAR
  const abrirModalCrear = () => {
    setProductoEditar(null);
    setFormulario({
      nombre: "",
      precio: "",
      categoria: "Ropa",
      talla: "XS",
      imagen: "",
      descripcion: "",
    });
    setModalAbierto(true);
  };

  // Abrir modal para EDITAR
  const abrirModalEditar = (producto) => {
    setProductoEditar(producto);
    setFormulario({
      nombre: producto.nombre || "",
      precio: producto.precio || "",
      categoria: producto.categoria || "Ropa",
      talla: producto.talla || "XS",
      imagen: producto.imagen || "",
      descripcion: producto.descripcion || "",
    });
    setModalAbierto(true);
  };

  // =========================
  // 2. GUARDAR / ACTUALIZAR
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formulario.nombre || !formulario.precio) return;

    setGuardando(true);
    try {
      if (productoEditar) {
        // Actualizar producto
        const docRef = doc(db, "productos", productoEditar.id);
        await updateDoc(docRef, {
          nombre: formulario.nombre,
          precio: parseFloat(formulario.precio),
          categoria: formulario.categoria,
          talla: formulario.talla,
          imagen: formulario.imagen || "https://via.placeholder.com/300",
          descripcion: formulario.descripcion,
        });
      } else {
        // Crear nuevo producto
        await addDoc(collection(db, "productos"), {
          nombre: formulario.nombre,
          precio: parseFloat(formulario.precio),
          categoria: formulario.categoria,
          talla: formulario.talla,
          imagen: formulario.imagen || "https://via.placeholder.com/300",
          descripcion: formulario.descripcion,
          fechaCreacion: serverTimestamp(),
        });
      }

      setModalAbierto(false);
      obtenerProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    } finally {
      setGuardando(false);
    }
  };

  // =========================
  // 3. ELIMINAR PRODUCTO
  // =========================
  const eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "productos", id));
        setProductos(productos.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#fcf5f2] text-[#4a3b32] p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ENCABEZADO Y REGRESAR */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#9e4a49]">
              Gestión de Productos
            </h1>
            <p className="mt-1 text-sm text-[#8c7468]">
              Administra los detalles de las prendas, precios y tallas.
            </p>
          </div>

          <Link
                    href="/admin"
                    className="px-4 py-2 bg-white border border-rose-200 text-gray-700 hover:text-[#AD4E4F] rounded-xl text-sm font-semibold shadow-xs hover:border-rose-300 transition"
                  >
                    Regresar
                  </Link>
        </div>

        {/* CONTENEDOR BLANCO PRINCIPAL (TABLA) */}
        <div className="rounded-3xl bg-white p-6 shadow-xs border border-gray-100/50 space-y-6">

          {/* BARRA SUPERIOR CON BUSCADOR Y BOTÓN AGREGAR */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-[#4a3b32]">
              Listado de Productos
            </h2>

            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b09b8e]"
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-xl bg-[#fcf8f5] py-2 pl-10 pr-4 text-xs text-[#4a3b32] placeholder-[#b09b8e] outline-none border border-[#f4e3da] focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={abrirModalCrear}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#b85d5c] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#a34e4d] cursor-pointer"
              >
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS */}
          {cargando ? (
            <div className="py-12 text-center text-sm text-[#8c7468]">
              Cargando catálogo...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8c7468]">
              No hay productos registrados o coincidentes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-[#b09b8e]">
                    <th className="pb-3 pl-2">PRODUCTO</th>
                    <th className="pb-3">PRECIO</th>
                    <th className="pb-3">TALLA</th>
                    <th className="pb-3">CATEGORÍA</th>
                    <th className="pb-3 text-right pr-4">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productosFiltrados.map((producto) => (
                    <tr
                      key={producto.id}
                      className="group hover:bg-[#fcf8f5]/50 transition"
                    >
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={producto.imagen || "https://via.placeholder.com/300"}
                            alt={producto.nombre}
                            className="h-10 w-10 rounded-lg bg-gray-50 object-cover border border-gray-100"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300";
                            }}
                          />
                          <div>
                            <p className="font-bold text-[#4a3b32]">
                              {producto.nombre}
                            </p>
                            <p className="text-[11px] text-[#b09b8e]">
                              ID: {producto.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-bold text-[#4a3b32]">
                        ${Number(producto.precio).toFixed(2)}
                      </td>

                      <td className="py-3.5 text-[#7a6254]">
                        {producto.talla || "Única"}
                      </td>

                      <td className="py-3.5">
                        <span className="inline-block rounded-full bg-[#fbebe6] px-2.5 py-0.5 text-[11px] font-bold text-[#b85d5c]">
                          {producto.categoria || "Ropa"}
                        </span>
                      </td>

                      <td className="py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(producto)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#fbebe6] px-2.5 py-1 text-[11px] font-bold text-[#b85d5c] hover:bg-[#f8dbd0] transition cursor-pointer"
                          >
                            <Edit size={12} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarProducto(producto.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <h2 className="text-xl font-bold text-[#4a3b32]">
              {productoEditar ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8c7468]">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={formulario.nombre}
                  onChange={(e) =>
                    setFormulario({ ...formulario, nombre: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl bg-[#fcf8f5] px-3 py-2 text-xs text-[#4a3b32] outline-none border border-[#f4e3da] focus:bg-white"
                  placeholder="Ej. Vestido Fucsia"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8c7468]">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formulario.precio}
                    onChange={(e) =>
                      setFormulario({ ...formulario, precio: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#fcf8f5] px-3 py-2 text-xs text-[#4a3b32] outline-none border border-[#f4e3da] focus:bg-white"
                    placeholder="6.50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8c7468]">
                    Categoría
                  </label>
                  <select
                    value={formulario.categoria}
                    onChange={(e) =>
                      setFormulario({ ...formulario, categoria: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#fcf8f5] px-3 py-2 text-xs text-[#4a3b32] outline-none border border-[#f4e3da] focus:bg-white cursor-pointer"
                  >
                    <option value="Ropa">Ropa</option>
                    <option value="Vestidos">Vestidos</option>
                    <option value="Bodys">Bodys</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8c7468]">
                    Talla
                  </label>
                  <select
                    value={formulario.talla}
                    onChange={(e) =>
                      setFormulario({ ...formulario, talla: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#fcf8f5] px-3 py-2 text-xs text-[#4a3b32] outline-none border border-[#f4e3da] focus:bg-white cursor-pointer"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="Única">Única</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8c7468]">
                  URL de la Imagen
                </label>
                <input
                  type="text"
                  value={formulario.imagen}
                  onChange={(e) =>
                    setFormulario({ ...formulario, imagen: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl bg-[#fcf8f5] px-3 py-2 text-xs text-[#4a3b32] outline-none border border-[#f4e3da] focus:bg-white"
                  placeholder="/pantalon-mezclilla.jpg o https://..."
                />
              </div>

              

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-[#4a3b32] hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 rounded-xl bg-[#b85d5c] py-2 text-xs font-semibold text-white hover:bg-[#a34e4d] transition disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}