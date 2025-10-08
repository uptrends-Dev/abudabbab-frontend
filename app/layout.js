import "./globals.css";
import ReduxTripsProvider from "@/components/Provides/reduxTripsProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxTripsProvider>
          {children}
        </ReduxTripsProvider>
      </body>
    </html>
  );
}
