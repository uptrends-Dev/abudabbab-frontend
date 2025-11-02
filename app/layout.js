import "./globals.css";
import { Providers } from "@/components/Provides/reduxProvider";
import WebHeader from "../components/website/header/WebHeader";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
