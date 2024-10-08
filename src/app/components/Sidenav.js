'use client';

import { useState } from 'react';
import Link from 'next/link';
import "../styles/sidebar.css";
import Image from 'next/image';

const Sidebar = () => {
  const [isClosed, setIsClosed] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null); 
  const [hoveredIndex, setHoveredIndex] = useState(null);
  

  const toggleSidebar = () => {
    setIsClosed(!isClosed);
    setActiveUnit(null);
    setActiveSubMenu(null);
    
  };

  const toggleSubMenu = (index) => {
    setActiveSubMenu(activeSubMenu === index ? null : index);
    setActiveUnit(null); 
  };

  const toggleUnitMenu = (unitIndex) => {
    setActiveUnit(activeUnit === unitIndex ? null : unitIndex);

  };

 

  const pages = [
    { title: 'Home', src: "/home.svg", route: "/" },
    { title: 'Setting', src: "/tune.svg", route: "/Setting" },
    { title: 'Notes', src: "/notes.svg", route: "/Notes" },
    { title: 'Profile', src: "/profile.svg", route: "/Profile" },
    { title: 'Playground', src: "/game.svg", route: "/Playground" }
  ];

  const units = [
    {
      title: 'Unit 1',
      subTopics: [
        { title: 'Bisection Method', link: '/bisection-method' },
        { title: 'Iteration Method', link: '/iteration-method' },
        { title: 'False Position Method', link: '/false-position-method' },
        { title: 'Newton-Raphson Method', link: '/newton-raphson-method' },
        { title: 'Gauss Seidel Method', link: '/Gauss-seidal' },
      ],
    },
    {
      title: 'Unit 2',
      subTopics: [
        {
          title: 'Interpolation for Equal Intervals',
          subTopics: [
            { title: "Newton's Forward Formula", link: '/newton-forward' },
            { title: "Newton's Backward Formula", link: '/newton-backward' },
            { title: 'Gauss Forward Formula', link: '/gauss-forward' },
            { title: 'Gauss Backward Formula', link: '/gauss-backward' },
          ],
        },
        {
          title: 'Interpolation for Unequal Intervals',
          subTopics: [
            { title: "Newton's Divided Difference Formula", link: '/newton-divided' },
            { title: "Lagrange's Interpolation Formula", link: '/lagrange-interpolation' },
          ],
        },
      ],
    },
    {
      title: 'Unit 3',
      subTopics: [
        { title: 'Numerical Differentiation', link: '/numerical-differentiation' },
        {
          title: 'Numerical Integration',
          subTopics: [
            { title: 'Trapezoidal Rule', link: '/trapezoidal-Rule' },
            { title: "Simpson's 1/3 Rule", link: '/simpson-1-3-Rule' },
            { title: "Simpson's 3/8 Rule", link: '/simpson-3-8-Rule' },
            { title: "Boole's Rule", link: '/boole-Rule' },
            { title: "Weddle's Rule", link: '/weddle-Rule' },
          ],
        },
      ],
    },
    {
      title: 'Unit 4',
      subTopics: [
        { title: "Taylor's Series Method", link: '/taylor-s-series-method' },
        { title: "Euler's Method", link: '/euler-s-method' },
        { title: "Modified Euler's Method", link: '/modified-euler-s-method' },
        { title: "Runge-Kutta Methods", link: '/runge-kutta-method' },
      ],
    },
    {
      title: 'Unit 5',
      subTopics: [
        { title: 'Method of Least Squares', link: '/least-squares' },
        { title: 'Fitting of Straight Lines', link: '/fitting-straight-lines' },
        { title: 'Fitting of Second Degree Parabola', link: '/fitting-parabola' },
        {
          title: 'Testing of Hypothesis',
          subTopics: [
            { title: 'Test of Significance', link: '/test-significance' },
            { title: 't-test', link: '/t-test' },
            { title: 'F-test', link: '/f-test' },
            { title: 'Chi-Square Test', link: '/chi-square' },
          ],
        },
      ],
    },
  ];

  return (
    <div className={`sidebar ${isClosed ? 'close' : ''}`}>
      <div className="logo">
        <span className="logo-name">NETZ</span>
      </div>
      <ul className="nav-list">
        <li>
          {isClosed ? (
            <Link href="/Algorithems" className="icon-link" onMouseEnter={() => toggleSubMenu(0)}>
              <Image src="/page.svg" alt="Pages Icon" width={30} height={30}/>
              <span className="link-name">Pages</span>
            </Link>
          ) : (
            <div 
              className={`icon-link clickable ${activeSubMenu === 0 ? 'active' : ''}`} 
              onClick={() => toggleSubMenu(0)}
            >
              <Image src="/page.svg" alt="Pages Icon" width={30} height={30} />
              <span className="link-name">Pages</span>
              <Image className={`${activeSubMenu === 0 ? '-rotate-180' : ''}`} src="/arrow-down.svg" alt="Toggle Arrow" width={30} height={30} />
            </div>
          )}

          {activeSubMenu === 0 && (
            <ul className="sub-menu shadow-xl shadow-black">
              {units.map((unit, index) => (
                <li 
                  key={index} 
                  { ...( isClosed ? {
                    onMouseEnter: () => toggleUnitMenu(index + 1),
                    onMouseLeave: () => toggleUnitMenu(null)
                  } : {
                    onClick: () => toggleUnitMenu(index + 1),
                    onMouseLeave: () => toggleUnitMenu(null)
                  })}
                >
                  <Link href="#">{unit.title}</Link>
                  
                  {activeUnit === index + 1 && (
                    <ul className="sub-menu shadow-xl shadow-black w-[250px] rounded-lg ">
                      {unit.subTopics.map((subTopic, subIndex) => (
                        <li key={subIndex}>
                          {subTopic.subTopics ? (
                            <>
                              {isClosed ? (
                                <>
                                  <Link href="#">{subTopic.title}</Link>
                                  {activeUnit === index + 1 && (
                                    <ul className="sub-menu">
                                      {subTopic.subTopics.map((subSubTopic, subSubIndex) => (
                                        <li key={subSubIndex}>
                                          <Link href={subSubTopic.link}>{subSubTopic.title}</Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Link href="#">{subTopic.title}</Link>
                                  {activeUnit === index + 1 && (
                                    <ul className="">
                                      {subTopic.subTopics.map((subSubTopic, subSubIndex) => (
                                        <li key={subSubIndex}>
                                          <Link href={subSubTopic.link}>{subSubTopic.title}</Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <Link href={subTopic.link}>{subTopic.title}</Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
        {pages.map((page, index) => (
          <li
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative"
          >
            <Link href={page.route} className="icon-link">
              <Image src={page.src} alt={`${page.title} Icon`} width={30} height={30}/>
              <span className="link-name">{page.title}</span>
              {hoveredIndex === index && isClosed && (
                <div className="absolute left-[50px] top-1/2 transform -translate-y-1/2 bg-[#1d1b31] text-white px-3 py-3 rounded-md text-lg z-10 whitespace-nowrap shadow-md shadow-black h-[50px]">
                  {page.title}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="profile-details">
        <div className="profile-content">
          <Image src="/icon.svg" alt="Profile Icon" width={30} height={30}/>
          <div className="name-job">
            <div className="name">Sulaiman Khan</div>
            <div className="job">Web Developer</div>
          </div>
        </div>
        <a href="https://www.linkedin.com/in/suleman-khan-b4ab2b275/" target="_blank" rel="noopener noreferrer">
          <Image src="/go.svg" alt="LinkedIn" width={30} height={30}/>
        </a>
      </div>
      <div className={`menuToggle ${isClosed ? '' : 'active'}`} onClick={toggleSidebar}>
        <div className="toggle-bar"></div>
      </div>
    </div>
  );
};

export default Sidebar;

