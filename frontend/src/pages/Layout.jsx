import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
const Layout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-100 to-indigo-200 flex flex-col">
      <div className="hidden sm:block absolute top-10 -left-10 w-40 h-40 bg-pink-300 rounded-full opacity-50 animate-blob"></div>
      <div className="hidden sm:block absolute top-1/2 -right-10 w-32 h-32 bg-teal-300 rounded-full opacity-50 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute bottom-10 left-20 w-24 h-24 bg-purple-300 rounded-full opacity-50 animate-blob animation-delay-4000"></div>
      <ScrollToTop />
      <Header />
      <main className="pt-24 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;