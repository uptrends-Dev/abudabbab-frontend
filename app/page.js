"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="">
      <button className="bg-black text-white p-3 rounded-2xl absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]" onClick={() => router.push("/trips")}>go to trips</button>
    </div>
  );
}
