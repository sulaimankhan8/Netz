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
        <nav className="bg-gray-800 text-white p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold cursor-pointer" onClick={() => handleNavigation('/')}>MyApp</h1>
                <div className="relative">
                    <button
                        className="focus:outline-none"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        Menu
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                            <button
                                className="block px-4 py-2 text-sm hover:bg-gray-600"
                                onClick={() => handleNavigation('/newton-backward')}
                            >
                                Newton Backward Interpolations
                            </button>
                            <button
                                className="block px-4 py-2 text-sm hover:bg-gray-600"
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
