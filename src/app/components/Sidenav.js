'use client';

import { useState } from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const [isClosed, setIsClosed] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState(null); // To track the main sub-menu
  const [activeUnit, setActiveUnit] = useState(null); // To track the active unit submenu

  const toggleSidebar = () => {
    setIsClosed(!isClosed);
  };

  const toggleSubMenu = (index) => {
    // Toggle the main sub-menu, close others
    setActiveSubMenu(activeSubMenu === index ? null : index);
    setActiveUnit(null); // Close any unit submenus
  };

  const toggleUnitMenu = (unitIndex) => {
    // Toggle the specific unit submenu
    setActiveUnit(activeUnit === unitIndex ? null : unitIndex);
  };

  const units = [
    {
      title: 'Unit 1',
      subTopics: [
        { title: 'Bisection Method', link: '/bisection' },
        { title: 'Iteration Method', link: '/iteration' },
        { title: 'False Position Method', link: '/false-position' },
        { title: 'Newton-Raphson Method', link: '/newton-raphson' },
        { title: 'Gauss Seidel Method', link: '/gauss-seidel' },
      ],
    },
    {
      title: 'Unit 2',
      subTopics: [
        {
          title: 'Interpolation for Equal Intervals',
          subTopics: [
            { title: "Newton's Forward Formula", link: '/newton-foward' },
            { title: "Newton's Backward Formula", link: '/newton-backward' },
            { title: 'Gauss Forward Formula', link: '/gauss-forward' },
            { title: 'Gauss Backward Formula', link: '/gauss-backward' },
          ],
        },
        {
          title: 'Interpolation for Unequal Intervals',
          subTopics: [
            { title: "Newton's Divided Difference Formula", link: '/newton-divided' },
            { title: "Lagrange's Interpolation Formula", link: '/lagrange' },
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
            { title: 'Trapezoidal Rule', link: '/trapezoidal' },
            { title: "Simpson's 1/3 Rule", link: '/simpson-1-3' },
            { title: "Simpson's 3/8 Rule", link: '/simpson-3-8' },
            { title: "Boole's Rule", link: '/boole' },
            { title: "Weddle's Rule", link: '/weddle' },
          ],
        },
      ],
    },
    {
      title: 'Unit 4',
      subTopics: [
        { title: "Taylor's Series Method", link: '/taylor' },
        { title: "Euler's Method", link: '/euler' },
        { title: "Modified Euler's Method", link: '/modified-euler' },
        { title: "Runge-Kutta Methods", link: '/runge-kutta' },
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
          <Link href="#" className="icon-link">
            <img src="/home.svg" width="24" alt="Home" />
            <span className="link-name">Home</span>
          </Link>
        </li>
        <li>
          <Link href="/TrapezoidalRule" className="icon-link" onClick={() => toggleSubMenu(0)}>
            <img src="/page.svg" alt="Pages" />
            <span className="link-name">Pages</span>
            <img className="arrow" src="/arrow-down.svg" alt="arrow" />
          </Link>
          {activeSubMenu === 0 && (
            <ul className="sub-menu">
              {units.map((unit, index) => (
                <li key={index} onMouseEnter={() => toggleUnitMenu(index + 1)} onMouseLeave={() => toggleUnitMenu(null)}>
                  <Link href="#">{unit.title}</Link>
                  {activeUnit === index + 1 && (
                    <ul className="sub-menu">
                      {unit.subTopics.map((subTopic, subIndex) => (
                        <li key={subIndex}>
                          {typeof subTopic === 'string' ? (
                            <Link href={`/${subTopic.replace(/\s+/g, '-').toLowerCase()}`}>{subTopic}</Link>
                          ) : (
                            <>
                              <Link href="#">{subTopic.title}</Link>
                              {subTopic.subTopics && subTopic.subTopics.length > 0 && activeUnit === index + 1 && (
                                <ul>
                                  {subTopic.subTopics.map((subSubTopic, subSubIndex) => (
                                    <li key={subSubIndex}>
                                      <Link href={subSubTopic.link}>{subSubTopic.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
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
        <li>
          <Link href="#" className="icon-link" onClick={() => toggleSubMenu(1)}>
            <img src="/setting.svg" alt="Settings" />
            <span className="link-name">Settings</span>
            <img className="arrow" src="/arrow-down.svg" alt="arrow" />
          </Link>
          {activeSubMenu === 1 && (
            <ul className="sub-menu">
              {/* Sub-menu items for Settings */}
            </ul>
          )}
        </li>
        <li>
          <Link href="#" className="icon-link" onClick={() => toggleSubMenu(2)}>
            <img src="/notes.svg" alt="Notes" />
            <span className="link-name">Notes</span>
            <img className="arrow" src="/arrow-down.svg" alt="arrow" />
          </Link>
          {activeSubMenu === 2 && (
            <ul className="sub-menu">
              {/* Sub-menu items for Notes */}
            </ul>
          )}
        </li>
        <li>
          <Link href="#" className="icon-link" onClick={() => toggleSubMenu(3)}>
            <img src="/profile.svg" alt="Profile" />
            <span className="link-name">Profile</span>
            <img className="arrow" src="/arrow-down.svg" alt="arrow" />
          </Link>
          {activeSubMenu === 3 && (
            <ul className="sub-menu">
              {/* Sub-menu items for Profile */}
            </ul>
          )}
        </li>
        <li>
          <Link href="#" className="icon-link">
            <img src="/game.svg" alt="Playground" />
            <span className="link-name">Playground</span>
          </Link>
        </li>
      </ul>
      <div className="profile-details">
        <div className="profile-content">
          <img src="/icon.svg" alt="Profile" />
          <div className="name-job">
            <div className="name">Sulaiman Khan</div>
            <div className="job">Web Developer</div>
          </div>
        </div>
        <img src="/go.svg" alt="LinkedIn link" />
      </div>
      <div className={`menuToggle ${isClosed ? '' : 'active'}`} onClick={toggleSidebar}>
        <div className="toggle-bar"></div>
      </div>
    </div>
  );
};

export default Sidebar;
