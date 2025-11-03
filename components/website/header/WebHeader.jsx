'use client'
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  // ---- Links config (كل الروابط هنا) ----
  const links = {
    logo: {
      href: "https://www.abudabbab.com/",
      img: "/AbuDabbabLogo.svg",
      alt: "Abu Dabbab",
    },
    nav: [
      { label: "Beach", href: "https://www.abudabbab.com/beach" },
      { label: "Sea Life", href: "https://www.abudabbab.com/house-reef" },
      { label: "Chill Out", href: "https://www.abudabbab.com/beach-bar-restaurant" },
      { label: "Activities", href: "https://www.abudabbab.com/activities" },
      { label: "Contact", href: "https://www.abudabbab.com/contact-us" },
    ],
    cta: { label: "Book Now", href: "/home/trip" },
  };
  // ---------------------------------------

  return (
    <header className="w-full bg-[#f3f4f6] sticky top-0 z-50 py-2">
      <div className="mx-auto max-w-[1280px] px-3">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between">
          {/* Left: Logo */}
          <a href={links.logo.href} className="flex items-center">
            <img
              src={links.logo.img}
              alt={links.logo.alt}
              className="h-8 w-auto"
            />
          </a>

          {/* Center: Nav (desktop) */}
          <nav className="hidden md:flex items-center justify-center">
            <ul className="flex items-center gap-8 text-[14px]">
              {links.nav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-[#2b57a1] hover:text-[#1f3e73] transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: CTA (desktop) */}
          <div className="hidden md:flex items-center justify-end">
            <a
              href={links.cta.href}
              className="inline-flex items-center rounded-full bg-[#ff7a00] px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[.98] transition"
            >
              {links.cta.label}
            </a>
          </div>

          {/* Mobile: Hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-black/5"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-black transition ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-black transition ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-black transition ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="border-t border-black/5">
            <ul className="flex flex-col py-2">
              {links.nav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block px-2 py-2 text-[15px] text-[#2b57a1] hover:bg.black/5 hover:bg-black/5"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="px-2 py-2">
                <a
                  href={links.cta.href}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#ff7a00] px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[.98] transition"
                  onClick={() => setOpen(false)}
                >
                  {links.cta.label}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
