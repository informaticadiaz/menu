import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold">Fuego</h1>
        <p className="max-w-md text-lg text-gray-600">
          El menú digital para restaurantes pequeños. Creá tu menú online en minutos, sin
          complicaciones.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/signup" className="rounded bg-black px-5 py-3 text-white">
          Crear mi menú
        </Link>
        <Link href="/admin" className="rounded border px-5 py-3">
          Ya tengo cuenta
        </Link>
      </div>
    </main>
  );
}
