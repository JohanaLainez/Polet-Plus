"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  User,
  LogOut,
  Package,
  CircleUserRound,
  ChevronDown,
} from "lucide-react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function CuentaMenu() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (usuarioActual) => {
        if (!usuarioActual) {
          setUsuario(null);
          setNombre("");
          return;
        }

        setUsuario(usuarioActual);

        try {
          const referenciaUsuario = doc(
            db,
            "users",
            usuarioActual.uid
          );

          const documentoUsuario = await getDoc(
            referenciaUsuario
          );

          if (documentoUsuario.exists()) {
            setNombre(
              documentoUsuario.data().nombre || ""
            );
          }
        } catch (error) {
          console.error(
            "Error obteniendo información del usuario:",
            error
          );
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);

      setMenuAbierto(false);

      router.push("/");
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );
    }
  };

  // SI NO HAY SESIÓN
  if (!usuario) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 text-gray-600 transition hover:text-[#AD4E4F]"
      >
        <span>Cuenta</span>
        <User size={20} />
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setMenuAbierto(true)}
      onMouseLeave={() => setMenuAbierto(false)}
    >
      {/* BOTÓN CUENTA */}
      <button
        type="button"
        onClick={() =>
          setMenuAbierto((anterior) => !anterior)
        }
        className="flex items-center gap-2 text-gray-600 transition hover:text-[#AD4E4F]"
      >
        <span>Cuenta</span>

        <User size={20} />

        <ChevronDown
          size={15}
          className={`transition-transform ${
            menuAbierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* MENÚ */}
      {menuAbierto && (
        <div className="absolute right-0 top-full z-50 pt-3">
          <div className="w-72 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">

            {/* USUARIO */}
            <div className="border-b border-gray-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AD4E4F]/10 text-[#AD4E4F]">
                  <User size={20} />
                </div>

                <div className="min-w-0">

                  <p className="truncate font-semibold text-gray-800">
                    {nombre || "Mi cuenta"}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {usuario.email}
                  </p>

                </div>

              </div>

            </div>

            {/* INFORMACIÓN PERSONAL */}
            <Link
              href="/cuenta"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 transition hover:bg-[#AD4E4F]/5 hover:text-[#AD4E4F]"
            >
              <CircleUserRound size={18} />

              Información personal
            </Link>

            {/* PEDIDOS */}
            <Link
              href="/cuenta#pedidos"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 transition hover:bg-[#AD4E4F]/5 hover:text-[#AD4E4F]"
            >
              <Package size={18} />

              Mis pedidos
            </Link>

            {/* CERRAR SESIÓN */}
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex w-full items-center gap-3 border-t border-gray-100 px-5 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={18} />

              Cerrar sesión
            </button>

          </div>
        </div>
      )}
    </div>
  );
}