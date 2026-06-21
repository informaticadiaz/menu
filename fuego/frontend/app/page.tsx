import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <section className="brand-card w-full max-w-3xl px-6 py-10 text-center sm:px-12 sm:py-16">
        <p className="brand-eyebrow mb-4 tracking-[0.2em]">
          Fuego
        </p>
        <h1 className="brand-title mx-auto max-w-2xl text-4xl sm:text-6xl">
          Tu menú digital listo para compartir por QR
        </h1>
        <p className="brand-copy mx-auto mt-5 max-w-xl text-base leading-7 sm:text-lg">
          Creá una carta clara para tus clientes y administrá platos, precios e imágenes sin
          complicaciones.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/signup" className="btn btn-primary px-6 py-3">
          Crear mi menú
        </Link>
        <Link href="/admin" className="btn btn-secondary px-6 py-3">
          Ya tengo cuenta
        </Link>
        </div>
      </section>
    </main>
  );
}
