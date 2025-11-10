"use client";
import { useRouter } from "next/navigation";
import TripsSection from "../../components/website/tripsPage/TripsSection";
import Cover from "../../components/website/tripsPage/Cover";

export default function Home() {
  const router = useRouter();
  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center py-20">
      {/* <Cover
        title="Explore Popular Trips"
        bgImage="/Artboard.jpg"
      />
      <TripsSection /> */}

      <button 
        className="bg-[#F87B1B] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#e66d0f] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" 
        onClick={() => router.push("/home/trip")}
      >
        Coming Soon
      </button>
    </div>
  );
}
