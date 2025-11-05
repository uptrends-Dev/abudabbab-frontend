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
import { motion, useReducedMotion } from "framer-motion";

export default function ContactUs() {
  const prefersReduced = useReducedMotion();

  // Variants
  const sectionV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } };

  const leftColV = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const blockV = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 160, damping: 18 },
        },
      };

  const badgeV = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.7, rotate: -6 },
        show: {
          opacity: 1,
          scale: 1,
          rotate: 0,
          transition: { type: "spring", stiffness: 220, damping: 16 },
        },
      };

  const dividerV = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { scaleX: 0, opacity: 0.6, originX: 0 },
        show: {
          scaleX: 1,
          opacity: 1,
          transition: { duration: 0.45, ease: "easeOut" },
        },
      };

  const formV = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: 24 },
        show: {
          opacity: 1,
          x: 0,
          transition: { type: "spring", stiffness: 170, damping: 20, delay: 0.15 },
        },
      };

  return (
    <motion.section
      className="relative py-16 overflow-hidden"
      variants={sectionV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* soft bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_65%_at_20%_-10%,rgba(251,146,60,0.08),transparent_60%)]"
      />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 md:grid-cols-2">
          {/* LEFT: info */}
          <motion.div variants={leftColV} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.p
              variants={blockV}
              className="text-sm font-semibold tracking-wider text-orange-600"
            >
              CONTACT US
            </motion.p>

            <motion.h2
              variants={blockV}
              className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
            >
              Get In Touch <span className="text-gray-400">With Us</span>
            </motion.h2>

            <div className="mt-6 space-y-6">
              {/* Address */}
              <motion.div variants={blockV} className="flex items-start gap-4">
                <motion.div
                  variants={badgeV}
                  className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow ring-4 ring-orange-100"
                >
                  <MapPin className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-700">ADDRESS :</p>
                  <p className="mt-1 text-sm text-gray-700">
                    Abu Dabbab Beach Marsa Alam-Quser Road, 30km South Marsa Alam Airport
                  </p>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div variants={blockV} className="flex items-start gap-4">
                <motion.div
                  variants={badgeV}
                  className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow ring-4 ring-orange-100"
                >
                  <Phone className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-700">CUSTOMER SERVICE :</p>
                  <p className="mt-1 text-sm text-gray-700">+20 120 658 41111 , +20 120 658 4555</p>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={blockV} className="flex items-start gap-4">
                <motion.div
                  variants={badgeV}
                  className="grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow ring-4 ring-orange-100"
                >
                  <Mail className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-700">Email :</p>
                  <p className="mt-1 text-sm text-gray-700">Exemple@Info.Com</p>
                </div>
              </motion.div>

              {/* Divider + Socials */}
              <motion.div variants={blockV} className="pt-4">
                <motion.div
                  variants={dividerV}
                  className="h-px w-full bg-gray-200"
                />
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
                  <span className="font-semibold tracking-wide">FOLLOW US :</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <a
                      href="https://www.facebook.com/abudabbabbeach"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:-translate-y-0.5"
                    >
                      <Facebook className="h-4 w-4 hover:text-gray-900" />
                    </a>
                    <a
                      href="https://www.instagram.com/abudabbabbeach/"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:-translate-y-0.5"
                    >
                      <Instagram className="h-4 w-4 hover:text-gray-900" />
                    </a>
                    <a
                      href="https://www.tripadvisor.com/Attraction_Review-g311425-d6834178-Reviews-Abu_Dabbab_Beach-Marsa_Alam_Red_Sea_and_Sinai.html"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:-translate-y-0.5"
                    >
                      <img
                        src={"/tripadvisor.png"}
                        className="h-4 w-4"
                        alt="Tripadvisor"
                      />
                    </a>
                    <a
                      href="https://www.youtube.com/@AbuDabbab"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:-translate-y-0.5"
                    >
                      <Youtube className="h-4 w-4 hover:text-gray-900" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: form */}
          <motion.form
            onSubmit={(e) => e.preventDefault()}
            className="md:pl-6"
            variants={formV}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <motion.input
                variants={blockV}
                type="text"
                placeholder="First Name*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
              <motion.input
                variants={blockV}
                type="text"
                placeholder="Last Name*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
              <motion.input
                variants={blockV}
                type="email"
                placeholder="Your Email*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
              <motion.input
                variants={blockV}
                type="tel"
                placeholder="Your Phone*"
                className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
              />
            </div>

            <motion.textarea
              variants={blockV}
              placeholder="Your Message..."
              className="mt-4 h-36 w-full resize-none rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-orange-200 placeholder:text-gray-400 focus:bg-white focus:ring-2"
            />

            <motion.button
              variants={blockV}
              type="submit"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
              whileHover={prefersReduced ? {} : { y: -2 }}
              whileTap={prefersReduced ? {} : { scale: 0.98 }}
            >
              Send Message
            </motion.button>
          </motion.form>
        </div>
      </div>
    </motion.section>
  );
}
