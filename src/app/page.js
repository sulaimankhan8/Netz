// pages/index.js
"use client"
export default function Home() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center "
      style={{ backgroundImage: "url('/bg1.svg')" }}
    >
      <div className="bg-black bg-opacity-50 p-6 rounded-lg">
        <h1 className="text-4xl text-white font-bold">Welcome to My Landing Page</h1>
        <p className="text-lg text-gray-200">A website is like a road. The more curves it has, the more interesting it is.</p>
      </div>
    </div>
  );
}
