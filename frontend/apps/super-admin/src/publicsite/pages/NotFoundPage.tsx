export default function NotFoundPage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
      <div>
        <p className="text-3xl font-semibold text-secondary mb-2">404</p>
        <p className="text-sm text-gray-500">{message ?? 'Page not found.'}</p>
      </div>
    </div>
  );
}
