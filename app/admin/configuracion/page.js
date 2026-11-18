"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  onAuthStateChanged,
  signOut,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
  UserRound,
  Store,
  ShieldCheck,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

export default function ConfiguracionPage() {
  const router = useRouter();

  // =========================
  // AUTENTICACIÓN
  // =========================
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  // =========================
  // PERFIL ADMIN
  // =========================
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [correoAdmin, setCorreoAdmin] = useState("");
  const [rolAdmin, setRolAdmin] = useState("admin");

  // =========================
  // CONFIGURACIÓN TIENDA
  // =========================
  const [nombreTienda, setNombreTienda] =
    useState("Polet Plus");

  const [moneda, setMoneda] =
    useState("USD");

  const [correoContacto, setCorreoContacto] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  // =========================
  // CONTRASEÑA
  // =========================
  const [nuevaPassword, setNuevaPassword] =
    useState("");

  const [confirmarPassword, setConfirmarPassword] =
    useState("");

  // =========================
  // ESTADOS GENERALES
  // =========================
  const [guardandoPerfil, setGuardandoPerfil] =
    useState(false);

  const [guardandoTienda, setGuardandoTienda] =
    useState(false);

  const [cambiandoPassword, setCambiandoPassword] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // VERIFICAR ADMIN Y CARGAR INFORMACIÓN
  // ==========================================

  useEffect(() => {
    const cancelarObservador =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            setVerificando(false);
            router.replace("/login");
            return;
          }

          try {
            setUsuarioActual(usuario);

            const referenciaUsuario = doc(
              db,
              "users",
              usuario.uid
            );

            const documentoUsuario =
              await getDoc(
                referenciaUsuario
              );

            if (!documentoUsuario.exists()) {
              router.replace("/");
              return;
            }

            const datosUsuario =
              documentoUsuario.data();

            if (
              datosUsuario.rol !== "admin"
            ) {
              router.replace("/");
              return;
            }

            setAutorizado(true);

            setNombreAdmin(
              datosUsuario.nombre ||
                "Administrador"
            );

            setCorreoAdmin(
              datosUsuario.email ||
                usuario.email ||
                ""
            );

            setRolAdmin(
              datosUsuario.rol ||
                "admin"
            );

            // =========================
            // CARGAR CONFIGURACIÓN TIENDA
            // =========================

            const referenciaConfiguracion =
              doc(
                db,
                "configuracion",
                "tienda"
              );

            const documentoConfiguracion =
              await getDoc(
                referenciaConfiguracion
              );

            if (
              documentoConfiguracion.exists()
            ) {
              const datosConfiguracion =
                documentoConfiguracion.data();

              setNombreTienda(
                datosConfiguracion.nombre ||
                  "Polet Plus"
              );

              setMoneda(
                datosConfiguracion.moneda ||
                  "USD"
              );

              setCorreoContacto(
                datosConfiguracion.correo ||
                  ""
              );

              setTelefono(
                datosConfiguracion.telefono ||
                  ""
              );

              setDireccion(
                datosConfiguracion.direccion ||
                  ""
              );
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

    return () =>
      cancelarObservador();

  }, [router]);

  // ==========================================
  // MOSTRAR MENSAJE TEMPORAL
  // ==========================================

  const mostrarMensaje = (
    texto,
    esError = false
  ) => {
    if (esError) {
      setError(texto);
      setMensaje("");
    } else {
      setMensaje(texto);
      setError("");
    }

    setTimeout(() => {
      setMensaje("");
      setError("");
    }, 4000);
  };

  // ==========================================
  // GUARDAR PERFIL ADMINISTRADOR
  // ==========================================

  const guardarPerfil = async () => {
    if (!usuarioActual) return;

    if (!nombreAdmin.trim()) {
      mostrarMensaje(
        "El nombre no puede estar vacío.",
        true
      );
      return;
    }

    try {
      setGuardandoPerfil(true);
      setError("");

      const referenciaUsuario = doc(
        db,
        "users",
        usuarioActual.uid
      );

      await updateDoc(
        referenciaUsuario,
        {
          nombre: nombreAdmin.trim(),
        }
      );

      mostrarMensaje(
        "Perfil actualizado correctamente."
      );
    } catch (error) {
      console.error(
        "Error actualizando perfil:",
        error
      );

      mostrarMensaje(
        "No se pudo actualizar el perfil.",
        true
      );
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // ==========================================
  // GUARDAR CONFIGURACIÓN DE TIENDA
  // ==========================================

  const guardarConfiguracionTienda =
    async () => {
      if (!nombreTienda.trim()) {
        mostrarMensaje(
          "El nombre de la tienda es obligatorio.",
          true
        );
        return;
      }

      try {
        setGuardandoTienda(true);
        setError("");

        const referenciaConfiguracion =
          doc(
            db,
            "configuracion",
            "tienda"
          );

        await setDoc(
          referenciaConfiguracion,
          {
            nombre:
              nombreTienda.trim(),

            moneda,

            correo:
              correoContacto.trim(),

            telefono:
              telefono.trim(),

            direccion:
              direccion.trim(),
          },
          {
            merge: true,
          }
        );

        mostrarMensaje(
          "Configuración de la tienda guardada correctamente."
        );
      } catch (error) {
        console.error(
          "Error guardando configuración:",
          error
        );

        mostrarMensaje(
          "No se pudo guardar la configuración.",
          true
        );
      } finally {
        setGuardandoTienda(false);
      }
    };

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  const cambiarPassword =
    async () => {
      if (!usuarioActual) return;

      if (
        !nuevaPassword ||
        !confirmarPassword
      ) {
        mostrarMensaje(
          "Completa ambos campos de contraseña.",
          true
        );
        return;
      }

      if (
        nuevaPassword.length < 6
      ) {
        mostrarMensaje(
          "La contraseña debe tener al menos 6 caracteres.",
          true
        );
        return;
      }

      if (
        nuevaPassword !==
        confirmarPassword
      ) {
        mostrarMensaje(
          "Las contraseñas no coinciden.",
          true
        );
        return;
      }

      try {
        setCambiandoPassword(true);

        await updatePassword(
          usuarioActual,
          nuevaPassword
        );

        setNuevaPassword("");
        setConfirmarPassword("");

        mostrarMensaje(
          "Contraseña actualizada correctamente."
        );
      } catch (error) {
        console.error(
          "Error actualizando contraseña:",
          error
        );

        if (
          error.code ===
          "auth/requires-recent-login"
        ) {
          mostrarMensaje(
            "Por seguridad, debes cerrar sesión e iniciar sesión nuevamente antes de cambiar la contraseña.",
            true
          );
        } else {
          mostrarMensaje(
            "No se pudo actualizar la contraseña.",
            true
          );
        }
      } finally {
        setCambiandoPassword(false);
      }
    };

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

      {/* =========================
          SIDEBAR
      ========================== */}

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

          <Link
            href="/admin/clientes"
            className="flex items-center gap-3 text-gray-500 transition hover:text-[#AD4E4F]"
          >
            <Users size={20} />
            Clientes
          </Link>

          {/* CONFIGURACIÓN ACTIVA */}

          <Link
            href="/admin/configuracion"
            className="flex items-center gap-3 rounded-xl bg-[#fcebed] px-3 py-3 font-semibold text-[#AD4E4F]"
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

      {/* =========================
          CONTENIDO PRINCIPAL
      ========================== */}

      <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">

        {/* ENCABEZADO */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-[#AD4E4F] sm:text-4xl">
              Configuración
            </h1>

            <p className="mt-2 text-gray-500">
              Administra tu perfil y la configuración general de Polet Plus.
            </p>

          </div>

          <Link
            href="/admin"
            className="w-fit rounded-xl border border-[#f5c8cd] bg-white px-5 py-3 font-semibold text-[#7e383b] transition hover:bg-[#fff0f1]"
          >
            Regresar
          </Link>

        </div>

        {/* =========================
            MENSAJES
        ========================== */}

        {mensaje && (

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">

            <CheckCircle2 size={20} />

            <p>
              {mensaje}
            </p>

          </div>

        )}

        {error && (

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle size={20} />

            <p>
              {error}
            </p>

          </div>

        )}

        {/* =========================
            GRID PRINCIPAL
        ========================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* =========================
              PERFIL ADMIN
          ========================== */}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <UserRound size={28} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-[#542e30]">
                  Perfil del administrador
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Información de tu cuenta administrativa.
                </p>

              </div>

            </div>

            <div className="mt-6 space-y-5">

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Nombre
                </label>

                <input
                  type="text"
                  value={nombreAdmin}
                  onChange={(e) =>
                    setNombreAdmin(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none transition focus:border-[#AD4E4F]"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  value={correoAdmin}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Rol
                </label>

                <div className="mt-2">

                  <span className="inline-flex rounded-full bg-[#fff0f1] px-4 py-2 text-sm font-semibold capitalize text-[#AD4E4F]">

                    {rolAdmin}

                  </span>

                </div>

              </div>

              <button
                onClick={guardarPerfil}
                disabled={guardandoPerfil}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#AD4E4F] py-3 font-semibold text-white transition hover:bg-[#963f42] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {guardandoPerfil ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar cambios
                  </>
                )}

              </button>

            </div>

          </div>

          {/* =========================
              CONFIGURACIÓN TIENDA
          ========================== */}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <Store size={28} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-[#542e30]">
                  Configuración de la tienda
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Información general de Polet Plus.
                </p>

              </div>

            </div>

            <div className="mt-6 space-y-5">

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Nombre de la tienda
                </label>

                <input
                  type="text"
                  value={nombreTienda}
                  onChange={(e) =>
                    setNombreTienda(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Moneda
                </label>

                <select
                  value={moneda}
                  onChange={(e) =>
                    setMoneda(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                >
                  <option value="USD">
                    USD - Dólar estadounidense
                  </option>
                </select>

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Correo de contacto
                </label>

                <input
                  type="email"
                  value={correoContacto}
                  onChange={(e) =>
                    setCorreoContacto(
                      e.target.value
                    )
                  }
                  placeholder="contacto@poletplus.com"
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Teléfono
                </label>

                <input
                  type="text"
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(
                      e.target.value
                    )
                  }
                  placeholder="+503 0000-0000"
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Dirección
                </label>

                <textarea
                  value={direccion}
                  onChange={(e) =>
                    setDireccion(
                      e.target.value
                    )
                  }
                  placeholder="Dirección de la tienda"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                />

              </div>

              <button
                onClick={
                  guardarConfiguracionTienda
                }
                disabled={
                  guardandoTienda
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#AD4E4F] py-3 font-semibold text-white transition hover:bg-[#963f42] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {guardandoTienda ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar configuración
                  </>
                )}

              </button>

            </div>

          </div>

          {/* 
              SEGURIDAD*/}

          <div className="rounded-2xl border border-[#f6e2e1] bg-white p-6 shadow-sm xl:col-span-2">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f1] text-[#AD4E4F]">

                <ShieldCheck size={28} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-[#542e30]">
                  Seguridad
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Administra la seguridad de tu cuenta.
                </p>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Nueva contraseña
                </label>

                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) =>
                    setNuevaPassword(
                      e.target.value
                    )
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-600">
                  Confirmar contraseña
                </label>

                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) =>
                    setConfirmarPassword(
                      e.target.value
                    )
                  }
                  placeholder="Repite la contraseña"
                  className="mt-2 w-full rounded-xl border border-[#f1d9d7] bg-[#fffafa] px-4 py-3 text-gray-700 outline-none focus:border-[#AD4E4F]"
                />

              </div>

            </div>

            <button
              onClick={cambiarPassword}
              disabled={cambiandoPassword}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#AD4E4F] bg-white py-3 font-semibold text-[#AD4E4F] transition hover:bg-[#fff0f1] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {cambiandoPassword ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Actualizando...
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  Cambiar contraseña
                </>
              )}

            </button>

            <div className="mt-6 border-t border-[#f6e2e1] pt-6">

              <button
                onClick={cerrarSesion}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#542e30] py-3 font-semibold text-white transition hover:bg-[#402224]"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}