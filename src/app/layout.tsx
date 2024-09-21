import Navbar from "@/components/homePage/Navbar";
// import "./globals.css";
import GoogleTranslate from "@/components/homePage/GoogleTranslate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import Script from "next/script";
// import Footer from "@/components/homePage/Footer";
// import { auth } from "../../auth";
// import { Inter } from "next/font/google";
// import "@fortawesome/fontawesome-svg-core/styles.css";
// import { config } from "@fortawesome/fontawesome-svg-core";
// import { ThemeProvider as NextThemesProvider } from "next-themes";

// config.autoAddCss = false;

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
// });

export const metadata = {
  title: "Sih2024",
  description: "Hello World",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = session?.user.role;
  return (
    <html lang="en">
       <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="lazyOnload" // Set reCAPTCHA ready state when the script is loaded
      />
      <body
      // className={${inter.variable} font-inter antialiased bg-black text-white tracking-tight}
      >
        {/* <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        > */}
        {/* <div */}
        {/* // className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip" */}
        {/* // > */}
        {/* <GoogleTranslate /> */}

        {/* <Navbar /> */}
        {children}
        <ToastContainer />
        <>
            <script
              src="//code.tidio.co/z3kklhq0ur8kvth5ooe9dufkol3etwa9.js"
              async
            ></script>
           
          </>
        {/* <Footer /> */}
        {/* </div> */}
        {/* </NextThemesProvider> */}
      </body>
    </html>
  );
}