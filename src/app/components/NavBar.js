// src/components/NavBar.js

"use client"; // This makes it a client component
import Image from 'next/image';
import { useState ,useEffect} from 'react';
import { useRouter } from 'next/navigation'; // Import for App Router
import { LuMenu, LuX } from 'react-icons/lu';
import ProgressChip from './mascot/ProgressChip';

const NavBar = () => {
    const [isClosed, setIsClosed] = useState(true); // Sidebar toggle state
    const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown open state
    const router = useRouter();

    // Handle navigation and reset states
    const handleNavigation = (path) => {
        router.push(path);
        setDropdownOpen(false); // Close dropdown after navigation
        setIsClosed(true);      // Reset menuToggle2 to its default state (closed)
    };
    
    const toggleSidebar = () => {
        setIsClosed(!isClosed); // Toggle the sidebar
    };
    useEffect(() => {
        router.prefetch('/newton-backward');
        router.prefetch('/newton-forward');
        router.prefetch('/Gauss-seidal');
        router.prefetch('/'); // Prefetch the home page
    }, [router]);

    return (
        <nav data-app-nav className="relative z-30 shrink-0 bg-black dark:bg-neutral-800 text-white p-4 pr-12 pl-7">
            <div className="flex justify-between items-center">
                {/* Logo with navigation to home */}
                <div className="text-xl font-bold cursor-pointer w-12" onClick={() => handleNavigation('/')}>
                    <Image src="/icons/icon.svg" alt="icon logo" width={50} height={50}/>
                </div>

                {/* Streak and gems: opens the Profile page */}
                <div className="ml-auto mr-10">
                    <ProgressChip variant="phone" />
                </div>

                {/* Dropdown and sidebar toggle button */}
                <div className="relative">
                    {/* The menu button draws its own icon: the old .menuToggle2 styles live in
                        sidebar.css, which nothing loads any more, so the button had no size */}
                    <button
                        type="button"
                        aria-label={dropdownOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={dropdownOpen}
                        className="-mr-8 w-11 h-11 flex items-center justify-center rounded-md bg-[rgb(246,197,0)] text-black"
                        onClick={() => {
                            setDropdownOpen(!dropdownOpen);
                            toggleSidebar();
                        }}
                    >
                        {dropdownOpen ? <LuX className="w-6 h-6" aria-hidden="true" /> : <LuMenu className="w-6 h-6" aria-hidden="true" />}
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-neutral-700 rounded-md shadow-lg z-10">
                            <button
                                className="block w-full p-4 py-2 text-sm text-center hover:bg-neutral-600"
                                onClick={() => handleNavigation('/newton-backward')}
                            >
                                Newton Backward Interpolations
                            </button>
                            <button
                                className="block w-full p-4 py-2 text-sm text-center hover:bg-neutral-600"
                                onClick={() => handleNavigation('/newton-forward')}
                            >
                                Newton Forward Interpolations
                            </button>
                            <button
                                className="block w-full p-4 py-2 text-sm text-center hover:bg-neutral-600"
                                onClick={() => handleNavigation('/Gauss-seidal')}
                            >
                                Gauss-Seidal Approximation Method
                            </button>
                            <button
                                className="block w-full p-4 py-2 text-sm text-center hover:bg-neutral-600"
                                onClick={() => handleNavigation('/')}
                            >
                                Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
