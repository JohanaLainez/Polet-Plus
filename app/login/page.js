export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efd2c7]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-center text-3xl font-bold text-[#AD4E4F]">
          Iniciar sesión
        </h1>

        <div className="mt-8">
          <label className="block text-gray-700">
            Correo electrónico
          </label>

          <input
            type="email"
            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-[#AD4E4F]"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="mt-5">
          <label className="block text-gray-700">
            Contraseña
          </label>

          <input
            type="password"
            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-[#AD4E4F]"
            placeholder="Contraseña"
          />
        </div>

        <button className="mt-7 w-full rounded-lg bg-[#AD4E4F] py-3 font-semibold text-white hover:opacity-90">
          Iniciar sesión
        </button>

        <p className="mt-5 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <a href="/registro" className="font-semibold text-[#AD4E4F]">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}