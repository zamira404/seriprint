export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 text-sm text-[var(--muted)]">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} UNAWATUNA</div>
          <div className="opacity-80">Calma, ordine, stampa perfetta.</div>
        </div>
      </div>
    </footer>
  );
}
