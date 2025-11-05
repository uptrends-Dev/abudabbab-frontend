import TripsSection from "../../../components/website/tripsPage/TripsSection";
import Cover from "../../../components/website/tripsPage/Cover";
import React from "react";
import WhyChoseUs from "../../../components/website/tripsPage/WhyChoseUs";
import Tripbanner from "../../../components/website/tripsPage/Tripbanner";
import ContactUs from "../../../components/website/tripsPage/ContactUs";
export default function page() {
  return (
    <div>
      <Cover title="Explore Popular Trips" bgImage="/coverGB.jpg" />
      <TripsSection />
      <Tripbanner />
      <WhyChoseUs />
      <ContactUs />
    </div>
  );
}
