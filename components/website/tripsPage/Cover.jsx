"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Cover({
  title = "Explore Popular Trips",
  bgImage = "/coverGB.jpg",
}) {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
  };

  const breadcrumbVariants = {
    initial: { opacity: 0, y: 8 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.35 + i * 0.08, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <section
      className="relative w-full h-[220px] md:h-[320px] overflow-hidden"
      aria-label="Sea Trips Hero"
    >
      {/* Background (Ken-Burns) */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        initial={false}
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 18,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }
        }
      />

      {/* Sea-tinted overlay fade */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#1038b9]/10 via-[#1038b9]/20 to-[#1038b9]/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center text-center px-4">
        <div>
          {/* Title rise in */}
          <motion.h1
            className="text-white font-extrabold drop-shadow-md text-2xl md:text-4xl"
            {...fadeUp}
          >
            {title}
          </motion.h1>

          {/* Breadcrumb stagger */}
          <nav className="mt-2 text-white/90 text-xs md:text-sm font-semibold flex items-center justify-center">
            <motion.a
              href="https://www.abudabbab.com/"
              className="hover:underline"
              variants={breadcrumbVariants}
              initial="initial"
              animate="animate"
              custom={0}
            >
              Home
            </motion.a>

            <motion.span
              className="px-2 text-white/60"
              variants={breadcrumbVariants}
              initial="initial"
              animate="animate"
              custom={1}
            >
              /
            </motion.span>

            <motion.span
              className="text-orange"
              variants={breadcrumbVariants}
              initial="initial"
              animate="animate"
              custom={2}
            >
              Trips
            </motion.span>
          </nav>
        </div>
      </div>

      {/* Left doodles: bubbles float */}
      {/* <motion.div
        className="pointer-events-none absolute left-4 md:left-8 bottom-8 z-10 text-white/90"
        animate={
          prefersReducedMotion
            ? undefined
            : { y: [0, -10, 0] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
          <circle cx="12" cy="28" r="6" stroke="white" strokeWidth="2" />
          <circle cx="30" cy="20" r="4" stroke="white" strokeWidth="2" />
          <circle cx="46" cy="30" r="5" stroke="white" strokeWidth="2" />
          <circle cx="60" cy="18" r="3" stroke="white" strokeWidth="2" />
        </svg>
      </motion.div> */}

      {/* Right doodle: wave draws + starfish wobbles */}
      <div className="pointer-events-none absolute right-6 md:right-10 top-10 z-10"></div>

      {/* Bottom angled sea bars slide in */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-4 md:h-6 bg-[#F87B1B]/80"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-4 md:h-6 w-20 md:w-32 bg-[#007DB0] -skew-x-12 origin-bottom-left"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
      />
    </section>
  );
}
