import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <section className="w-full max-w-3xl rounded-3xl border border-stone-200 bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
          Fuego
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
          Tu menú digital listo para compartir por QR
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
          Creá una carta clara para tus clientes y administrá platos, precios e imágenes sin
          complicaciones.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/signup" className="rounded-full bg-orange-700 px-6 py-3 font-medium text-white shadow-sm hover:bg-orange-800 focus:outline-2 focus:outline-orange-600">
          Crear mi menú
        </Link>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:border-stone-400 hover:bg-stone-50 focus:outline-2 focus:outline-orange-600">
          Ya tengo cuenta
        </Link>
        </div>
      </section>
    </main>
  );
}
