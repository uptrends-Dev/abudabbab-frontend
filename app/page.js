"use client";
import TripsSection from "@/components/website/tripsPage/TripsSection";
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="">
      hellow trips
      <button onClick={() => router.push("/trips")}>go to trips</button>
    </div>
  );
}
