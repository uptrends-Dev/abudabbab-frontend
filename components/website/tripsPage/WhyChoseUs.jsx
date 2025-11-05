import React from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Leaf,
  UsersRound,
  Utensils,
  ShowerHead,
  Phone,
} from "lucide-react";


export default function WhyChoseUs() {
  const cards = [
  
    {
      icon: Leaf,
      title: "Eco & Family Friendly",
      kicker: "Clean, eco‑conscious, and comfortable.",
      items: [
        "Eco‑Protected, Family‑Safe Beach — Committed to a better environment.",
        "Support sustainable tourism in a safe, clean, and protected bay.",
      ],
    },
      {
      icon: ShieldCheck,
      title: "Free & Flexible Booking",
      kicker: "Book early to secure your spot.",
      items: [
        // "Free Cancellation — Cancel up to 24 hours before your visit.",
        "All Facilities Included — Restrooms, showers, shaded seating, and changing areas.",
        "Buffet Access & Dining Options — Enjoy convenient on-site dining.",
      ],
    },
    {
      icon: UsersRound,
      title: "Residents & Group Offers",
      kicker: "Exclusive deals for locals and groups.",
      items: [
        "Special offers for nationals, residents, and group travel.",
        <span key="contact">
          For details,{" "}
          <a href="https://www.abudabbab.com/contact-us" className="underline underline-offset-4">
            Contact us
          </a>{" "}
          or see our{" "}
          <a href="https://www.abudabbab.com/terms-conditions" className="underline underline-offset-4">
            Terms of Service
          </a>
          .
        </span>,
      ],
    },
  ];

  return (
    <section className="relative py-16">
      {/* soft background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-orange/5"
      />

      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl text-orange">
          Why Book Online?
        </h2>
        <p className="mx-auto mt-2 max-w-3xl text-center text-sm text-blue">
          Daily spots are limited for safety and nature preservation. Booking
          ahead guarantees entry and helps us keep you informed about sea
          conditions or schedule changes.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card, idx) => (
            <div key={idx} className="relative">
              {/* top badge */}
              <div className="absolute -top-6 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-blue text-white shadow ring-4 ring-blue-50">
                <card.icon className="h-6 w-6" aria-hidden />
              </div>

              {/* card body */}
              <div className="rounded-2xl border bg-white p-6 pt-10 text-center shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">
                  {card.title}
                </h3>
                {card.kicker && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue">
                    {card.kicker}
                  </p>
                )}

                <ul className="mt-5 space-y-3 text-left text-sm text-gray-700">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-none"
                        aria-hidden
                      />
                      <div className="leading-relaxed">{item}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
}
