import Analytics from "@/analysers/Analytics";
import SettingApplier from "@/components/appliers/SettingApplier";
import ToastApplier from "@/components/appliers/ToastApplier";
import { LoginModal, RegisterModal } from "@/components/auth/AuthModal";
import { Login } from "@/components/auth/components/Login";
import { Register } from "@/components/auth/components/Register";
import Providers from "@/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shothik AI",
  description: "Shothik AI is a platform for AI-powered tools and services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-hydration theme script to avoid light→dark flash on reload */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try {
                var raw = localStorage.getItem('settings');
                var s = raw ? JSON.parse(raw) : null;
                var theme = s && s.theme ? s.theme : 'system';
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var mode = theme === 'dark' ? 'dark' : (theme === 'light' ? 'light' : (prefersDark ? 'dark' : 'light'));
                var root = document.documentElement;
                if (root.classList) {
                  root.classList.remove('light','dark');
                  root.classList.add(mode);
                } else {
                  root.setAttribute('class', mode);
                }
                var dir = s && s.direction ? s.direction : 'ltr';
                root.setAttribute('dir', dir);
                var lang = s && s.language ? s.language : 'en';
                root.setAttribute('lang', lang);
              } catch (e) {}
            })();
          `,
          }}
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="503cfbe2-6b94-4fa0-8259-3353fa792769"
        ></script>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a19fecea-d6b0-4093-9074-26531c827bfe"
        ></script>
      </head>
      <body
        className={`${manrope.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=GTM-PPRFW7NP`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <>
          <Providers>
            {/* Appliers */}
            <SettingApplier />
            <ToastApplier />

            {/* login modal  */}
            <LoginModal>
              <Login />
            </LoginModal>
            <RegisterModal>
              <Register />
            </RegisterModal>

            <div>{children}</div>
          </Providers>
        </>
        <Analytics />
      </body>
    </html>
  );
}
