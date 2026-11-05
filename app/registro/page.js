"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function Registro() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  // =========================
  // REGISTRO NORMAL
  // =========================
  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !nombre.trim() ||
      !correo.trim() ||
      !password ||
      !confirmarPassword
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    try {
      setCargando(true);

      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          correo.trim(),
          password
        );

      await setDoc(
        doc(
          db,
          "users",
          credencial.user.uid
        ),
        {
          nombre: nombre.trim(),
          email: correo.trim(),
          rol: "cliente",
          fechaRegistro: serverTimestamp(),
        }
      );

      alert("Cuenta creada correctamente.");

      router.push("/login");

    } catch (error) {
      console.error(
        "Error al registrar usuario:",
        error
      );

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "Este correo electrónico ya está registrado."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setError(
          "El correo electrónico no es válido."
        );
      } else if (
        error.code ===
        "auth/weak-password"
      ) {
        setError(
          "La contraseña debe tener al menos 6 caracteres."
        );
      } else {
        setError(
          "Ocurrió un error al crear la cuenta."
        );
      }

    } finally {
      setCargando(false);
    }
  };

  // =========================
  // REGISTRO CON GOOGLE
  // =========================
  const manejarRegistroGoogle = async () => {
    setError("");

    try {
      setCargandoGoogle(true);

      const provider =
        new GoogleAuthProvider();

      // Mostrar selector de cuentas
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

      // SI YA EXISTE, NO VOLVER A REGISTRAR
      if (documentoUsuario.exists()) {
        const datosUsuario =
          documentoUsuario.data();

        await signOut(auth);

        if (
          datosUsuario.rol === "admin"
        ) {
          setError(
            "Esta cuenta de Google ya pertenece a un administrador. Utiliza Iniciar sesión."
          );
        } else {
          setError(
            "Esta cuenta de Google ya está registrada. Utiliza Iniciar sesión."
          );
        }

        return;
      }

      // SI NO EXISTE, CREAR COMO CLIENTE
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

      alert(
        "Cuenta de Google registrada correctamente."
      );

      router.push("/");

    } catch (error) {
      console.error(
        "Error registro Google:",
        error
      );

      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "El registro con Google fue cancelado."
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
          "No se pudo realizar el registro con Google."
        );
      }

    } finally {
      setCargandoGoogle(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efd2c7] px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* NOMBRE DE LA TIENDA */}
        <Link
          href="/"
          className="block text-center text-2xl font-semibold tracking-[0.15em] text-[#AD4E4F]"
        >
          POLET PLUS
        </Link>

        <h1 className="mt-6 text-center text-3xl font-bold text-[#AD4E4F]">
          Crear cuenta
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          Regístrate para comenzar a comprar.
        </p>

        <form
          onSubmit={manejarRegistro}
          className="mt-8"
        >
          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
              placeholder="Ingresa tu nombre"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#AD4E4F]"
            />
          </div>

          {/* CORREO */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700">
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
              placeholder="correo@ejemplo.com"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#AD4E4F]"
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700">
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
              placeholder="Mínimo 6 caracteres"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#AD4E4F]"
            />
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={
                confirmarPassword
              }
              onChange={(e) =>
                setConfirmarPassword(
                  e.target.value
                )
              }
              placeholder="Confirma tu contraseña"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#AD4E4F]"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* REGISTRO NORMAL */}
          <button
            type="submit"
            disabled={
              cargando ||
              cargandoGoogle
            }
            className="mt-7 w-full rounded-lg bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando
              ? "Creando cuenta..."
              : "Crear cuenta"}
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

        {/* REGISTRO GOOGLE */}
        <button
          type="button"
          onClick={
            manejarRegistroGoogle
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
            : "Registrarse con Google"}
        </button>

        {/* LOGIN */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#AD4E4F] hover:underline"
          >
            Inicia sesión
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