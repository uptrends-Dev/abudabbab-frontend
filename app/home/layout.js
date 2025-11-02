import "./globals.css";
import { Providers } from "../../components/Provides/reduxProvider";
import WebHeader from '../../components/website/header/WebHeader'
import Footer from '../../components/website/footer/Footer'
export default function RootLayout({ children }) {
  return (
    <div lang="en">
      <div>
        <Providers>
          <WebHeader/>
          {children}
          <Footer/>
        </Providers>
      </div>
    </div>
  );
}
