"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  Mail,
  Package,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function Cuenta() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [datosUsuario, setDatosUsuario] =
    useState(null);

  const [pedidos, setPedidos] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (usuarioActual) => {
        if (!usuarioActual) {
          router.replace("/login");
          return;
        }

        setUsuario(usuarioActual);

        try {
          // DATOS PERSONALES
          const referenciaUsuario = doc(
            db,
            "users",
            usuarioActual.uid
          );

          const documentoUsuario = await getDoc(
            referenciaUsuario
          );

          if (documentoUsuario.exists()) {
            setDatosUsuario(
              documentoUsuario.data()
            );
          }

          // PEDIDOS DEL USUARIO
          const consultaPedidos = query(
            collection(db, "pedidos"),
            where(
              "clienteEmail",
              "==",
              usuarioActual.email
            )
          );

          const resultadoPedidos =
            await getDocs(consultaPedidos);

          const listaPedidos =
            resultadoPedidos.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data(),
              })
            );

          // ORDENAR POR FECHA
          listaPedidos.sort((a, b) => {
            const fechaA =
              a.fecha?.toDate?.()?.getTime() || 0;

            const fechaB =
              b.fecha?.toDate?.()?.getTime() || 0;

            return fechaB - fechaA;
          });

          setPedidos(listaPedidos);
        } catch (error) {
          console.error(
            "Error cargando la cuenta:",
            error
          );
        } finally {
          setCargando(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);

      router.push("/");
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );
    }
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#efd2c7]">
        <p className="font-semibold text-[#AD4E4F]">
          Cargando tu cuenta...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#efd2c7]">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white px-8 py-4">

        <Link
          href="/"
          className="text-2xl font-semibold tracking-[0.15em] text-[#AD4E4F]"
        >
          POLET PLUS
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 transition hover:text-[#AD4E4F]"
        >
          <ArrowLeft size={18} />

          Regresar a la tienda
        </Link>

      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="text-4xl font-bold text-[#AD4E4F]">
          Mi cuenta
        </h1>

        <p className="mt-2 text-gray-600">
          Consulta tu información personal y tus
          pedidos.
        </p>

        {/* INFORMACIÓN PERSONAL */}
        <section className="mt-10 rounded-2xl bg-white p-7 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-800">
            Información personal
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* NOMBRE */}
            <div className="rounded-xl bg-gray-50 p-5">

              <div className="flex items-center gap-3 text-[#AD4E4F]">
                <User size={20} />

                <span className="font-semibold">
                  Nombre
                </span>
              </div>

              <p className="mt-2 text-gray-700">
                {datosUsuario?.nombre ||
                  "No disponible"}
              </p>

            </div>

            {/* CORREO */}
            <div className="rounded-xl bg-gray-50 p-5">

              <div className="flex items-center gap-3 text-[#AD4E4F]">
                <Mail size={20} />

                <span className="font-semibold">
                  Correo electrónico
                </span>
              </div>

              <p className="mt-2 text-gray-700">
                {usuario?.email}
              </p>

            </div>

          </div>

        </section>

        {/* PEDIDOS */}
        <section
          id="pedidos"
          className="mt-10 rounded-2xl bg-white p-7 shadow-sm"
        >

          <div className="flex items-center gap-3">

            <Package
              size={24}
              className="text-[#AD4E4F]"
            />

            <h2 className="text-2xl font-bold text-gray-800">
              Mis pedidos
            </h2>

          </div>

          {pedidos.length === 0 ? (

            <div className="py-12 text-center">

              <Package
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-4 text-gray-500">
                Todavía no tienes pedidos.
              </p>

              <Link
                href="/catalogo"
                className="mt-5 inline-block rounded-full bg-[#AD4E4F] px-6 py-3 text-white"
              >
                Ver catálogo
              </Link>

            </div>

          ) : (

            <div className="mt-6 space-y-5">

              {pedidos.map((pedido) => (

                <div
                  key={pedido.id}
                  className="rounded-xl border border-gray-200 p-5"
                >

                  {/* CABECERA PEDIDO */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">

                    <div>

                      <p className="text-xs text-gray-400">
                        Pedido
                      </p>

                      <p className="font-mono text-sm font-semibold text-gray-700">
                        #
                        {pedido.id
                          .substring(0, 8)
                          .toUpperCase()}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Fecha
                      </p>

                      <p className="text-sm text-gray-700">
                        {pedido.fecha?.toDate
                          ? pedido.fecha
                              .toDate()
                              .toLocaleDateString(
                                "es-SV"
                              )
                          : "Fecha no disponible"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Estado
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          pedido.estado ===
                          "Completado"
                            ? "bg-green-100 text-green-700"
                            : pedido.estado ===
                              "En proceso"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {pedido.estado ||
                          "Pendiente"}
                      </span>

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Total
                      </p>

                      <p className="font-bold text-[#AD4E4F]">
                        $
                        {Number(
                          pedido.total || 0
                        ).toFixed(2)}
                      </p>

                    </div>

                  </div>

                  {/* PRODUCTOS */}
                  <div className="mt-4 space-y-3">

                    {pedido.items?.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >

                          <div className="flex items-center gap-3">

                            {item.imagen && (
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="h-14 w-14 rounded-lg bg-white object-cover"
                              />
                            )}

                            <div>

                              <p className="font-medium text-gray-800">
                                {item.nombre}
                              </p>

                              <p className="text-xs text-gray-500">
                                Cantidad:{" "}
                                {item.cantidad ||
                                  1}
                              </p>

                              <p className="text-xs text-gray-500">
                                Talla:{" "}
                                {Array.isArray(
                                  item.tallas
                                )
                                  ? item.tallas.join(
                                      ", "
                                    )
                                  : item.talla ||
                                    item.tallas ||
                                    "No especificada"}
                              </p>

                            </div>

                          </div>

                          <p className="font-semibold text-gray-700">
                            $
                            {(
                              Number(
                                item.precio ||
                                  0
                              ) *
                              Number(
                                item.cantidad ||
                                  1
                              )
                            ).toFixed(2)}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* CERRAR SESIÓN */}
        <div className="mt-8 flex justify-end">

          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />

            Cerrar sesión
          </button>

        </div>

      </div>

    </main>
  );
}