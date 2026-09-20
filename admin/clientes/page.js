
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

import { auth, db } from "../../../lib/firebase";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Users,
  Settings,
  LogOut,
  Search,
  UserRound,
  UserRoundPlus,
  ShoppingCart,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";


export default function ClientesPage() {

  const router = useRouter();

  // ESTADOS DE AUTENTICACIÓN
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [nombreAdmin, setNombreAdmin] = useState("");

  // ESTADOS DE CLIENTES
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // FILTROS
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // PERFIL
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // PAGINACIÓN
  const [pagina, setPagina] = useState(1);
  const clientesPorPagina = 5;


  // ==========================================
  // VERIFICAR QUE EL USUARIO SEA ADMIN
  // ==========================================

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


  // ==========================================
  // OBTENER CLIENTES DESDE FIREBASE
  // ==========================================

  useEffect(() => {

    if (!autorizado) return;

    const obtenerClientes = async () => {

      setCargando(true);
      setError("");

      try {

        // SOLO USUARIOS CON ROL CLIENTE
        const consulta = query(
          collection(db, "users"),
          where("rol", "==", "cliente")
        );

        const resultado = await getDocs(consulta);

        const listaClientes = resultado.docs.map(
          (documento) => {

            const datos = documento.data();

            return {
              id: documento.id,
              ...datos,
            };

          }
        );

        setClientes(listaClientes);

      } catch (error) {

        console.error(
          "Error obteniendo clientes:",
          error
        );

        setError(
          "No se pudieron cargar los clientes. Verifica la conexión con Firebase."
        );

      } finally {

        setCargando(false);

      }

    };

    obtenerClientes();

  }, [autorizado]);


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

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


  // ==========================================
  // FORMATEAR FECHA DE FIREBASE
  // ==========================================

  const formatearFecha = (fecha) => {

    if (!fecha) return "No disponible";

    try {

      let fechaReal;

      if (fecha?.toDate) {
        fechaReal = fecha.toDate();
      } else if (fecha?.seconds) {
        fechaReal = new Date(fecha.seconds * 1000);
      } else {
        fechaReal = new Date(fecha);
      }

      if (isNaN(fechaReal.getTime())) {
        return "No disponible";
      }

      return fechaReal.toLocaleDateString(
        "es-SV",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch {

      return "No disponible";

    }

  };


  // ==========================================
  // DETERMINAR SI ES CLIENTE NUEVO
  // ==========================================

  const esClienteNuevo = (cliente) => {

    if (!cliente.fechaRegistro) return false;

    try {

      const fecha = cliente.fechaRegistro?.toDate
        ? cliente.fechaRegistro.toDate()
        : new Date(cliente.fechaRegistro);

      if (isNaN(fecha.getTime())) return false;

      const ahora = new Date();

      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );

    } catch {

      return false;

    }

  };


  // ==========================================
  // FILTRAR CLIENTES
  // ==========================================

  const clientesFiltrados = useMemo(() => {

    return clientes.filter((cliente) => {

      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        (cliente.nombre || "")
          .toLowerCase()
          .includes(texto) ||
        (cliente.email || "")
          .toLowerCase()
          .includes(texto);

      // Como estos usuarios tienen rol cliente,
      // los consideramos activos mientras existan.
      const estadoCliente = "activo";

      const coincideEstado =
        filtroEstado === "todos" ||
        filtroEstado === estadoCliente;

      return coincideBusqueda && coincideEstado;

    });

  }, [clientes, busqueda, filtroEstado]);


  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const totalClientes = clientes.length;

  const clientesActivos = clientes.length;

  const clientesNuevos = clientes.filter(
    esClienteNuevo
  ).length;


  // ==========================================
  // PAGINACIÓN
  // ==========================================

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      clientesFiltrados.length / clientesPorPagina
    )
  );

  const clientesPagina = clientesFiltrados.slice(
    (pagina - 1) * clientesPorPagina,
    pagina * clientesPorPagina
  );


  // Reiniciar página cuando cambian los filtros
  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);


  // ==========================================
  // PANTALLA DE CARGA
  // ==========================================

  if (verificando) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb]">

        <div className="flex flex-col items-center gap-3">

          <LoaderCircle
            className="animate-spin text-[#AD4E4F]"
            size={32}
          />

          <p className="text-lg font-semibold text-[#AD4E4F]">
            Verificando acceso...
          </p>

        </div>

      </main>
    );

  }


  if (!autorizado) {
    return null;
  }


  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================

  return (

    <main className="flex min-h-screen bg-[#fdf7f5]">

      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside className="hidden min-h-screen w-64 shrink-0 bg-white px-6 py-8 lg:block">

        <Link
          href="/admin"
          className="text-2xl font-bold tracking-wide text-[#AD4E4F]"
        >
          POLET PLUS
        </Link>


        <nav className="mt-12 flex flex-col gap-7">

          <Link
            href="/admin"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>


          <Link
            href="/productos"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Package size={20} />
            Productos
          </Link>


          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <ShoppingBag size={20} />
            Pedidos
          </Link>


          <Link
            href="/admin/inventario"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Boxes size={20} />
            Inventario
          </Link>


          {/* CLIENTES ACTIVO */}

          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 rounded-xl bg-[#fcebed] px-3 py-3 font-semibold text-[#AD4E4F]"
          >
            <Users size={20} />
            Clientes
          </Link>


          <Link
            href="/admin/configuracion"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Settings size={20} />
            Configuración
          </Link>


          <button
            onClick={cerrarSesion}
            className="mt-8 flex items-center gap-3 text-left text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>

        </nav>

      </aside>


      {/* ==================================
          CONTENIDO PRINCIPAL
      ================================== */}

      <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">

        {/* ENCABEZADO */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-[#AD4E4F] sm:text-4xl">
              Gestión de Clientes
            </h1>

            <p className="mt-2 text-gray-500">
              Administra la información de tus clientes registrados en Polet Plus.
            </p>

          </div>


          <Link
            href="/admin"
            className="w-fit rounded-xl border border-[#f5c8cd] bg-white px-5 py-3 font-semibold text-[#7e383b] transition hover:bg-[#fff0f1]"
          >
            Regresar
          </Link>

        </div>


        {/* TARJETAS DE ESTADÍSTICAS */}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">


          {/* TOTAL CLIENTES */}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <Users size={28} />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Total de clientes
                </p>

                <p className="mt-1 text-3xl font-bold text-[#AD4E4F]">
                  {totalClientes}
                </p>

              </div>

            </div>

          </div>


          {/* CLIENTES ACTIVOS */}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <UserRound size={28} />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Clientes activos
                </p>

                <p className="mt-1 text-3xl font-bold text-[#AD4E4F]">
                  {clientesActivos}
                </p>

              </div>

            </div>

          </div>


          {/* NUEVOS CLIENTES */}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <UserRoundPlus size={28} />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Nuevos este mes
                </p>

                <p className="mt-1 text-3xl font-bold text-[#AD4E4F]">
                  {clientesNuevos}
                </p>

              </div>

            </div>

          </div>


          {/* PEDIDOS */}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <ShoppingCart size={28} />

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Clientes registrados
                </p>

                <p className="mt-1 text-3xl font-bold text-[#AD4E4F]">
                  {totalClientes}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* TABLA */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#f6e2e1] bg-white shadow-sm">


          {/* CABECERA TABLA */}

          <div className="flex flex-col gap-4 border-b border-[#f6e2e1] p-5 sm:p-7 xl:flex-row xl:items-center xl:justify-between">

            <h2 className="text-xl font-bold text-[#542e30]">
              Listado de Clientes
            </h2>


            <div className="flex flex-col gap-3 sm:flex-row">

              {/* BUSCADOR */}

              <div className="flex items-center gap-2 rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-3 py-2">

                <Search
                  size={19}
                  className="text-[#AD4E4F]"
                />

                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:w-64"
                />

              </div>


              {/* FILTRO */}

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="rounded-xl border border-[#f1d9d7] bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-[#AD4E4F]"
              >

                <option value="todos">
                  Todos los estados
                </option>

                <option value="activo">
                  Activos
                </option>

              </select>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="m-5 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">

              <AlertCircle size={20} />

              <p>{error}</p>

            </div>

          )}


          {/* CARGANDO */}

          {cargando ? (

            <div className="flex flex-col items-center justify-center gap-3 py-20">

              <LoaderCircle
                size={32}
                className="animate-spin text-[#AD4E4F]"
              />

              <p className="text-gray-500">
                Cargando clientes...
              </p>

            </div>

          ) : (

            <>

              {/* TABLA RESPONSIVA */}

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] border-collapse text-left">

                  <thead>

                    <tr className="border-b border-[#f6e2e1] bg-[#fffafa] text-xs uppercase tracking-wide text-gray-400">

                      <th className="px-6 py-5 font-semibold">
                        Cliente
                      </th>

                      <th className="px-6 py-5 font-semibold">
                        Correo
                      </th>

                      <th className="px-6 py-5 font-semibold">
                        Registro
                      </th>

                      <th className="px-6 py-5 font-semibold">
                        Rol
                      </th>

                      <th className="px-6 py-5 font-semibold">
                        Estado
                      </th>

                      <th className="px-6 py-5 font-semibold">
                        Acción
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {clientesPagina.map((cliente) => (

                      <tr
                        key={cliente.id}
                        className="border-b border-[#f8eeee] transition hover:bg-[#fffafa]"
                      >

                        {/* NOMBRE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fce4e6] font-bold text-[#AD4E4F]">

                              {(cliente.nombre || "C")
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <p className="font-semibold text-[#24324b]">

                                {cliente.nombre || "Sin nombre"}

                              </p>

                              <p className="text-xs text-gray-400">

                                ID: {cliente.id.slice(0, 8)}...

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td className="px-6 py-5 text-sm text-gray-500">

                          {cliente.email || "Sin correo"}

                        </td>


                        {/* FECHA */}

                        <td className="px-6 py-5 text-sm text-gray-500">

                          {formatearFecha(
                            cliente.fechaRegistro
                          )}

                        </td>


                        {/* ROL */}

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-semibold text-[#AD4E4F]">

                            Cliente

                          </span>

                        </td>


                        {/* ESTADO */}

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-[#d9f7e8] px-3 py-1 text-xs font-semibold text-[#16804b]">

                            Activo

                          </span>

                        </td>


                        {/* ACCIÓN */}

                        <td className="px-6 py-5">

                          <button
                            onClick={() => setClienteSeleccionado(cliente)}
                            className="flex items-center gap-2 rounded-xl bg-[#fff0f1] px-4 py-2 text-sm font-semibold text-[#AD4E4F] transition hover:bg-[#fce0e4]"
                          >

                            <Eye size={16} />

                            Ver perfil

                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              {/* SIN CLIENTES */}

              {clientesPagina.length === 0 && (

                <div className="py-16 text-center">

                  <Users
                    size={40}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-gray-500">
                    No se encontraron clientes.
                  </p>

                </div>

              )}


              {/* PAGINACIÓN */}

              {clientesFiltrados.length > 0 && (

                <div className="flex flex-col gap-4 border-t border-[#f6e2e1] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-gray-500">

                    Mostrando{" "}

                    {Math.min(
                      (pagina - 1) * clientesPorPagina + 1,
                      clientesFiltrados.length
                    )}

                    {" - "}

                    {Math.min(
                      pagina * clientesPorPagina,
                      clientesFiltrados.length
                    )}

                    {" de "}

                    {clientesFiltrados.length} clientes

                  </p>


                  <div className="flex items-center gap-2">

                    <button
                      disabled={pagina === 1}
                      onClick={() => setPagina(pagina - 1)}
                      className="rounded-xl border border-[#f1d9d7] p-2 text-[#AD4E4F] transition hover:bg-[#fff0f1] disabled:cursor-not-allowed disabled:opacity-30"
                    >

                      <ChevronLeft size={18} />

                    </button>


                    <span className="rounded-xl bg-[#fce4e6] px-4 py-2 text-sm font-semibold text-[#AD4E4F]">

                      {pagina} / {totalPaginas}

                    </span>


                    <button
                      disabled={pagina === totalPaginas}
                      onClick={() => setPagina(pagina + 1)}
                      className="rounded-xl border border-[#f1d9d7] p-2 text-[#AD4E4F] transition hover:bg-[#fff0f1] disabled:cursor-not-allowed disabled:opacity-30"
                    >

                      <ChevronRight size={18} />

                    </button>

                  </div>

                </div>

              )}

            </>

          )}

        </div>

      </section>


      {/* ==================================
          MODAL PERFIL DEL CLIENTE
      ================================== */}

      {clienteSeleccionado && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">


            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold text-[#542e30]">
                Perfil del cliente
              </h2>

              <button
                onClick={() => setClienteSeleccionado(null)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >

                <X size={20} />

              </button>

            </div>


            <div className="mt-6 flex flex-col items-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fce4e6] text-3xl font-bold text-[#AD4E4F]">

                {(clienteSeleccionado.nombre || "C")
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <h3 className="mt-4 text-xl font-bold text-[#24324b]">

                {clienteSeleccionado.nombre || "Sin nombre"}

              </h3>

              <p className="mt-1 text-sm text-gray-500">

                {clienteSeleccionado.email || "Sin correo"}

              </p>

            </div>


            <div className="mt-6 space-y-4 rounded-xl bg-[#fffafa] p-4">


              <div>

                <p className="text-xs font-semibold uppercase text-gray-400">
                  Nombre completo
                </p>

                <p className="mt-1 text-gray-700">
                  {clienteSeleccionado.nombre || "No disponible"}
                </p>

              </div>


              <div>

                <p className="text-xs font-semibold uppercase text-gray-400">
                  Correo electrónico
                </p>

                <p className="mt-1 break-all text-gray-700">
                  {clienteSeleccionado.email || "No disponible"}
                </p>

              </div>


              <div>

                <p className="text-xs font-semibold uppercase text-gray-400">
                  Fecha de registro
                </p>

                <p className="mt-1 text-gray-700">
                  {formatearFecha(
                    clienteSeleccionado.fechaRegistro
                  )}
                </p>

              </div>


              <div>

                <p className="text-xs font-semibold uppercase text-gray-400">
                  Rol
                </p>

                <p className="mt-1 font-semibold capitalize text-[#AD4E4F]">
                  {clienteSeleccionado.rol}
                </p>

              </div>

            </div>


            <button
              onClick={() => setClienteSeleccionado(null)}
              className="mt-6 w-full rounded-xl bg-[#AD4E4F] py-3 font-semibold text-white transition hover:bg-[#963f42]"
            >

              Cerrar

            </button>

          </div>

        </div>

      )}

    </main>

  );

}