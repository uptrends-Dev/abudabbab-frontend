export async function exportExsl(allBookings) {

  // const plainBookings = allBookings.map((b) => ({
  //   _id: b._id,
  //   user: {
  //     firstName: b.user?.firstName,
  //     phone: b.user?.phone,
  //   },
  //   tripInfo: b.tripInfo ? { name: b.tripInfo.name } : undefined,
  //   transportation: b.transportation,
  //   bookingDate: b.bookingDate,
  //   createdAt: b.createdAt,
  // }));

  try {
    const res = await axios.post(
      "https://abudabbba-backend.vercel.app/api/bookings/export",
      { bookings: allBookings },
      {
        headers: { "Content-Type": "application/json" },
        responseType: "arraybuffer", // ✅ important!
      }
    );

    if (res.status !== 200) {
      throw new Error("Failed to export bookings");
    }

    // res.data is already an ArrayBuffer
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      res.headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] ??
      "bookings.xlsx";
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export error:", error);
  }
}