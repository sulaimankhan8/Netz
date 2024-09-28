"use client";

import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import LottieAnimation from "./components/Animation.js";

export default function Home() {
  return (

    <main className="bg-neutral-950 h-[500vh] w-full bg-center top-0"
      style={{ backgroundImage: "url('/bg1.png')", backgroundSize: "contain" }}>

      <div className=" w-full ">
        <div className=" p-5 flex w-full ">
          <div className="text-6xl mx-auto  font-bold text-white">NETZ</div>
        </div>



        <div className="   space-y-4  grid grid-cols-1 lg:grid-cols-2 w-[100%]  p-14   justify-center gap-20 ml-30px">



          <div className=" order-2 lg:order-none rounded-lg   max-lg:max-w-[50rem] mx-auto p-5 ">
            <h1 className="text-4xl text-white font-bold text-wrap text-center p-4">Keep Mathing with No Lag!</h1>

            <p className="text-xl text-gray-200 text-center m-5 p-5">Tired of clunky, slow tools holding back your math progress? Netz delivers lightning-fast problem-solving right at your fingertips. Whether you're crunching numbers on the go or leading a real-time class. No lag, no interruptions — just pure math mastery.
            </p>
            <p className="text-lg text-gray-400 text-center p-5 px-10 m-5">

              Download Netz today and experience smooth, seamless learning like never before!
            </p>
            <button className="px-5 py-3 mx-auto bg-green-500 hover:bg-green-700 rounded-xl mt-4 flex  items-center">
              <img src="/download.svg" alt="download" /><p className="pl-2 text-white active:text-black"> Let&#39;s keep Mathing</p>
            </button>
          </div>

          {/* Right Div */}<div className="order-1 lg:order-1 pt-15  ">
          <div className=" rounded-lg   relative">
            <div className=" top-0 w-[80%] h-[310px]   lg:w-full lg:h-[410px] bg-gradient-to-r from-[#ef05ef] to-[#eacb06] rounded-lg  mx-auto justify-between"></div>

              <div className="absolute [top:-10%] [left:5%] bg-opacity-70
         bg-gray-800  rounded-lg shadow-lg shadow-black max-w-[20rem] w-[15rem] z-10 ">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <img src="/graph.svg" alt="Graph Icon" className="mr-2" />
                    <p className="text-orange-600 font-semibold">GRAPH</p>
                  </div>
                  <img src="/setting.svg" alt="Settings Icon" />
                </div>

                <div className="m-1 p-1 text-white">
                  <LottieAnimation src="/videos/graph2.json" height={80} width={100} /><InlineMath math={'y = 2x^2 - 3x + 1'} /><p>Netz will produce a table of selected
                    𝑥
                    x-values and their corresponding
                    𝑦
                    y-values, making it easy to observe linear relationships and trends.</p>
                </div>
              </div>




              <div className="absolute [bottom:5%] [right:5%] bg-opacity-70 bg-gray-800  rounded-lg shadow-lg shadow-black max-w-[20rem] w-[15rem] z-30">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <img src="/graph.svg" alt="Graph Icon" className="mr-2" />
                    <p className="text-green-600 font-semibold">TABLES</p>
                  </div>
                  <img src="/setting.svg" alt="Settings Icon" />
                </div>

                <div className="mt-1 p-1  text-white">
                  <LottieAnimation src="/videos/table.json" height={40} width={80} /><InlineMath math={'y = 3x + 2'} /><p>Netz will produce a table of selected 𝑥 x-values and their corresponding 𝑦 y-values, making it easy to observe linear relationships and trends.</p>

                </div>
              </div>

              <div className="absolute [top:-10%] [left:40%] bg-opacity-70 bg-gray-800  rounded-xl shadow-lg shadow-black max-w-[20rem] w-[15rem] m-5 z-5">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <img src="/download.svg" alt="stepsIcon" className="mr-2" />
                    <p className="text-red-600 font-semibold">EXPORT</p>
                  </div>
                  <img src="/setting.svg" alt="Settings Icon" />
                </div>
                <div className="m-1 p-2 text-white">


                  <LottieAnimation src="/videos/graph.json" height={40} width={80} /><p className=""> Download high-quality images of your work in PNG format to use in presentations, reports, or share with students and peers.</p>

                </div>
              </div>



              <div className="absolute [top:50%]  [left:25%] bg-gray-800  rounded-xl shadow-xl shadow-black max-w-[20rem] w-[15rem] bg-opacity-70 z-10">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <img src="/Step.svg" alt="stepsIcon" className="mr-2" />
                    <p className="text-purple-600 font-semibold">STEPS</p>
                  </div>
                  <img src="/setting.svg" alt="Settings Icon" />
                </div>
                <div className="m-1 p-2 text-white">


                  <LottieAnimation src="/videos/steps.json" height={40} width={80} /><InlineMath math={'x^3 - 4x^2 + 5x - 2 = 0'} /><p className="">Netz will show each step, from factoring the polynomial to finding the roots, ensuring you grasp each part of the process.</p>

                </div>
              </div>
            </div></div>
          </div> 
      </div>

     <div className="bg-black bg-opacity-60 rounded-md w-[80%] h-20 mx-auto flex "> 
      <div className=""><button><img src=""/></button></div>
      <div className=""></div>
      
     </div>
      



    </main>



  );
}
