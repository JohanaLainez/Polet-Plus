"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, User } from "lucide-react";

export default function Home() {
  const slides = [
    ["/POLET6.jpg", "/POLET7.jpg"],
    ["/POLET8.jpg", "/POLET9.jpg"],
  ];

  const [slideActual, setSlideActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActual((anterior) =>
        anterior === slides.length - 1 ? 0 : anterior + 1
      );
    }, 4000);

    return () => clearInterval(intervalo);
  }, [slides.length]);

  const siguienteSlide = () => {
    setSlideActual((anterior) =>
      anterior === slides.length - 1 ? 0 : anterior + 1
    );
  };

  const slideAnterior = () => {
    setSlideActual((anterior) =>
      anterior === 0 ? slides.length - 1 : anterior - 1
    );
  };

  return (
    <main className="min-h-screen bg-[#efd2c7]">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white px-8 py-4">

        <div className="flex items-center gap-8">
          <a
          href="#"
          className="text-2xl font-bold tracking-wide text-[#AD4E4F]"
          >
            POLET PLUS
          </a>
          
          <button className="rounded-md bg-[#AD4E4F] px-7 py-3 text-white">
            Inicio
          </button>

          <a
            href="#catalogo"
            className="text-gray-600 hover:text-[#AD4E4F]"
          >
            Catálogo
          </a>

          <a
            href="#nosotros"
            className="text-gray-600 hover:text-[#AD4E4F]"
          >
            Sobre nosotros
          </a>

          <a
            href="#contacto"
            className="text-gray-600 hover:text-[#AD4E4F]"
          >
            Contacto
          </a>
        </div>

        <div className="flex items-center gap-6">

          {/* CARRITO */}
        <button
         className="rounded-md bg-[#AD4E4F] p-3 text-white transition hover:opacity-90"
         aria-label="Carrito"
        >
        <ShoppingCart size={20} />
        </button>

       {/* CUENTA */}
       <button
       className="flex items-center gap-2 text-gray-600 transition hover:text-[#AD4E4F]"
       aria-label="Cuenta"
       >
       <span>Cuenta</span>
       <User size={20} />
  </button>

  </div>
          

      </nav>

      {/* HERO PRINCIPAL */}
      <section className="bg-[#efd2c7] px-5 py-10 md:px-10">

        {/* TEXTO */}
        <div className="mb-8 text-center">

          <p className="text-3xl italic text-[#AD4E4F] md:text-5xl">
            Eleva
          </p>

          <h1 className="text-5xl font-semibold text-[#AD4E4F] md:text-7xl">
            Tu estilo
          </h1>

        </div>

        {/* CARRUSEL */}
        <div className="relative mx-auto max-w-6xl overflow-hidden">

          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${slideActual * 100}%)`,
            }}
          >

            {slides.map((slide, index) => (
              <div
                key={index}
                className="grid min-w-full grid-cols-1 gap-4 px-1 sm:grid-cols-2"
              >

                {slide.map((imagen, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="h-[360px] overflow-hidden rounded-[28px] bg-white sm:h-[430px] md:h-[500px]"
                  >

                    <img
                      src={imagen}
                      alt={`Colección Polet Plus ${index * 2 + imgIndex + 1}`}
                      className="h-full w-full object-cover object-center"
                    />

                  </div>
                ))}

              </div>
            ))}

          </div>

          {/* FLECHA IZQUIERDA */}
          <button
            onClick={slideAnterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-3xl text-[#AD4E4F] shadow-md transition hover:bg-white"
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          {/* FLECHA DERECHA */}
          <button
            onClick={siguienteSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-3xl text-[#AD4E4F] shadow-md transition hover:bg-white"
            aria-label="Siguiente imagen"
          >
            ›
          </button>

        </div>

        {/* INDICADORES */}
        <div className="mt-6 flex justify-center gap-3">

          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setSlideActual(index)}
              className={`h-3 w-3 rounded-full transition ${
                slideActual === index
                  ? "bg-[#AD4E4F]"
                  : "bg-white"
              }`}
              aria-label={`Ir al grupo ${index + 1}`}
            />
          ))}

        </div>

        {/* PROMOCIÓN */}
        <div className="mx-auto mt-8 max-w-xl text-center">

          <div className="rounded-full border-2 border-[#AD4E4F] px-6 py-3">

            <p className="text-lg font-bold text-[#AD4E4F] md:text-xl">
              DESCUBRE NUESTRA NUEVA COLECCIÓN
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Estilos pensados para ti
            </p>

          </div>

          <a
            href="#catalogo"
            className="mt-5 inline-block text-sm font-semibold text-[#AD4E4F] hover:underline"
          >
            VER CATÁLOGO
          </a>

        </div>

      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section
        iid="catalogo"
        className="bg-[#efd2c7] px-8 py-16 md:px-10"
        
      >

        <div className="mb-10 flex items-center justify-between">

          <h2 className="text-3xl font-bold text-[#AD4E4F]">
            Nuevos ingresos
          </h2>

        </div>

        <div className="grid gap-10 md:grid-cols-3">

          {/* PRODUCTO 1 */}
          <div className="text-center">

            <div className="mb-5 flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-4">

              <img
                src="/DRESS1.jpg"
                alt="Vestido verde con rayas"
                className="max-h-full max-w-full object-contain"
              />

            </div>

            <h3 className="text-xl font-semibold">
              Vestido Verde con rayas
            </h3>

            <p className="mt-2 text-lg">
              $20.00
            </p>

            <p className="mt-2 text-gray-500">
              Tallas: XS, S, M, L
            </p>

            <button className="mt-5 rounded-full bg-[#AD4E4F] px-6 py-3 text-white transition hover:opacity-90">
              Agregar al carrito
            </button>

          </div>

          {/* PRODUCTO 2 */}
          <div className="text-center">

            <div className="mb-5 flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-4">

              <img
                src="/DRESS2.jpg"
                alt="Vestido Rosa Pastel"
                className="max-h-full max-w-full object-contain"
              />

            </div>

            <h3 className="text-xl font-semibold">
              Vestido Rosa Pastel
            </h3>

            <p className="mt-2 text-lg">
              $18.00
            </p>

            <p className="mt-2 text-gray-500">
              Tallas: XS, S, M, L
            </p>

            <button className="mt-5 rounded-full bg-[#AD4E4F] px-6 py-3 text-white transition hover:opacity-90">
              Agregar al carrito
            </button>

          </div>

          {/* PRODUCTO 3 */}
          <div className="text-center">

            <div className="mb-5 flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-white p-4">

              <img
                src="/DRESS3.jpg"
                alt="Conjunto Amarillo"
                className="max-h-full max-w-full object-contain"
              />

            </div>

            <h3 className="text-xl font-semibold">
              Conjunto Amarillo
            </h3>

            <p className="mt-2 text-lg">
              $20.00
            </p>

            <p className="mt-2 text-gray-500">
              Tallas: XS, S, M, L, XL
            </p>

            <button className="mt-5 rounded-full bg-[#AD4E4F] px-6 py-3 text-white transition hover:opacity-90">
              Agregar al carrito
            </button>

          </div>

        </div>

      </section>


      {/* SOBRE NOSOTROS */}
<section
  id="nosotros"
  className="bg-[#efd2c7] px-8 py-16 md:px-20"
>
  <div className="mx-auto max-w-6xl">

    {/* TÍTULO */}
    <h2 className="mb-8 text-center text-3xl font-bold text-[#AD4E4F]">
      Sobre Polet Plus
    </h2>

    {/* DESCRIPCIÓN */}
    <div className="mx-auto max-w-5xl text-center text-gray-700">

      <p className="leading-7">
        <span className="font-bold text-[#AD4E4F]">
          Polet Plus
        </span>{" "}
        es una tienda de ropa en línea creada con el objetivo de ofrecer
        prendas modernas y accesibles de una forma práctica. Nuestro catálogo
        se comparte actualmente por medios digitales, facilitando a nuestros
        clientes conocer los productos, tallas y precios disponibles.
      </p>

      <p className="mt-5 leading-7">
        Buscamos brindar una experiencia de compra sencilla, cercana y
        confiable, ofreciendo envíos a diferentes departamentos de El Salvador.
      </p>

    </div>

    {/* MISIÓN Y COMPROMISO */}
    <div className="mt-14 grid gap-10 md:grid-cols-2">

      {/* MISIÓN */}
      <div className="rounded-2xl bg-white/40 p-8 text-center">

        <h3 className="text-2xl font-bold text-[#AD4E4F]">
          Nuestra Misión
        </h3>

        <p className="mt-4 leading-7 text-gray-700">
          Ofrecer prendas de calidad y facilitar el proceso de compra en línea,
          brindando a nuestros clientes una experiencia sencilla y accesible.
        </p>

      </div>

      {/* COMPROMISO */}
      <div className="rounded-2xl bg-white/40 p-8 text-center">

        <h3 className="text-2xl font-bold text-[#AD4E4F]">
          Nuestro Compromiso
        </h3>

        <p className="mt-4 leading-7 text-gray-700">
          Brindar atención personalizada y una experiencia de compra cómoda,
          segura y confiable para cada uno de nuestros clientes.
        </p>

      </div>

    </div>

  </div>
</section>

      {/* FOOTER */}
      <footer
        id="contacto"
        className="bg-[#AD4E4F] px-10 py-10 text-white"
      >

        <div className="grid gap-8 md:grid-cols-3">

          <div>

            <h3 className="text-xl font-bold">
              POLET PLUS
            </h3>

            <p className="mt-3">
              Moda para todos.
            </p>

          </div>

          <div>

            <h3 className="font-semibold">
              Enlaces
            </h3>

            <div className="mt-3 flex flex-col gap-2">

              <a
                href="#"
                className="hover:underline"
              >
                Inicio
              </a>

              <a
                href="#catalogo"
                className="hover:underline"
              >
                Catálogo
              </a>

              <a
                href="#nosotros"
                className="hover:underline"
              >
                Sobre nosotros
              </a>

              <a
                href="#contacto"
                className="hover:underline"
              >
                Contacto
              </a>

            </div>

          </div>

          <div>

            <h3 className="font-semibold">
              Contacto
            </h3>

            <p className="mt-3">
              WhatsApp: 77543266
            </p>

            <p className="mt-1">
              Facebook: Polet Plus
            </p>

            <p className="mt-1">
              El Salvador
            </p>

          </div>

        </div>

        <div className="mt-10 border-t border-white/30 pt-5 text-center text-sm">
          © 2026 Polet Plus. Todos los derechos reservados.
        </div>

      </footer>

    </main>
  );
}