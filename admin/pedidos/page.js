"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

export default function GestionPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [cargando, setCargando] = useState(true);

  // pedidos en tiempo real desde fb.
  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const listaPedidos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPedidos(listaPedidos);
        setCargando(false);
      },
      (error) => {
        console.error("Error al obtener pedidos:", error);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Actualizar
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const pedidoRef = doc(db, "pedidos", id);
      await updateDoc(pedidoRef, { estado: nuevoEstado });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  // Eliminar
  const ejecutarEliminacion = async () => {
    if (!pedidoAEliminar) return;

    try {
      await deleteDoc(doc(db, "pedidos", pedidoAEliminar));
      setPedidoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      alert("Error al intentar eliminar el pedido de Firestore.");
    }
  };

  // Contadores para las tarjetas del Dashboard
  const totalPedidos = pedidos.length;
  const pendientes = pedidos.filter((p) => p.estado === "Pendiente").length;
  const completados = pedidos.filter((p) => p.estado === "Completado").length;

  return (
    <div className="min-h-screen bg-[#FFF9F6] p-6 md:p-10 font-sans">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#AD4E4F]">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Supervisión y estado de las compras de Polet Plus.
          </p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 bg-white border border-rose-200 text-gray-700 hover:text-[#AD4E4F] rounded-xl text-sm font-semibold shadow-xs hover:border-rose-300 transition"
        >
          Regresar
        </Link>
      </div>

      {/* METRICAS Y DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-xl">
            📦
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Total Pedidos
            </p>
            <p className="text-2xl font-black text-gray-800">{totalPedidos}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl">
            ⏳
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Pendientes
            </p>
            <p className="text-2xl font-black text-gray-800">{pendientes}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl">
            ✅
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Completados
            </p>
            <p className="text-2xl font-black text-gray-800">{completados}</p>
          </div>
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-rose-50">
          <h2 className="text-lg font-bold text-gray-800">Listado de Pedidos</h2>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Cargando pedidos desde la base de datos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hay pedidos registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-rose-50 text-gray-400 text-[11px] uppercase tracking-wider bg-rose-50/30">
                  <th className="p-4 pl-6 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Total</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Cambiar Estado</th>
                  <th className="p-4 pr-6 text-center font-bold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-gray-700">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-rose-50/20 transition">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-gray-900">
                        {pedido.clienteNombre || "Sin nombre"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pedido.clienteEmail || "Sin correo"}
                      </p>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      ${Number(pedido.total || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          pedido.estado === "Completado"
                            ? "bg-emerald-100 text-emerald-700"
                            : pedido.estado === "En proceso"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {pedido.estado || "Pendiente"}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={pedido.estado || "Pendiente"}
                        onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg text-xs p-1.5 focus:ring-1 focus:ring-[#AD4E4F] outline-none cursor-pointer"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </td>
                    <td className="p-4 pr-6 text-center space-x-2">
                      <button
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="bg-rose-100/60 text-[#AD4E4F] hover:bg-[#AD4E4F] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => setPedidoAEliminar(pedido.id)}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: VER DETALLE DEL PEDIDO */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-rose-100">
            <div className="flex justify-between items-center border-b border-rose-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#AD4E4F]">
                  Detalles del Pedido
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  ID: #{pedidoSeleccionado.id?.substring(0, 8).toUpperCase() || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-sm space-y-1.5">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Nombre:</span>{" "}
                  {pedidoSeleccionado.clienteNombre || "Sin nombre registrado"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Correo:</span>{" "}
                  {pedidoSeleccionado.clienteEmail || "Sin correo registrado"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Fecha de pedido:</span>{" "}
                  {pedidoSeleccionado.fecha?.toDate
                    ? pedidoSeleccionado.fecha.toDate().toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : pedidoSeleccionado.fecha || "Fecha no disponible"}
                </p>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-xl space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Productos Solicitados
                </p>
                {pedidoSeleccionado.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-rose-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{item.nombre}</p>
                      <p className="text-xs text-gray-500">
                        Tallas:{" "}
                        {Array.isArray(item.tallas)
                          ? item.tallas.join(", ")
                          : item.talla || item.tallas || "No especificada"}{" "}
                        | Cantidad: {item.cantidad || 1}
                      </p>
                    </div>
                    <p className="font-bold text-[#AD4E4F]">
                      ${((item.precio || 0) * (item.cantidad || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-700">Monto Total:</span>
                <span className="text-xl font-bold text-[#AD4E4F]">
                  ${Number(pedidoSeleccionado.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setPedidoSeleccionado(null)}
              className="w-full rounded-xl bg-[#AD4E4F] py-2.5 text-white font-semibold hover:opacity-90 transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {pedidoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-rose-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ¿Eliminar pedido?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer. El registro se borrará permanentemente de Firestore.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPedidoAEliminar(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarEliminacion}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}