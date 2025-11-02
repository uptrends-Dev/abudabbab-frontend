"use client";
import { useRouter } from "next/navigation";
import TripsSection from "../../components/website/tripsPage/TripsSection";
import Cover from "../../components/website/tripsPage/Cover";

export default function Home() {
  const router = useRouter();
  return (
    <div className="">
      {/* <Cover
        title="Explore Popular Trips"
        bgImage="/Artboard.jpg"
      />
      <TripsSection /> */}

      <button className="bg-[#F87B1B] text-white p-3 rounded-2xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]" onClick={() => router.push("/home/trip")}>Coming Soon</button>
    </div>
  );
}
