import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const StepInfo = () => {
  // Step data
  const steps = [
    { id: 1, title: "Step 1: Introduction", description: "Begin by familiarizing yourself with the topic you want to study. Read about it thoroughly, understand its applications, and learn the relevant formulas.", imgSrc: "/s1.png" },
    { id: 2, title: "Step 2: Examples", description: "Examine the provided examples to grasp the method and its applications clearly.", imgSrc: "/s2.png" },
    { id: 3, title: "Step 3: Practice with the Calculator", description: "Utilize the calculator to practice different types of questions and enhance your problem-solving skills.", imgSrc: "/s3.png" },
    { id: 4, title: "Step 4: Analyze Graphs", description: "Graphs can help you visualize the problem, making it easier to understand both the solution and the process.", imgSrc: "/s4.png" },
    { id: 5, title: "Step 5: Polynomial Steps", description: "Follow a standardized format that outlines each step taken to solve the problem. This method allows for faster practice and builds confidence.", imgSrc: "/s5.png" },
    { id: 6, title: "Step 6: Export Your Work", description: "Finally, export and download PNG files of the graphs, steps, and tables for your reference.", imgSrc: "/s6.png" },
  ];

  const [activeStep, setActiveStep] = useState(steps[0]); // Initialize with the first step

  return (

    <>
         
         <div className="h-[65rem] sm:h-[72rem]  lg:h-[45rem] bg-[#0D1117] bg-opacity-60 text-white md:p-8 my-8 mx-auto space-y-4 md:w-[80%]">
  <div className="py-4 ">
    <h2 className="text-white md:text-4xl text-2xl text-center p-5 font-semibold">A custom environment designed for learning math quickly and easily</h2>
    <p className="text-[#C7C9D3] text-center">
    Here’s a quick guide on how to study math efficiently with Netz. Follow these steps to get started!</p>

  </div>

  {/* Main Section using Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-5">
    
    {/* Sidebar Section */}
    <div className="col-span-1 space-y-4 w-full ">
      {steps.map((step) => (
        <div
          key={step.id}
          onClick={() => setActiveStep(step)}
          className={`cursor-pointer p-4 rounded-md transition duration-300 ease-in-out bg-opacity-50 hover:bg-[#0D1117]
          ${activeStep.id === step.id ? 'bg-[#161B22] text-white' : 'bg-[#0D1117] text-gray-400 hover:bg-[#30363D] hover:text-white bg-opacity-100'}`}
        >
          <h2 className="text-lg font-semibold">{step.title}</h2>
          {activeStep.id === step.id && (
            <p className="text-sm text-[#C7C9D3]  mt-2">{step.description}</p>
          )}
        </div>
      ))}
    </div>

    {/* Main Image Section */}
    <div className="col-span-2 flex justify-center items-center relative my-5 rounded-lg">
      <motion.div
        key={activeStep.imgSrc} // Use key to trigger animation
        className="absolute inset-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 1.5 }}
      >
        <Image
          src={activeStep.imgSrc}
          alt={activeStep.title}
          width={800}
          height={800}
          className="rounded-md shadow-lg m-auto"
        />
      </motion.div>
    </div>
  </div>
</div>
</>
  );
};

export default StepInfo;
