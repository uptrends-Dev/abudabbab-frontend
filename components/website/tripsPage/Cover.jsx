

export default function Cover({
  title = "Explore Popular Trips",
  bgImage = "/images/sea-hero.jpg",
}) {
  return (
    <section
      className="relative w-full h-[220px] md:h-[320px] overflow-hidden"
      aria-label="Sea Trips Hero"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Sea-tinted overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F87B1B]/10 via-[#F87B1B]/40 to-[#F87B1B]/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center text-center px-4">
        <div>
          <h1 className="text-white font-extrabold drop-shadow-md text-2xl md:text-4xl">
            {title}
          </h1>

          {/* Breadcrumb */}
          <nav className="mt-2 text-white/90 text-xs md:text-sm font-semibold">
            <a href="/" className="hover:underline">Home</a>
            <span className="px-2 text-white/60">//</span>
            <span className="text-[#000000]">Trips</span>
          </nav>
        </div>
      </div>

      {/* Left doodles: bubbles */}
      <div className="pointer-events-none absolute left-4 md:left-8 bottom-8 z-10 text-white/90">
        <svg width="72" height="48" viewBox="0 0 72 48" fill="none">
          <circle cx="12" cy="28" r="6" stroke="white" strokeWidth="2" />
          <circle cx="30" cy="20" r="4" stroke="white" strokeWidth="2" />
          <circle cx="46" cy="30" r="5" stroke="white" strokeWidth="2" />
          <circle cx="60" cy="18" r="3" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Right doodle: wave + starfish */}
      <div className="pointer-events-none absolute right-6 md:right-10 top-10 z-10">
        <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
          {/* wave */}
          <path d="M2 30c8-8 16 8 24 0s16 8 24 0" stroke="white" strokeWidth="2" fill="none" />
          {/* starfish */}
          <path
            d="M40 8l3 6 7 1-5 4 2 6-6-3-6 3 2-6-5-4 7-1 3-6z"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Bottom angled sea bar */}
      <div className="absolute bottom-0 left-0 w-full h-4 md:h-6 bg-[#F87B1B]/80" />
      <div className="absolute bottom-0 right-0 h-4 md:h-6 w-20 md:w-32 bg-[#007DB0] -skew-x-12 origin-bottom-left" />
    </section>
  );
}
