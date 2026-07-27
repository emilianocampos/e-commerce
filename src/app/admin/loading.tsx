export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Cargando panel de administrador...</p>
      </div>
    </div>
  );
}
