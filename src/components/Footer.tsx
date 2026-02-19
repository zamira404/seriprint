export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 text-sm text-[var(--muted)]">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} UNAWATUNA</div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/p/Unawatuna-Palombarese-by-Seriprint-100063817802017/?locale=it_IT"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1877F2] bg-[#1877F2] text-white hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07z"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/unawatuna_shop_seriprint/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-white hover:brightness-110"
              style={{
                background:
                  "radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 8%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z"
                />
              </svg>
            </a>
            <a
              href="https://wa.me/393400938712"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#25D366] bg-[#25D366] text-white hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.7.8-2.8-.2-.3A8.3 8.3 0 1 1 12 20.2Zm4.6-6.2c-.2-.1-1.3-.7-1.5-.8s-.4-.1-.6.1-.7.8-.8.9-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4a.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 2 .8 2.5.9 2.6 1.7 2.7 4.1 3.8c.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1s-.2-.1-.4-.2Z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
