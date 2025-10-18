"use client";

import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import React, { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { getallTrips, posttrip, updatetrip } from "@/lib/apis/api";
import Image from "next/image";
import { TRIP_API_ADMIN, TRIPS_URL } from "@/paths";

/* ---------- Page ---------- */
export default function AddTripPageRHF() {
  const [trips, setTrips] = useState([]);
  const { id } = useParams();
  const isEdit = Boolean(id);
  const router = useRouter();
  const [banner, setBanner] = useState(null);
  const mounted = useRef(true);

  const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting }, setError, clearErrors } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      images: [{ url: "" }],
      features: [{ title: "", subtitle: "" }],
      tripTime: { from: "", to: "" },
      prices: {
        adult: { egp: "", euro: "" },
        child: { egp: "", euro: "" },
      },
      isActive: true,
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage, move: moveImage } = useFieldArray({ control, name: "images" });
  const { fields: featureFields, append: appendFeature, remove: removeFeature, move: moveFeature } = useFieldArray({ control, name: "features" });

  const imagesWatch = watch("images");

  async function getTripsOnce() {
    try {
      const trip = await getallTrips();
      if (mounted.current) setTrips(trip);
    } catch (error) {
      setError("error");
    }
  }

  useEffect(() => {
    mounted.current = true;
    getTripsOnce();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const found = trips.find((t) => t._id === id || t.id === id);
    if (found) {
      reset(toFormDefaults(found));
    }
  }, [isEdit, id, trips, reset]);

  const onSubmit = async (data) => {
    setBanner(null);

    const images = (data.images || [])
      .map((i) => (i?.url || "").trim())
      .filter(Boolean);

    if (images.length < 1) {
      setError("images", { type: "manual", message: "At least one image is required" });
      return;
    }
    if (images.length > 5) {
      setError("images", { type: "manual", message: "Maximum 5 images allowed" });
      return;
    }
    clearErrors("images");

    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      images,
      features: (data.features || []).map((f) => ({
        title: (f.title || "").trim(),
        subtitle: (f.subtitle || "").trim(),
      })),
      tripTime: {
        from: data.tripTime.from.trim(),
        to: data.tripTime.to.trim(),
      },
      prices: {
        adult: {
          egp: Number(data.prices.adult.egp),
          euro: Number(data.prices.adult.euro),
        },
        child: {
          egp: Number(data.prices.child.egp),
          euro: Number(data.prices.child.euro),
        },
      },
      isActive: Boolean(data.isActive),
    };

    try {
      if (isEdit) {
        await updatetrip({ url: TRIP_API_ADMIN, id, tripData: payload });
        setBanner({ type: "success", text: "Trip updated ✅" });
      } else {
        await posttrip({ url: TRIP_API_ADMIN, tripData: payload });
        setBanner({ type: "success", text: "Trip created ✅" });
      }
      reset();
      router.push("/dashboard/controlTrips");
    } catch (err) {
      setBanner({ type: "error", text: err?.message || "Request failed" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{isEdit ? "Update Trip" : "Add New Trip"}</h1>
          <div className="flex gap-2">
            <button type="button" onClick={() => reset()} className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm">
              Reset
            </button>
            <Link href="/dashboard/controlTrips">
              <button type="button" className="cursor-pointer px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm">
                Back To Trips
              </button>
            </Link>
          </div>
        </div>

        {banner && (
          <div
            className={[
              "mb-4 rounded-xl border px-4 py-3 text-sm",
              banner.type === "success" ? "border-emerald-700 bg-emerald-900/30 text-emerald-200" : "border-rose-700 bg-rose-900/30 text-rose-200",
            ].join(" ")}
          >
            {banner.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basics */}
          <Section title="Basics">
            <Field label="Trip name" error={errors?.name?.message}>
              <input
                className={inputCls(errors?.name)}
                placeholder="Alexandria Day Trip"
                {...register("name", { required: "Required", minLength: { value: 2, message: "Too short" } })}
              />
            </Field>

            <Field label="Description" error={errors?.description?.message}>
              <textarea
                className={inputCls(errors?.description, " min-h-[120px]")}
                placeholder="Overview, highlights, what to expect…"
                {...register("description", { required: "Required", minLength: { value: 10, message: "Please add more details" } })}
              />
            </Field>
          </Section>

          {/* Images */}
          <Section title="Images (URLs)">
            <div className="space-y-3">
              {imageFields.map((row, i) => {
                const url = imagesWatch?.[i]?.url || "";
                return (
                  <div key={row.id} className="flex items-center gap-2">
                    <div className="h-12 w-16 overflow-hidden rounded border border-zinc-800 bg-zinc-900 grid place-items-center shrink-0">
                      {url ? (
                        <Image
                          src={url}
                          height={500}
                          width={500}
                          alt={`img-${i}`}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.opacity = "0.25")}
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500">preview</span>
                      )}
                    </div>

                    <Controller
                      control={control}
                      name={`images.${i}.url`}
                      rules={{ required: "URL required" }}
                      render={({ field: { value, onChange, onBlur, ref } }) => (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            ref={ref}
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                            className={inputCls(errors?.images?.[i]?.url, "flex-1 min-w-0")}
                            placeholder="Image URL"
                          />
                          <CldUploadWidget
                            uploadPreset="image_abodbab"
                            options={{
                              maxFileSize: 2000000,
                              sources: ["local", "camera"],
                              styles: {
                                palette: {
                                  window: "#07253E",
                                  windowBorder: "#90A0B3",
                                  tabIcon: "#0078FF",
                                  menuIcons: "#5A616A",
                                  textDark: "#000000",
                                  textLight: "#FFFFFF",
                                  link: "#0078FF",
                                  action: "#FF620C",
                                  inactiveTabIcon: "#245DA7",
                                  error: "#F44235",
                                  inProgress: "#0078FF",
                                  complete: "#20B832",
                                  sourceBg: "#000000",
                                },
                                fonts: { default: { active: true } },
                              },
                            }}
                            onSuccess={(result) => {
                              const info = result?.info;
                              const url = info && typeof info === "object" && (info.secure_url || info.url);
                              if (url) onChange(url);
                            }}
                          >
                            {({ open }) => (
                              <button type="button" onClick={() => open()} className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm cursor-pointer">
                                Upload
                              </button>
                            )}
                          </CldUploadWidget>
                        </div>
                      )}
                    />

                    <div className="flex gap-1">
                      <button type="button" title="Move up" onClick={() => moveImage(i, i - 1)} className="px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs">↑</button>
                      <button type="button" title="Move down" onClick={() => moveImage(i, i + 1)} className="px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs">↓</button>
                      <button type="button" onClick={() => removeImage(i)} className="px-2 py-1 rounded-lg border border-rose-700 bg-rose-900/30 hover:bg-rose-900/40 text-xs">Remove</button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between">
                <p className="text-xs text-zinc-500">First image will be used as the cover. (Max 5)</p>
                <button
                  type="button"
                  onClick={() => {
                    if (imageFields.length < 5) appendImage({ url: "" });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm"
                >
                  + Add image
                </button>
              </div>

              {typeof errors?.images?.message === "string" && (
                <p className="text-rose-300 text-xs">{errors.images.message}</p>
              )}
            </div>
          </Section>

          {/* Features */}
          <Section title="Features">
            <div className="space-y-3">
              {featureFields.map((row, i) => (
                <div key={row.id} className="grid sm:grid-cols-[220px_1fr_auto] gap-2">
                  <input
                    className={inputCls(errors?.features?.[i]?.title)}
                    placeholder="Feature title"
                    {...register(`features.${i}.title`, { required: "Required", minLength: { value: 2, message: "Too short" } })}
                  />
                  <input
                    className={inputCls(errors?.features?.[i]?.subtitle)}
                    placeholder="Short explanation"
                    {...register(`features.${i}.subtitle`, { required: "Required", minLength: { value: 2, message: "Too short" } })}
                  />
                  <div className="flex gap-1">
                    <button type="button" title="Move up" onClick={() => moveFeature(i, i - 1)} className="px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs">↑</button>
                    <button type="button" title="Move down" onClick={() => moveFeature(i, i + 1)} className="px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs">↓</button>
                    <button type="button" onClick={() => removeFeature(i)} className="px-2 py-1 rounded-lg border border-rose-700 bg-rose-900/30 hover:bg-rose-900/40 text-xs">Remove</button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button type="button" onClick={() => appendFeature({ title: "", subtitle: "" })} className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm">
                  + Add feature
                </button>
              </div>
            </div>
          </Section>

          {/* Time & Prices */}
          <Section title="Time & Prices">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="From" error={errors?.tripTime?.from?.message}>
                <input className={inputCls(errors?.tripTime?.from)} placeholder="07:30 AM" {...register("tripTime.from", { required: "Required" })} />
              </Field>
              <Field label="To" error={errors?.tripTime?.to?.message}>
                <input className={inputCls(errors?.tripTime?.to)} placeholder="06:00 PM" {...register("tripTime.to", { required: "Required" })} />
              </Field>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <PriceGroup
                legend="Adult"
                euroReg={register("prices.adult.euro", { required: "Required", min: { value: 0, message: ">= 0" }, valueAsNumber: true })}
                euroError={errors?.prices?.adult?.euro?.message}
              />
              <PriceGroup
                legend="Child"
                euroReg={register("prices.child.euro", { required: "Required", min: { value: 0, message: ">= 0" }, valueAsNumber: true })}
                euroError={errors?.prices?.child?.euro?.message}
              />
            </div>

            <label className="mt-4 inline-flex items-center gap-2 select-none">
              <input type="checkbox" className="h-4 w-4 accent-emerald-500" {...register("isActive")} />
              <span className="text-sm text-zinc-300">Mark trip as active</span>
            </label>
          </Section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl border border-emerald-700 bg-emerald-900/30 hover:bg-emerald-900/40 text-sm font-medium disabled:opacity-60">
              {isEdit ? (isSubmitting ? "Updating…" : "Update trip") : isSubmitting ? "Saving…" : "Create trip"}
            </button>
            <button type="button" onClick={() => reset()} className="px-5 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-sm">
              Clear
            </button>
          </div>
        </form>
      </main>

      <div className="pointer-events-none fixed inset-4 rounded-3xl border border-zinc-800/80" />
    </div>
  );
}

/* ---------- helpers ---------- */
function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <h2 className="text-sm font-semibold mb-3 tracking-wide text-zinc-200">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="mb-1">
        <span className="text-xs uppercase tracking-wide text-zinc-400">{label}</span>
      </div>
      {children}
      {error && <p className="mt-1 text-rose-300 text-xs">{error}</p>}
    </label>
  );
}
function PriceGroup({ legend, egpReg, euroReg, egpError, euroError }) {
  return (
    <fieldset className="rounded-xl border border-zinc-800 p-3">
      <legend className="px-1 text-xs text-zinc-400">{legend} price</legend>
      <div className="grid grid-cols-2 gap-2">
        {/* EGP input intentionally commented as in your original */}
        {/* <div>
          <input className={inputCls(egpError)} placeholder="EGP" {...egpReg} />
          {egpError && <p className="mt-1 text-rose-300 text-xs">{egpError}</p>}
        </div> */}
        <div>
          <input className={inputCls(euroError)} placeholder="EUR" {...euroReg} />
          {euroError && <p className="mt-1 text-rose-300 text-xs">{euroError}</p>}
        </div>
      </div>
    </fieldset>
  );
}
function inputCls(hasError, extra = "") {
  return [
    "w-full rounded-lg border bg-zinc-950/60 px-3 py-2 text-sm outline-none transition",
    hasError ? "border-rose-700 focus:ring-2 focus:ring-rose-700/50" : "border-zinc-800 focus:ring-2 focus:ring-zinc-700/50",
    extra,
  ].join(" ");
}
function toFormDefaults(trip) {
  return {
    name: trip?.name ?? "",
    description: trip?.description ?? "",
    images: (trip?.images ?? [""]).map((u) => ({ url: u || "" })),
    features:
      Array.isArray(trip?.features) && trip.features.length
        ? trip.features.map((f) => ({
            title: f?.title || "",
            subtitle: f?.subtitle || "",
          }))
        : [{ title: "", subtitle: "" }],
    tripTime: {
      from: trip?.tripTime?.from ?? "",
      to: trip?.tripTime?.to ?? "",
    },
    prices: {
      adult: {
        egp: trip?.prices?.adult?.egp ?? "",
        euro: trip?.prices?.adult?.euro ?? "",
      },
      child: {
        egp: trip?.prices?.child?.egp ?? "",
        euro: trip?.prices?.child?.euro ?? "",
      },
    },
    isActive: Boolean(trip?.isActive),
  };
}