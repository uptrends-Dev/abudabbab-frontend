"use client";
import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

export default function ContactUs() {
  return (
    <section className="relative py-16">
      {/* soft bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_65%_at_20%_-10%,rgba(251,146,60,0.08),transparent_60%)]"
      />

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-2">
          {/* LEFT: info */}
          <div>
            <p className="text-sm font-semibold tracking-wider text-orange-600">
              CONTACT US
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Get In Touch <span className="text-gray-400">With Us</span>
            </h2>

            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow ring-4 ring-orange-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-700">
                    ADDRESS :
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    Abu Dabbab Beach Marsa Alam-Quser Road, 30km South Marsa
                    Alam Airport
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow ring-4 ring-orange-100">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-700">
                    CUSTOMER SERVICE :
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    +20 120 658 41111 , +20 120 658 4555
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow ring-4 ring-orange-100">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-700">
                    Email :
                  </p>
                  <p className="mt-1 text-sm text-gray-700">Exemple@Info.Com</p>
                </div>
              </div>

              <div className="pt-4">
                <div className="h-px w-full bg-gray-200" />
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
                  <span className="font-semibold tracking-wide">
                    FOLLOW US :
                  </span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <a
                      href="https://www.facebook.com/abudabbabbeach"
                      target="_blanck"
                    >
                      {" "}
                      <Facebook className="h-4 w-4 hover:text-gray-900" />
                    </a>
                    <a
                      href="https://www.instagram.com/abudabbabbeach/ "
                      target="_blanck"
                    >
                      <Instagram className="h-4 w-4 hover:text-gray-900" />
                    </a>
                    <a
                      href="https://www.tripadvisor.com/Attraction_Review-g311425-d6834178-Reviews-Abu_Dabbab_Beach-Marsa_Alam_Red_Sea_and_Sinai.html"
                      target="_blanck"
                    >
                      <img
                        src={"/tripadvisor.png"}
                        className="h-4 w-4 hover:text-gray-900 text-gray-500"
                      />
                    </a>
                    <a
                      href="https://www.youtube.com/@AbuDabbab"
                      target="_blanck"
                    >
                      {" "}
                      <Youtube className="h-4 w-4 hover:text-gray-900" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: form */}
          <form onSubmit={(e) => e.preventDefault()} className="md:pl-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="First Name*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
              <input
                type="text"
                placeholder="Last Name*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
              <input
                type="email"
                placeholder="Your Email*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
              <input
                type="tel"
                placeholder="Your Phone*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
            </div>
            <textarea
              placeholder="Your Message..."
              className="mt-4 h-36 w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
            />
            <button
              type="submit"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
