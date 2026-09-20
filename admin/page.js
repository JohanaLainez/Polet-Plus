"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

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
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
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
        if (!usuario) {
          setVerificando(false);
          router.replace("/login");
          return;
        }

        try {
          const referenciaUsuario = doc(
            db,
            "users",
            usuario.uid
          );

          const documentoUsuario = await getDoc(
            referenciaUsuario
          );

          if (!documentoUsuario.exists()) {
            setVerificando(false);
            router.replace("/");
            return;
          }

          const datosUsuario = documentoUsuario.data();

          if (datosUsuario.rol === "admin") {
            setAutorizado(true);
            setNombreAdmin(
              datosUsuario.nombre || "Administrador"
            );
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
        <p className="text-lg font-semibold text-[#AD4E4F]">
          Verificando acceso...
        </p>
      </main>
    );
  }

  if (!autorizado) {
    return null;
  }

  // DATOS DE EJEMPLO PARA LA GRÁFICA
  const pedidosSemana = [
    { dia: "Lun", cantidad: 5 },
    { dia: "Mar", cantidad: 8 },
    { dia: "Mié", cantidad: 4 },
    { dia: "Jue", cantidad: 10 },
    { dia: "Vie", cantidad: 15 },
    { dia: "Sáb", cantidad: 10 },
    { dia: "Dom", cantidad: 6 },
  ];

  const maxPedidos = Math.max(
    ...pedidosSemana.map((dia) => dia.cantidad)
  );

  const totalPedidosSemana = pedidosSemana.reduce(
    (total, dia) => total + dia.cantidad,
    0
  );

  return (
    <main className="flex min-h-screen bg-[#f7f8fb]">

      {/* SIDEBAR */}
      <aside className="hidden min-h-screen w-72 shrink-0 bg-white px-7 py-9 lg:block">

        <Link
          href="/admin"
          className="text-3xl font-bold tracking-tight text-[#AD4E4F]"
        >
          POLET PLUS
        </Link>

        <nav className="mt-16 flex flex-col gap-3">

          {/* DASHBOARD */}
          <Link
            href="/admin"
            className="flex items-center gap-4 rounded-xl bg-[#fdf0f1] px-4 py-3 font-semibold text-[#AD4E4F]"
          >
            <LayoutDashboard size={21} />
            Dashboard
          </Link>

          {/* PRODUCTOS */}
          <Link
            href="/productos"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 transition hover:bg-[#fdf0f1] hover:text-[#AD4E4F]"
          >
            <Package size={21} />
            Productos
          </Link>

          {/* PEDIDOS */}
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 transition hover:bg-[#fdf0f1] hover:text-[#AD4E4F]"
          >
            <ShoppingBag size={21} />
            Pedidos
          </Link>

          {/* INVENTARIO */}
          <Link
            href="/admin/inventario"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 transition hover:bg-[#fdf0f1] hover:text-[#AD4E4F]"
          >
            <Boxes size={21} />
            Inventario
          </Link>

          {/* CLIENTES */}
          <Link
            href="/admin/clientes"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 transition hover:bg-[#fdf0f1] hover:text-[#AD4E4F]"
          >
            <Users size={21} />
            Clientes
          </Link>

          {/* CONFIGURACIÓN */}
          <Link
            href="/admin/configuracion"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-500 transition hover:bg-[#fdf0f1] hover:text-[#AD4E4F]"
          >
            <Settings size={21} />
            Configuración
          </Link>

          {/* CERRAR SESIÓN */}
          <button
            onClick={cerrarSesion}
            className="mt-12 flex items-center gap-4 rounded-xl px-4 py-3 text-left text-gray-500 transition hover:bg-[#fdf0f1] hover:text-[#AD4E4F]"
          >
            <LogOut size={21} />
            Cerrar sesión
          </button>

        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">

        {/* ENCABEZADO */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-base text-gray-500">
              Resumen general de Polet Plus
            </p>
          </div>

          <div className="flex items-center justify-between gap-6 sm:justify-end">

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Sesión iniciada como
              </p>

              <p className="font-semibold text-[#AD4E4F]">
                {nombreAdmin}
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 sm:flex">
              <CalendarDays size={18} />
              Esta semana
            </div>

          </div>
        </header>

        {/* TARJETAS PRINCIPALES */}
        <section className="mt-10 grid gap-5 md:grid-cols-3">

          {/* PEDIDOS PENDIENTES */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pedidos pendientes
            </p>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-bold text-[#AD4E4F]">
                8
              </p>

              <ShoppingBag
                size={28}
                strokeWidth={1.5}
                className="text-[#DDA5A6]"
              />
            </div>
          </div>

          {/* PEDIDOS ENTREGADOS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pedidos entregados
            </p>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-bold text-[#AD4E4F]">
                24
              </p>

              <TrendingUp
                size={28}
                strokeWidth={1.5}
                className="text-[#DDA5A6]"
              />
            </div>
          </div>

          {/* PRODUCTOS DISPONIBLES */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Productos disponibles
            </p>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-bold text-[#AD4E4F]">
                36
              </p>

              <Package
                size={28}
                strokeWidth={1.5}
                className="text-[#DDA5A6]"
              />
            </div>
          </div>

        </section>

        {/* GRÁFICA Y PEDIDOS RECIENTES */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">

          {/* GRÁFICA */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-3">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pedidos de la semana
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Cantidad de pedidos por día
                </p>
              </div>

              <div className="rounded-lg bg-[#fdf0f1] p-2 text-[#AD4E4F]">
                <TrendingUp size={20} />
              </div>

            </div>

            {/* GRÁFICA DE BARRAS CORREGIDA */}
            <div className="mt-8 flex h-64 items-end justify-between gap-2 border-b border-gray-100 px-1 sm:gap-4">

              {pedidosSemana.map((dia) => (

                <div
                  key={dia.dia}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >

                  {/* CANTIDAD */}
                  <span className="mb-2 text-xs text-gray-400">
                    {dia.cantidad}
                  </span>

                  {/* CONTENEDOR DE BARRA */}
                  <div className="flex h-48 w-full items-end justify-center">

                    {/* BARRA */}
                    <div
                      className="w-full max-w-10 rounded-t-lg bg-[#DCA4A5] transition-all duration-300 hover:bg-[#AD4E4F]"
                      style={{
                        height: `${(dia.cantidad / maxPedidos) * 100}%`,
                      }}
                    />

                  </div>

                  {/* DÍA */}
                  <span className="mt-3 text-xs text-gray-500">
                    {dia.dia}
                  </span>

                </div>

              ))}

            </div>

            {/* TOTAL SEMANAL */}
            <div className="mt-5 flex items-center justify-between text-sm text-gray-500">

              <span>
                Total de pedidos
              </span>

              <span className="font-semibold text-[#AD4E4F]">
                {totalPedidosSemana} pedidos
              </span>

            </div>

          </div>

          {/* PEDIDOS RECIENTES */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-2">

              <h2 className="text-xl font-bold text-gray-900">
                Pedidos recientes
              </h2>

              <Link
                href="/admin/pedidos"
                className="flex items-center gap-1 text-sm font-semibold text-[#AD4E4F] hover:underline"
              >
                Ver todos
                <ArrowUpRight size={16} />
              </Link>

            </div>

            <div className="mt-6 divide-y divide-gray-100">

              {/* PEDIDO 1 */}
              <div className="grid grid-cols-[1fr_auto] gap-3 py-4">

                <div>
                  <p className="font-semibold text-gray-800">
                    #001
                  </p>

                  <p className="text-sm text-gray-500">
                    Andrea R.
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-semibold text-gray-700">
                    $28.00
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
                    Pendiente
                  </span>

                </div>

              </div>

              {/* PEDIDO 2 */}
              <div className="grid grid-cols-[1fr_auto] gap-3 py-4">

                <div>
                  <p className="font-semibold text-gray-800">
                    #002
                  </p>

                  <p className="text-sm text-gray-500">
                    Sofía L.
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-semibold text-gray-700">
                    $28.00
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    Entregado
                  </span>

                </div>

              </div>

              {/* PEDIDO 3 */}
              <div className="grid grid-cols-[1fr_auto] gap-3 py-4">

                <div>
                  <p className="font-semibold text-gray-800">
                    #003
                  </p>

                  <p className="text-sm text-gray-500">
                    Daniel M.
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-semibold text-gray-700">
                    $42.00
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
                    Pendiente
                  </span>

                </div>

              </div>

            </div>

            <Link
              href="/admin/pedidos"
              className="mt-4 block rounded-xl bg-[#fdf0f1] py-3 text-center text-sm font-semibold text-[#AD4E4F] transition hover:bg-[#f8e1e3]"
            >
              Administrar pedidos
            </Link>

          </div>

        </section>

      </section>

    </main>
  );
}