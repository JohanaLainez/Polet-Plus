"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function Login() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setCargando(true);

      // 1. Iniciar sesión con correo y contraseña
      const credencial = await signInWithEmailAndPassword(
        auth,
        correo,
        password
      );

      // 2. Buscar usuario en Firestore
      const referenciaUsuario = doc(
        db,
        "users",
        credencial.user.uid
      );

      const documentoUsuario = await getDoc(
        referenciaUsuario
      );

      if (!documentoUsuario.exists()) {
        setError(
          "No se encontró la información del usuario."
        );
        return;
      }

      // 3. Obtener rol
      const datosUsuario =
        documentoUsuario.data();

      // 4. Redirigir
      if (datosUsuario.rol === "admin") {
        router.push("/admin");
      } else if (
        datosUsuario.rol === "cliente"
      ) {
        router.push("/");
      } else {
        setError(
          "El usuario no tiene un rol válido."
        );
      }
    } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error
      );

      if (
        error.code ===
          "auth/invalid-credential" ||
        error.code ===
          "auth/wrong-password" ||
        error.code ===
          "auth/user-not-found"
      ) {
        setError(
          "Correo o contraseña incorrectos."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setError(
          "El correo electrónico no es válido."
        );
      } else {
        setError(
          "No se pudo iniciar sesión. Intenta nuevamente."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // LOGIN CON GOOGLE
  // =========================
  const manejarLoginGoogle = async () => {
    setError("");

    try {
      setCargandoGoogle(true);

      const provider =
        new GoogleAuthProvider();

      // Opcional: fuerza a Google a mostrar
      // el selector de cuentas
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const resultado =
        await signInWithPopup(
          auth,
          provider
        );

      const usuario =
        resultado.user;

      const referenciaUsuario = doc(
        db,
        "users",
        usuario.uid
      );

      const documentoUsuario =
        await getDoc(
          referenciaUsuario
        );

      // Si entra por Google por primera vez,
      // crear su documento como cliente
      if (!documentoUsuario.exists()) {
        await setDoc(
          referenciaUsuario,
          {
            nombre:
              usuario.displayName ||
              "Cliente",
            email:
              usuario.email || "",
            rol: "cliente",
            fechaRegistro:
              serverTimestamp(),
          }
        );

        router.push("/");
        return;
      }

      // Si ya existe, respetar su rol actual
      const datosUsuario =
        documentoUsuario.data();

      if (datosUsuario.rol === "admin") {
        router.push("/admin");
      } else if (
        datosUsuario.rol === "cliente"
      ) {
        router.push("/");
      } else {
        setError(
          "El usuario no tiene un rol válido."
        );
      }
    } catch (error) {
      console.error(
        "Error al iniciar sesión con Google:",
        error
      );

      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "El inicio de sesión con Google fue cancelado."
        );
      } else if (
        error.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "El navegador bloqueó la ventana de Google. Permite ventanas emergentes e intenta nuevamente."
        );
      } else {
        setError(
          "No se pudo iniciar sesión con Google."
        );
      }
    } finally {
      setCargandoGoogle(false);
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

        <form
          onSubmit={manejarLogin}
          className="mt-8"
        >
          {/* CORREO */}
          <div>
            <label className="block text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) =>
                setCorreo(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-[#AD4E4F]"
              placeholder="Contraseña"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* LOGIN NORMAL */}
          <button
            type="submit"
            disabled={
              cargando ||
              cargandoGoogle
            }
            className="mt-7 w-full rounded-lg bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>
        </form>

        {/* SEPARADOR */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300" />

          <span className="text-sm text-gray-500">
            o
          </span>

          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* GOOGLE */}
        <button
          type="button"
          onClick={
            manejarLoginGoogle
          }
          disabled={
            cargandoGoogle ||
            cargando
          }
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-lg font-bold text-[#4285F4]">
            G
          </span>

          {cargandoGoogle
            ? "Conectando..."
            : "Continuar con Google"}
        </button>

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

        {/* VOLVER */}
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