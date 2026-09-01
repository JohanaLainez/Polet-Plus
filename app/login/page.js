"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function Login() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setCargando(true);

      // 1. Iniciar sesión con Firebase Authentication
      const credencial = await signInWithEmailAndPassword(
        auth,
        correo,
        password
      );

      // 2. Buscar datos del usuario en Firestore usando el UID
      const referenciaUsuario = doc(
        db,
        "users",
        credencial.user.uid
      );

      const documentoUsuario = await getDoc(referenciaUsuario);

      if (!documentoUsuario.exists()) {
        setError("No se encontró la información del usuario.");
        return;
      }

      // 3. Obtener los datos y el rol
      const datosUsuario = documentoUsuario.data();

      // 4. Redirigir según el rol
      if (datosUsuario.rol === "admin") {
        router.push("/admin");
      } else if (datosUsuario.rol === "cliente") {
        router.push("/");
      } else {
        setError("El usuario no tiene un rol válido.");
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Correo o contraseña incorrectos.");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efd2c7] px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">

        <Link
          href="/"
          className="block text-center text-2xl font-semibold tracking-[0.15em] text-[#AD4E4F]"
        >
          POLET PLUS
        </Link>

        <h1 className="mt-6 text-center text-3xl font-bold text-[#AD4E4F]">
          Iniciar sesión
        </h1>

        <form onSubmit={manejarLogin} className="mt-8">

          {/* CORREO */}
          <div>
            <label className="block text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-[#AD4E4F]"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="mt-5">
            <label className="block text-gray-700">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-[#AD4E4F]"
              placeholder="Contraseña"
            />
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* BOTÓN LOGIN */}
          <button
            type="submit"
            disabled={cargando}
            className="mt-7 w-full rounded-lg bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

        </form>

        {/* REGISTRO */}
        <p className="mt-5 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/registro"
            className="font-semibold text-[#AD4E4F] hover:underline"
          >
            Regístrate
          </Link>
        </p>

        {/* VOLVER AL INICIO */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-[#AD4E4F]"
          >
            ← Volver al inicio
          </Link>
        </div>

      </div>

    </main>
  );
}