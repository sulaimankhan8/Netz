// components/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="dark:bg-neutral-900 bg-neutral-800 text-neutral-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-neutral-700 p-8">
          <div className="flex items-center w-10 ">
          <img  src="/location.svg" alt=""/>
            <div className="ml-4">
              <h4 className="text-white font-semibold">Find us</h4>
              <span>RAJAJIPURAM LUCKNOW, UTTAR PRADESH</span>
            </div>
          </div>


          <div className="flex items-center w-10">
          <img  src="/phone.svg" alt=""/>
            <div className="ml-4">
              <h4 className="text-white font-semibold">Call us</h4>
              <span>0000000000</span>
            </div>
          </div>
          <div className="flex items-center w-10">
            <img  src="/mail.svg" alt=""/>
                <div className="ml-4">
              <h4 className="text-white font-semibold">Mail us</h4>
              <span>suleman111111111111111@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 m-5">
          <div >
            <div className="mb-4">
              <a href="https://www.linkedin.com/in/suleman-khan-b4ab2b275/">
                <img src="/icon.svg" alt="logo" className="w-12" />
              </a>
            </div>
            <p className="text-neutral-500">
            A math nerd making mathing easier for everyone.
            </p>
            <div className="mt-4">
              <span className="text-white">Follow us</span>
              <div className="flex space-x-4 mt-2">
                <a href="https://www.linkedin.com/in/suleman-khan-b4ab2b275/" className="text-white bg-blue-700 p-2 rounded-full">
                <img src="/linkedin.svg" alt="linked" className="w-4" />
                </a>
                <a href="https://github.com/sulaimankhan8" className="text-white bg-violet-700 p-2 rounded-full">
                <img src="/github.svg" alt="Github" className="w-4" />
                
                </a>
                          
                
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Useful Links</h3>
            <ul className="text-neutral-500 space-y-2">
              <li><a href="/" className="hover:text-orange-500">Home</a></li>
              <li><a href="#" className="hover:text-orange-500">About</a></li>
              <li><a href="#" className="hover:text-orange-500">Services</a></li>
              <li><a href="#" className="hover:text-orange-500">Portfolio</a></li>
              <li><a href="#" className="hover:text-orange-500">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Subscribe</h3>
            <p className="text-neutral-500 mb-4">
              Don’t miss to subscribe to our new feeds, kindly fill the form below.
            </p>
            <form className="relative">
              <input
                type="text"
                className="w-full p-4 bg-neutral-800 border border-neutral-700 text-neutral-400"
                placeholder="Email Address"
              />
              <button className="absolute right-0 top-0 bg-orange-500 p-4">
                <i className="fab fa-telegram-plane text-white"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="py-4 border-t border-neutral-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-neutral-500">
              &copy; 2021, All Rights Reserved <a href="#" className="text-orange-500">Sulaiman</a>
            </p>
            <ul className="flex space-x-4 text-sm text-neutral-500">
              <li><a href="/" className="hover:text-orange-500">Home</a></li>
              <li><a href="#" className="hover:text-orange-500">Terms</a></li>
              <li><a href="#" className="hover:text-orange-500">Privacy</a></li>
              <li><a href="#" className="hover:text-orange-500">Policy</a></li>
              <li><a href="#" className="hover:text-orange-500">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
