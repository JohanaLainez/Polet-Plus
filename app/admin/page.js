"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [nombreAdmin, setNombreAdmin] = useState("");

  // PROTEGER RUTA ADMIN
  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(
      auth,
      async (usuario) => {
        // Si no hay usuario autenticado
        if (!usuario) {
          setVerificando(false);
          router.replace("/login");
          return;
        }

        try {
          // Buscar información del usuario en Firestore
          const referenciaUsuario = doc(
            db,
            "users",
            usuario.uid
          );

          const documentoUsuario = await getDoc(
            referenciaUsuario
          );

          // Si no existe el documento del usuario
          if (!documentoUsuario.exists()) {
            setVerificando(false);
            router.replace("/");
            return;
          }

          const datosUsuario = documentoUsuario.data();

          // Verificar si es administrador
          if (datosUsuario.rol === "admin") {
            setAutorizado(true);
            setNombreAdmin(datosUsuario.nombre || "Administrador");
          } else {
            router.replace("/");
          }
        } catch (error) {
          console.error(
            "Error verificando permisos:",
            error
          );

          router.replace("/login");
        } finally {
          setVerificando(false);
        }
      }
    );

    return () => cancelarObservador();
  }, [router]);

  // CERRAR SESIÓN
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(
        "Error al cerrar sesión:",
        error
      );
    }
  };

  // PANTALLA DE CARGA
  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#AD4E4F]">
            Verificando acceso...
          </p>
        </div>
      </main>
    );
  }

  // Evita mostrar el dashboard antes de confirmar permisos
  if (!autorizado) {
    return null;
  }

  return (
    <main className="flex min-h-screen bg-[#f7f8fb]">

      {/* SIDEBAR */}
      <aside className="min-h-screen w-64 bg-white px-6 py-8">

        {/* LOGO */}
        <Link
          href="/admin"
          className="text-2xl font-bold text-[#AD4E4F]"
        >
          POLET PLUS
        </Link>

        {/* MENÚ */}
        <nav className="mt-12 flex flex-col gap-7">

          {/* DASHBOARD */}
          <Link
            href="/admin"
            className="flex items-center gap-3 font-semibold text-[#AD4E4F]"
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>
          </Link>

          {/* PRODUCTOS */}
          <Link
            href="/admin/productos"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Package size={20} />

            <span>
              Productos
            </span>
          </Link>

          {/* PEDIDOS */}
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <ShoppingBag size={20} />

            <span>
              Pedidos
            </span>
          </Link>

          {/* INVENTARIO */}
          <Link
            href="/admin/inventario"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Boxes size={20} />

            <span>
              Inventario
            </span>
          </Link>

          {/* CLIENTES */}
          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Users size={20} />

            <span>
              Clientes
            </span>
          </Link>

          {/* CONFIGURACIÓN */}
          <Link
            href="/admin/configuracion"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Settings size={20} />

            <span>
              Configuración
            </span>
          </Link>

          {/* CERRAR SESIÓN */}
          <button
            onClick={cerrarSesion}
            className="mt-8 flex items-center gap-3 text-left text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <LogOut size={20} />

            <span>
              Cerrar sesión
            </span>
          </button>

        </nav>

      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section className="flex-1 p-10">

        {/* ENCABEZADO */}
        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Resumen general de Polet Plus
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              Sesión iniciada como
            </p>

            <p className="font-semibold text-[#AD4E4F]">
              {nombreAdmin}
            </p>
          </div>

        </div>

        {/* TARJETAS */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {/* PEDIDOS PENDIENTES */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-gray-500">
              Pedidos pendientes
            </p>

            <p className="mt-3 text-3xl font-bold text-[#AD4E4F]">
              8
            </p>

          </div>

          {/* PEDIDOS ENTREGADOS */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-gray-500">
              Pedidos entregados
            </p>

            <p className="mt-3 text-3xl font-bold text-[#AD4E4F]">
              24
            </p>

          </div>

          {/* PRODUCTOS */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-gray-500">
              Productos disponibles
            </p>

            <p className="mt-3 text-3xl font-bold text-[#AD4E4F]">
              36
            </p>

          </div>

        </div>

        {/* PEDIDOS RECIENTES */}
        <section className="mt-10">

          <h2 className="text-xl font-bold text-gray-900">
            Pedidos recientes
          </h2>

          <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">

            {/* ENCABEZADOS */}
            <div className="grid grid-cols-4 border-b p-5 font-semibold text-gray-700">

              <span>
                Pedido
              </span>

              <span>
                Cliente
              </span>

              <span>
                Total
              </span>

              <span>
                Estado
              </span>

            </div>

            {/* PEDIDO 1 */}
            <div className="grid grid-cols-4 border-b p-5 text-gray-600">

              <span>
                #001
              </span>

              <span>
                Andrea R.
              </span>

              <span>
                $28.00
              </span>

              <span className="font-medium text-orange-500">
                Pendiente
              </span>

            </div>

            {/* PEDIDO 2 */}
            <div className="grid grid-cols-4 p-5 text-gray-600">

              <span>
                #002
              </span>

              <span>
                Sofía L.
              </span>

              <span>
                $28.00
              </span>

              <span className="font-medium text-green-600">
                Entregado
              </span>

            </div>

          </div>

        </section>

      </section>

    </main>
  );
}