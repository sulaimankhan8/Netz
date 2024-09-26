/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
   darkMode: 'class',
  theme: {
    extend: {
      
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
      },
    },
    variants: {
      extend: {
        boxShadow: ['hover'], // Enable hover variants for shadow
      },
    },
  }

