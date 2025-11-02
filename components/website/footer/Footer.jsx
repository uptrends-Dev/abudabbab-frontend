import React from "react";
import { Facebook, Instagram, Youtube, Twitter, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#3F5E9A] text-white/90">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand + about + socials */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              {/* Logo placeholder */}
             <img src="/AbuDabbabWhiteLogo.svg" className="w-[150px]" alt="" />
            </div>
            <p className="mt-4 max-w-md text-sm/6 text-white/80">
              Discover the beauty of Abu Dabbab. Explore, relax, and reconnect with nature on one of the most
              stunning beaches in the Red Sea.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a aria-label="Instagram"  href="https://www.instagram.com/abudabbabbeach/" target="_blanck" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                <Instagram className="h-4 w-4" />
              </a>
              <a aria-label="Facebook"  href="https://www.facebook.com/abudabbabbeach" target="_blanck" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                <Facebook className="h-4 w-4" />
              </a>
              <a aria-label="Twitter"  href="https://www.tripadvisor.com/Attraction_Review-g311425-d6834178-Reviews-Abu_Dabbab_Beach-Marsa_Alam_Red_Sea_and_Sinai.html" target="_blanck" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                 <img
                        src={"/tripadvisor2.png"}
                        className="h-4 w-4 hover:text-gray-900 text-gray-500"
                      />
              </a>
              <a aria-label="YouTube"  href="https://www.youtube.com/@AbuDabbab" target="_blanck" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><a className="hover:text-white" href="https://www.abudabbab.com/beach">Beach</a></li>
              <li><a className="hover:text-white" href="https://www.abudabbab.com/house-reef">Sea Life</a></li>
              <li><a className="hover:text-white" href="https://www.abudabbab.com/beach-bar-restaurant">Chill Out</a></li>
              <li><a className="hover:text-white" href="https://www.abudabbab.com/activities">Activities</a></li>
            </ul>
          </div>

          {/* Booking */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">Booking</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><a className="hover:text-white" href="/home/trip">Beach Pass</a></li>
              <li><a className="hover:text-white" href="https://www.abudabbab.com/faq">FAQs</a></li>
              <li><a className="hover:text-white" href="https://www.abudabbab.com/contact-us">Contact</a></li>
            </ul>

            <h4 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-white">More</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><a className="hover:text-white" href="#">Stories</a></li>
              <li><a className="hover:text-white" href="#">Media</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px w-full bg-white/20" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center gap-4 text-xs text-white/70 md:flex-row md:justify-between">
          <div className="order-2 md:order-1">
            © {year} | Abu Dabbab Beach — All Rights Reserved
          </div>

          <div className="order-3 flex items-center gap-6 md:order-2">
            <a href="https://www.abudabbab.com/terms-conditions" className="hover:text-white">Terms of Service</a>
            <a href="https://www.abudabbab.com/privacy-policy" className="hover:text-white">Privacy Policy</a>
          </div>

          <div className="order-1 flex items-center gap-3 md:order-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Payment</span>
            <span className="rounded bg-white/10 px-2 py-0.5">VISA</span>
            <span className="rounded bg-white/10 px-2 py-0.5">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
