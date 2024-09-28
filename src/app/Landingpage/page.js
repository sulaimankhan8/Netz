"use client";

import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import LottieAnimation from "../components/Animation.js";

export default function Home() {
  return (

    <main className="bg-neutral-950 h-[500vh] w-full bg-center top-0"
      style={{ backgroundImage: "url('/bg1.png')", backgroundSize: "contain" }}>

      <div className="container ">
        <div className="p-5 mb-20 pb-15 flex w-full ">
          <div className="text-6xl mx-auto font-bold text-white">NETZ</div>
        </div>

        <div className="container flex flex-col lg:flex-row items-center justify-between w-[100vw] h-[25rem] p-14 mx-auto gap-20">

          {/* Left Div */}
          <div className="order-2 lg:order-none rounded-lg max-lg:max-w-[50rem] mx-auto p-5 lg:w-1/2">
            <h1 className="text-4xl text-white font-bold text-wrap text-center p-4">
              Keep Mathing with No Lag!
            </h1>

            <p className="text-xl text-gray-200 text-center m-5 p-5">
              Tired of clunky, slow tools holding back your math progress? Netz delivers lightning-fast problem-solving right at your fingertips. Whether you're crunching numbers on the go or leading a real-time class. No lag, no interruptions — just pure math mastery.
            </p>

            <p className="text-lg text-gray-400 text-center p-5 px-10 m-5">
              Download Netz today and experience smooth, seamless learning like never before!
            </p>

            <button className="px-5 py-3 mx-auto bg-green-500 hover:bg-green-700 rounded-xl mt-4 flex items-center">
              <img src="/download.svg" alt="download" />
              <p className="pl-2 text-white active:text-black">Let&#39;s keep Mathing</p>
            </button>
          </div>

          {/* Right Div */}
          <div className="flex items-center justify-center p-4 rounded-lg order-1 lg:order-1 lg:w-1/2 relative">
            <div className=" w-[90%] h-[310px] lg:w-full lg:h-[410px] bg-gradient-to-r from-[#4c4f5a] to-[#202125] rounded-lg absolute"></div>

            {/* Graph Box */}
            <div className="bg-gray-800 rounded-lg shadow-lg max-w-[20rem] w-[15rem] z-10">
              <div className="bg-gray-900 p-2 flex rounded-lg justify-between">
                <div className="flex items-center mr-5">
                  <img src="/graph.svg" alt="Graph Icon" className="mr-2" />
                  <p className="text-orange-600 font-semibold">GRAPH</p>
                </div>
                <img src="/setting.svg" alt="Settings Icon" />
              </div>
              <div className="m-1 p-1 text-white">
                <LottieAnimation src="/videos/graph2.json" height={80} width={100} />
                <InlineMath math={'y = 2x^2 - 3x + 1'} />
                <p>Netz will produce a table of selected x-values and their corresponding y-values, making it easy to observe linear relationships and trends.</p>
              </div>
            </div>

            {/* Table Box */}
            <div className=" bg-gray-800 rounded-lg shadow-lg max-w-[20rem] w-[15rem] z-30">
              <div className="bg-gray-900 p-2 flex rounded-lg justify-between">
                <div className="flex items-center mr-5">
                  <img src="/graph.svg" alt="Graph Icon" className="mr-2" />
                  <p className="text-green-600 font-semibold">TABLES</p>
                </div>
                <img src="/setting.svg" alt="Settings Icon" />
              </div>
              <div className="mt-1 p-1 text-white">
                <LottieAnimation src="/videos/table.json" height={40} width={80} />
                <InlineMath math={'y = 3x + 2'} />
                <p>Netz will produce a table of selected x-values and their corresponding y-values, making it easy to observe linear relationships and trends.</p>
              </div>
            </div>

            {/* Export Box */}
            <div className=" bg-gray-800 rounded-xl shadow-lg max-w-[20rem] w-[15rem] m-5 z-5">
              <div className="bg-gray-900 p-2 flex rounded-lg justify-between">
                <div className="flex items-center mr-5">
                  <img src="/download.svg" alt="stepsIcon" className="mr-2" />
                  <p className="text-red-600 font-semibold">EXPORT</p>
                </div>
                <img src="/setting.svg" alt="Settings Icon" />
              </div>
              <div className="m-1 p-2 text-white">
                <LottieAnimation src="/videos/graph.json" height={40} width={80} />
                <p>Netz makes it easy to export your solutions and graphs with a single click. Download high-quality images of your work in PNG format to use in presentations, reports, or share with students and peers.</p>
              </div>
            </div>

            {/* Steps Box */}
            <div className=" bg-gray-800 rounded-xl shadow-lg max-w-[20rem] w-[15rem] z-10">
              <div className="bg-gray-900 p-2 flex rounded-lg justify-between">
                <div className="flex items-center mr-5">
                  <img src="/Step.svg" alt="stepsIcon" className="mr-2" />
                  <p className="text-purple-600 font-semibold">STEPS</p>
                </div>
                <img src="/setting.svg" alt="Settings Icon" />
              </div>
              <div className="m-1 p-2 text-white">
                <LottieAnimation src="/videos/steps.json" height={40} width={80} />
                <InlineMath math={'x^3 - 4x^2 + 5x - 2 = 0'} />
                <p>Netz will show each step, from factoring the polynomial to finding the roots, ensuring you grasp each part of the process.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <div className="w-full h-10 bg-black bg-opacity-50"></div>

    </main>
  );
}
