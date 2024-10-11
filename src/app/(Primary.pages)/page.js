"use client";
import "katex/dist/katex.min.css";
import NButton from "../components/NButton.js";
import Image from "next/image.js";
import dynamic from 'next/dynamic';
import Head from "next/head.js";

import { useState,useEffect  } from 'react';
import Ad from '../components/Ad';


const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { 
  ssr: false, 
  loading: () => <span>Loading math...</span>
});
const LottieAnimation = dynamic(() => import('../components/Animation.js'), { 
  ssr: false, 
  loading: () => <p>Loading animation...</p>
});
const StepInfo = dynamic(() => import('../components/steps.js'), { 
  ssr: false, 
  loading: () => <p>Loading steps...</p>
});
export default function Home() {

  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Display ad after 10 seconds
    const timer = setTimeout(() => {
      setShowAd(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const cardsData = [
    {ImageSrc: "/game.svg",ImageAlt: "levelup icon",title: "Level Up",description: "Transform your math study sessions into an engaging experience! Sign in to Netz and start leveling up your profile. Gamify your learning and unlock new achievements as you master mathematical concepts.", buttonText: "SignUp",buttonRoute: "/",buttonIcon: "/sign-in.png", },
    {ImageSrc: "/export.svg",ImageAlt: "export icon",title: "Export",description: "With Netz, you can easily export your solutions, step-by-step processes, graphs, and tables. Share your progress and findings with classmates or keep them for your own reference—it's all just a click away!",buttonText: "Export",buttonRoute: "/",buttonIcon: "/download.svg",},
    {ImageSrc: "/notes.svg",ImageAlt: "notes icon",title: "Notes",description: "Are you a Tier 2 user? Enjoy the ability to create and share notes with your peers! Generate unique access keys to give others the opportunity to view or collaborate on your notes seamlessly.",buttonText: "Try Notes",buttonRoute: "/",buttonIcon: "/sign-in.png",},
    {ImageSrc: "/page.svg",ImageAlt: "pages icon",title: "Explore Pages",description: "Discover a wealth of knowledge created by us for you! Access an array of pages filled with useful information and resources to enhance your math understanding and skills.",buttonText: "Explore",buttonRoute: "/",buttonIcon: "/explore.svg",},
    {ImageSrc: "/Step.svg",ImageAlt: "polynomial steps icon",title: "Polynomial Steps",description: "Dive deep into polynomial equations with structured step-by-step breakdowns, helping you understand each part of the problem-solving process.",buttonText: "Follow Steps",buttonRoute: "/",buttonIcon: "/Step.svg",},
    {ImageSrc: "/graph.svg",ImageAlt: "graph icon",title: "Visualize with Graph",description: "Graphs are more than just lines and dots—they’re powerful tools for understanding mathematical concepts! Netz provides visualizations to help you grasp complex ideas intuitively, making math feel more relatable.",buttonText: "View Graph",buttonRoute: "/",buttonIcon: "/graph.svg",},
    {ImageSrc: "/icon.svg",ImageAlt: "math companion icon",title: "Your Essential Math Companion",description: "Stay informed about the crucial math concepts you need to know. With Math6thSense, you can easily access vital information and resources to ensure you’re always prepared for your next challenge.",buttonText: "Start Learning",buttonRoute: "/Gauss-seidal?tour=true",buttonIcon: "/icon.svg",},
    {ImageSrc: "/globe.svg",ImageAlt: "practice icon",title: "Practice Anywhere, Anytime",description: "Take your math practice on the go! Netz empowers you to work on problems wherever you are. Whether commuting or waiting in line, your math studies never have to pause. Stay sharp and keep progressing!",buttonText: "Practice Now!",buttonRoute: "/",buttonIcon: "/function.svg",},
  ];
  
  return (<>
    <Head>
    <meta name="google-site-verification" content="WT9x6ycaN58WMURczi5-6Uk_pqt2_cvxkw2OIYN0ZPU" />
    
        <title>Netz - Math Problem Solving Platform | Interpolation Techniques</title>
        <meta
          name="description"
          content="Netz is a free platform for learning mathematical concepts and solving problems efficiently. Explore various interpolation methods like Newton Forward and Newton Backward interpolation."
        />
        <meta
          name="keywords"
          content="Netz, interpolation, Newton backward, Newton forward, math problem solving, educational platform"
        />
        <meta name="author" content="Netz" />
        <meta property="og:title" content="Netz - Math Problem Solving Platform" />
        <meta
          property="og:description"
          content="Learn about interpolation techniques and other mathematical concepts on Netz."
        />
        <meta property="og:url" content="https://netz-ruby.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://netz-ruby.vercel.app/images/icon.svg" />
        <meta property="og:image" content="https://netz-ruby.vercel.app/images/og-image.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Netz - Math Problem Solving Platform" />
        <meta
          name="twitter:description"
          content="Explore Netz for quick problem-solving techniques and a fun learning experience."
        />
           <meta name="twitter:image" content="https://netz-ruby.vercel.app/images/icon.svg" />
        <meta name="twitter:image:src" content="https://netz-ruby.vercel.app/images/twitter-card.jpeg" />
     
    </Head>
    <main className="bg-neutral-950  h-[1000vh] w-full bg-center top-0"
      style={{ backgroundImage: "url('/bg1.png')", backgroundSize: "contain" }}>
     {showAd && <Ad/>}
     
      <div className=" p-5 flex w-full ">
        <div className="text-6xl mx-auto  font-bold text-white">NETZ</div>
      </div>
      <div className=" w-full ">
        <div className="   space-y-4  grid grid-cols-1 lg:grid-cols-2 w-[100%]  p-14   justify-center gap-20 ml-30px max-sm:px-1">
          <div className=" order-2 lg:order-none rounded-lg lg:bg-white lg:bg-opacity-10  max-lg:max-w-[50rem] mx-auto sm:px-5 py-5 ">
            <h1 className="text-4xl text-white font-bold text-wrap text-center sm:p-4">Keep Mathing with No Lag!</h1>
            <p className="text-xl text-gray-200 text-center m-5 p-5">Tired of clunky, slow tools holding back your math progress? Netz delivers lightning-fast problem-solving right at your fingertips. Whether you&apos;re crunching numbers on the go or leading a real-time class. No lag, no interruptions — just pure math mastery.</p>
            <p className="text-lg text-gray-400 text-center p-5 px-10 m-5">
              Download Netz today and experience smooth, seamless learning like never before!</p>
            <button className="px-5 py-3 mx-auto bg-violet-600 hover:bg-purple-700 active:text-black rounded-xl mt-4 flex  items-center">
              <Image src="/download.svg" alt="download"   width={24}
                height={24} /><p className="pl-2 text-white active:text-black"> Let&#39;s keep Mathing</p></button></div>
          <div className="order-1 lg:order-1 mt-10 pt-10 max-sm:scale-75  ">
            <div className=" rounded-lg   relative">
              <div className=" top-0 w-[80%] h-[310px]   lg:w-full lg:h-[410px] bg-gradient-to-r from-[#ef05ef] to-[#eacb06] rounded-lg  mx-auto justify-between"></div>
<div className="absolute [top:-10%] [left:5%]  bg-opacity-70 max-md:transform max-md:skew-y-12 hover:z-50 hover:bg-opacity-100  max-sm:top-0
         bg-gray-800  rounded-lg shadow-lg shadow-black max-w-[20rem] w-[15rem] z-10 ">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <Image  src="/graph.svg" alt="Graph Icon"   width={24}
                height={24} className="mr-2" />
                    <p className="text-orange-600 font-semibold">GRAPH</p>
                  </div><Image src="/setting.svg" alt="Settings Icon" width={24} height={24} /></div><div className="m-1 p-1 text-white">
                  <LottieAnimation src="/videos/graph2.json" height={80} width={100} /><InlineMath math={'y = 2x^2 - 3x + 1'} /><p>Netz will produce a table of selected 𝑥 x-values and their corresponding 𝑦 y-values,making it easy to observe linear relationships and trends.</p>
                </div>
              </div>
              <div className="absolute [bottom:5%] [right:5%] bg-opacity-70 bg-gray-800  rounded-lg shadow-lg shadow-black max-w-[20rem] w-[15rem] z-6 max-md:transform max-md:skew-y-12 hover:z-50 max-sm:top-0 hover:bg-opacity-100 ">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <Image height={24}
                    width={24} src="/calculate.svg" alt="table Icon" className="mr-2" />
                    <p className="text-green-600 font-semibold">TABLES</p>
                  </div>
                  <Image src="/setting.svg" alt="Settings Icon" height={24}
                    width={24}/>
                </div>
                <div className="mt-1 p-1  text-white">
                  <LottieAnimation src="/videos/table.json" height={24} width={24} /><InlineMath math={'y = 3x + 2'} /><p>Netz will produce a table of selected 𝑥 x-values and their corresponding 𝑦 y-values, making it easy to observe linear relationships and trends.</p>
                </div>
              </div>
              <div className="absolute [top:-10%] [left:40%] bg-opacity-70 bg-gray-800  rounded-xl shadow-lg shadow-black max-w-[20rem] w-[15rem] m-5 z-20 max-md:transform max-md:skew-y-12 hover:z-50 hover:bg-opacity-100  max-sm:top-5">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <Image height={24}
                    width={24} src="/download.svg" alt="stepsIcon" className="mr-2" />
                    <p className="text-red-500 font-semibold">EXPORT</p>
                  </div>
                  <Image height={24}
                    width={24} src="/setting.svg" alt="Settings Icon" />
                </div>
                <div className="m-1 p-2 text-white">
                  <LottieAnimation src="/videos/graph.json" height={40} width={80} /><p className=""> Download high-quality images of your work in PNG format to use in presentations, reports, or share with students and peers.</p>
                </div>
              </div>
              <div className="absolute [top:50%]  [left:25%] bg-gray-800  rounded-xl shadow-xl shadow-black max-w-[20rem] w-[15rem] bg-opacity-70 z-10 max-md:transform max-md:skew-y-12 hover:z-50 hover:bg-opacity-100 max-sm:top-0">
                <div className="bg-gray-900   p-2 flex rounded-lg justify-between ">
                  <div className="flex items-center mr-5">
                    <Image height={24}
                    width={24} src="/Step.svg" alt="stepsIcon" className="mr-2" />
                    <p className="text-violet-500 font-semibold">STEPS</p>
                  </div>
                  <Image height={24}
                    width={24} src="/setting.svg" alt="Settings Icon" />
                </div>
                <div className="m-1 p-2 text-white">
                  <LottieAnimation src="/videos/steps.json" height={40} width={80} /><InlineMath math={'x^3 - 4x^2 + 5x - 2 = 0'} /><p className="">Netz will show each step, from factoring the polynomial to finding the roots, ensuring you grasp each part of the process.</p>
                </div>
              </div>
            </div></div>
        </div>
      </div>
      <div className="bg-black bg-opacity-60 rounded-md w-[80%] h-20  mx-auto flex flex-row items-center px-5  gap-5 max-sm:h-[20rem] relative">
        <div className=" text-white p-2 w-[8rem] rounded items-center active ">
          <a href="https://netz-git-main-sulaimankhan8s-projects.vercel.app/" target="_blank" rel="noopener noreferrer">
            <Image height={80}
                    width={100} src="/logo1.svg" alt="logo"/> </a>
        </div>
        <div className=" text-white px-5 ">
          <h2 className="font-semibold">SPONSOR</h2>
          <p>sponsered ad description and pitch </p>
        </div>
        <div className="absolute font-semibold text-gray-700 top-0 right-3"> Sponsored</div>
      </div>
      <div className="grid gap-4 sm:p-1 sm:w-[80%] m-auto sm:my-[7rem] grid-cols-1 md:grid-cols-2 md:grid-rows-[auto,repeat(4,1fr)] lg:grid-cols-3 lg:grid-rows-3">
      <div className="p-6 text-center md:col-span-2 lg:col-span-1 rounded-xl text-white">
        <h2 className="text-3xl p-4 m-4">
          It&apos;s Free and Fun—Start Learning with Netz Today!
        </h2>
        <p className="p-4 text-slate-400">
          Join a community of math learners and teachers who are transforming the way they approach mathematics. Download solutions, create notes, and level up your math skills in a fun and intuitive environment—all for free. Get started with Netz and make learning math a truly rewarding experience.
        </p>
      </div>
      {cardsData.map((card, index) => (
        <div key={index} className="px-6 py-2 text-center rounded-xl m-4 bg-opacity-80" style={{ backgroundColor: 'rgba(44, 48, 58,0.9)' }}>
          <div className="bg-black w-[5rem] -translate-y-1/2 p-4 rounded-lg mb-[-1rem]">
            <Image height={24}
                    width={24} src={card.ImageSrc} alt={card.ImageAlt} className="w-full h-full" />
          </div>
          <p className="text-left text-white text-2xl font-semibold ml-1">{card.title}</p>
          <p className="text-left my-5" style={{ color: '#C7C9D3' }}>
            {card.description}
          </p>
          <NButton
            route={card.buttonRoute}
            text={card.buttonText}
            svgPath={card.buttonIcon}
            className="p-4 my-4"
          />
        </div>
      ))}
    </div>
      <div className="bg-black bg-opacity-60 rounded-md w-[80%] h-[20rem]  mx-auto flex flex-row items-center px-5  gap-5 relative">
        <div className=" text-white p-2 w-[18rem] rounded items-center active ">
          <a href="https://netz-git-main-sulaimankhan8s-projects.vercel.app/" target="_blank" rel="noopener noreferrer">
            < Image  src="/logo1.svg"  alt="logo Icon" width={50}height={50} />
          </a>
        </div>
        <div className=" text-white px-5 ">
          <h2 className="font-semibold">SPONSOR</h2>
          <p>sponsered ad description and pitch </p>
        </div>
        <div className="absolute font-semibold text-gray-700 top-0 right-3"> Sponsored</div>
      </div>
<StepInfo/>
    </main></>
  );
}
