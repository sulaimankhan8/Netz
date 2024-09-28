// src/components/NavBar.js

"use client"; // This makes it a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import for App Router

const NavBar = () => {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleNavigation = (path) => {
        router.push(path);
        setDropdownOpen(false); // Close dropdown after navigation
    };

    return (
        <nav className="bg-black dark:bg-neutral-800 text-white p-4 pr-12 pl-7">
            <div className="flex justify-between items-center">
                <div className="text-xl font-bold cursor-pointer w-12" onClick={() => handleNavigation('/')}><img src="/icon.svg"/></div>
                <div className="relative">
                    <button
                        className="focus:outline-none"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        Menu
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-neutral-700 rounded-md shadow-lg z-10">
                            <button
                                className="block px-4 py-2 text-sm hover:bg-neutral-600"
                                onClick={() => handleNavigation('/newton-backward')}
                            >
                                Newton Backward Interpolations
                            </button>
                            <button
                                className="block px-4 py-2 text-sm hover:bg-neutral-600"
                                onClick={() => handleNavigation('/newton-foward')}
                            >
                                Newton Forward Interpolations
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;