export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-xl font-semibold">Restaurante no encontrado</h1>
      <p className="text-gray-500">El menú que buscás no existe o ya no está disponible.</p>
    </main>
  );
}
