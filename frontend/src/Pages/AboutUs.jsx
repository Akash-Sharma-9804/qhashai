import React from "react";
import { Link } from "react-router-dom";
// import ParticlesBackground from "../components/HexagonsBackground"; // adjust path if needed
import HexagonBackground from "../components/helperComponent/HexagonBackground";

const AboutUs = () => {
  return (
    

    <div   className="relative min-h-screen flex items-center justify-center   ">
      {/* Particle Background */}
      <HexagonBackground />

      {/* Content Box */}
      <div className="bg-white bg-opacity-90 flex justify-center items-center rounded-2xl shadow-lg p-8 w-72  sm:w-[576px] mx-auto text-gray-900 z-10">
        <div className="space-y-6">
          <div className="text-xs md:text-lg leading-relaxed">
            <h1 className="font-semibold text-3xl text-indigo-600 mx-auto flex justify-center">
              QhashAi
            </h1>
            <p className="text-center">

            It is the AI innovation division of
            <span className="font-semibold"> QuantumHash Corporation</span>, dedicated to
            developing cutting-edge artificial intelligence models and
            solutions. Our team of <span className="font-semibold"> researchers,scientists and engineers</span> collaborates on a
            wide range of AI technologies, from machine learning and natural
            language processing to generative models and intelligent systems. At
            QhashAi, we’re driven by a mission to build smarter, agentic
            AI that can power the future of technology & humanity.
            </p>
          </div>
         <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4">
  <Link
    to="/homepage"
    className="w-full sm:w-auto text-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-800 transition"
  >
    Home
  </Link>

  <Link
    to="/terms&policies"
    className="w-full sm:w-auto text-center px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
  >
    Terms & Policies
  </Link>

  <a
    href="https://quantumhash.me"
    target="_blank"
    rel="noreferrer"
    className="w-full sm:w-auto text-center px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
  >
    Explore More
  </a>
</div>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
