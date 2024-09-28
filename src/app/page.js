"use client";

import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import LottieAnimation from "./components/Animation.js";
import NButton from "./components/NButton.js";
import Image from "next/image.js";
import StepInfo from "./components/steps.js";

export default function Home() {
  return (

    <main className="bg-neutral-950  h-[1000vh] w-full bg-center top-0"
      style={{ backgroundImage: "url('/bg1.png')", backgroundSize: "contain" }}>


      <div className=" p-5 flex w-full ">
        <div className="text-6xl mx-auto  font-bold text-white">NETZ</div>
      </div>


      <div className=" w-full ">




        <div className="   space-y-4  grid grid-cols-1 lg:grid-cols-2 w-[100%]  p-14   justify-center gap-20 ml-30px">



          <div className=" order-2 lg:order-none rounded-lg lg:bg-white lg:bg-opacity-10  max-lg:max-w-[50rem] mx-auto p-5 ">
            <h1 className="text-4xl text-white font-bold text-wrap text-center p-4">Keep Mathing with No Lag!</h1>

            <p className="text-xl text-gray-200 text-center m-5 p-5">Tired of clunky, slow tools holding back your math progress? Netz delivers lightning-fast problem-solving right at your fingertips. Whether you&apos;re crunching numbers on the go or leading a real-time class. No lag, no interruptions — just pure math mastery.
            </p>
            <p className="text-lg text-gray-400 text-center p-5 px-10 m-5">

              Download Netz today and experience smooth, seamless learning like never before!
            </p>
            <button className="px-5 py-3 mx-auto bg-green-500 hover:bg-green-700 rounded-xl mt-4 flex  items-center">
              <img src="/download.svg" alt="download" /><p className="pl-2 text-white active:text-black"> Let&#39;s keep Mathing</p>
            </button>
          </div>

          {/* Right Div */}<div className="order-1 lg:order-1 mt-10 pt-10   ">
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
                    <img src="/calculate.svg" alt="table Icon" className="mr-2" />
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

      <div className="bg-black bg-opacity-60 rounded-md w-[80%] h-20  mx-auto flex flex-row items-center px-5  gap-5 relative">
        <div className=" text-white p-2 w-[8rem] rounded items-center active ">
          <a href="https://google.com" target="_blank" rel="noopener noreferrer">

            <img src="/logo1.svg" />

          </a>
        </div>

        <div className=" text-white px-5 ">
          <h2 className="font-semibold">SPONSOR</h2>
          <p>sponsered ad description and pitch </p>
        </div>
        <div className="absolute font-semibold text-gray-700 top-0 right-3"> Sponsored</div>
      </div>



      <div className="grid gap-4 p-1 w-[80%] m-auto my-[7rem]
      grid-cols-1 
      md:grid-cols-2 md:grid-rows-[auto,repeat(4,1fr)] 
      lg:grid-cols-3 lg:grid-rows-3">

        <div className=" p-6 text-center md:col-span-2 lg:col-span-1 rounded-xl text-white ">
          <h2 className=" text-3xl p-4 m-4">It&apos;s Free and Fun—Start Learning with Netz Today!</h2>
          <p className="p-4 text-slate-400">
          Join a community of math learners and teachers who are transforming the way they approach mathematics. Download solutions, create notes, and level up your math skills in a fun and intuitive environment—all for free. Get started with Netz and make learning math a truly rewarding experience.</p></div>



        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/game.svg" alt="levelup icon" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Level Up</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            Transform your math study sessions into an engaging experience! Sign in to Netz and start leveling up your profile. Gamify your learning and unlock new achievements as you master mathematical concepts.
          </p>
          <NButton
            route="/"
            text="SignUp"
            svgPath="/sign-in.png"
            className="p-4 my-4"
          />
        </div>

        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] h-[4.5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/export.svg" alt="" className="w-full h-full"/>
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Export</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            With Netz, you can easily export your solutions, step-by-step processes, graphs, and tables. Share your progress and findings with classmates or keep them for your own reference—it&apos;s all just a click away!
          </p>
          <NButton
            route="/"
            text="export"
            svgPath="/try.png"
            className="p-4 my-4"
          />
        </div>

        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/notes.svg" alt="" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Notes</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            Are you a Tier 2 user? Enjoy the ability to create and share notes with your peers! Generate unique access keys to give others the opportunity to view or collaborate on your notes seamlessly.
          </p>
          <NButton
            route="/"
            text="Try Notes"
            svgPath="/sign-in.png"
            className="p-4 my-4"
          />
        </div>

        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/page.svg" alt="" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Explore Pages</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            Discover a wealth of knowledge created by us for you! Access an array of pages filled with useful information and resources to enhance your math understanding and skills.
          </p>
          <NButton
            route="/"
            text="Explore"
            svgPath="/explore.svg"
            className="p-4 my-4"
          />
        </div>

        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/Step.svg" alt="" className="w-full f-full" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Polynomial Steps</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            Dive deep into polynomial equations with structured step-by-step breakdowns, helping you understand each part of the problem-solving process.
          </p>
          <NButton
            route="/"
            text="Follow Steps"
            svgPath="/Step.svg"
            className="p-4 my-4"
          />
        </div>

        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/graph.svg" alt=""  className="w-full f-full "/>
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Visualize with Graph</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            Graphs are more than just lines and dots—they&apos;re powerful tools for understanding mathematical concepts! Netz provides visualizations to help you grasp complex ideas intuitively, making math feel more relatable.
          </p>
          <NButton
            route="/"
            text="View Graph"
            svgPath="/graph.svg"
            className="p-4 my-4 "
          />
        </div>

        <div className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/icon.svg" alt="" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Your Essential Math Companion</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            Stay informed about the crucial math concepts you need to know. With Math6thSense, you can easily access vital information and resources to ensure you&apos;re always prepared for your next challenge.
          </p>
          <NButton
            route="/"
            text="Start Learning"
            svgPath="/icon.svg"
            className="p-4 my-4"
          />
        </div>



        <div className=" px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }} >

          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <img src="/globe.svg" alt="" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">Practice Anywhere, Anytime</p>


          <p className="  text-left my-5 " style={{ color: '#C7C9D3' }}>
            Take your math practice on the go! Netz empowers you to work on problems wherever you are. Whether commuting or waiting in line, your math studies never have to pause. Stay sharp and keep progressing!
          </p>

          <NButton
            route="/"
            text="Pratice Now!"
            svgPath="/function.svg"
            className="p-4 my-4"
          />

        </div>

      </div>


      <div className="bg-black bg-opacity-60 rounded-md w-[80%] h-[20rem]  mx-auto flex flex-row items-center px-5  gap-5 relative">
        <div className=" text-white p-2 w-[18rem] rounded items-center active ">
          <a href="https://google.com" target="_blank" rel="noopener noreferrer">

            < Image  src="/logo1.svg"  alt="logo Icon" 
    layout="responsive" 
    width={50} 
    height={50} />

          </a>
        </div>

        <div className=" text-white px-5 ">
          <h2 className="font-semibold">SPONSOR</h2>
          <p>sponsered ad description and pitch </p>
        </div>
        <div className="absolute font-semibold text-gray-700 top-0 right-3"> Sponsored</div>
      </div>

<StepInfo/>
    </main>



  );
}
