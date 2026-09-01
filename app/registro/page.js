"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function Registro() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDAR CAMPOS VACÍOS
    if (!nombre || !correo || !password || !confirmarPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    // VALIDAR CONTRASEÑAS
    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // FIREBASE EXIGE MÍNIMO 6 CARACTERES
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setCargando(true);

      // 1. CREAR USUARIO EN FIREBASE AUTHENTICATION
      const credencial = await createUserWithEmailAndPassword(
        auth,
        correo,
        password
      );

      // 2. GUARDAR DATOS DEL USUARIO EN FIRESTORE
      await setDoc(doc(db, "users", credencial.user.uid), {
        nombre: nombre,
        email: correo,
        rol: "cliente",
        fechaRegistro: new Date(),
      });

      alert("Cuenta creada correctamente.");

      // 3. ENVIAR AL LOGIN
      router.push("/login");

    } catch (error) {
      console.error("Error al registrar usuario:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está registrado.");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrió un error al crear la cuenta.");
      }

    } finally {
      setCargando(false);
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
              onChange={(e) => setNombre(e.target.value)}
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
              onChange={(e) => setCorreo(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
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

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={cargando}
            className="mt-7 w-full rounded-lg bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

        </form>

        {/* IR A LOGIN */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#AD4E4F] hover:underline"
          >
            Inicia sesión
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