"use client";

import Link from "next/link";
import { useState } from "react";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");

  const manejarRegistro = (e) => {
    e.preventDefault();

    if (!nombre || !correo || !password || !confirmarPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");

    console.log({
      nombre,
      correo,
      password,
    });

    alert("Registro completado correctamente.");
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
              placeholder="Ingresa tu contraseña"
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
            className="mt-7 w-full rounded-lg bg-[#AD4E4F] py-3 font-semibold text-white transition hover:opacity-90"
          >
            Crear cuenta
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