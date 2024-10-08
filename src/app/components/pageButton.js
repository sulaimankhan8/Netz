import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {useState}   from 'react';

const PageButton = ({ route, float, st }) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  // Function to handle page navigation
  const goToNextPage = () => {
    const nextPage = 2; // Static for now, can be dynamic based on requirement
    router.push(`${route}?page=${nextPage}`);
  };

  // Define dynamic classes based on 'st' value
  const buttonClasses = (() => {
    switch (st) {
      case 'next':
      case 'prev':
        return 'bg-violet-500 hover:bg-violet-400';
      case 'home':
        return 'bg-green-500 hover:bg-green-400';
      case 'sib':
        return 'bg-purple-500 hover:bg-purple-400';
      default:
        return 'bg-blue-500 hover:bg-blue-400'; // Fallback default color
    }
  })();
  const imgSrc = (() => {
    switch (st) {
      case 'next':
        return '/next.svg';
      case 'prev':
        return '/prev.svg';
      case 'home':
        return 'home.svg';
      case 'sib':
        return '';
      default:
        return 'home.svg';
    }
  })();

  return (<div className={`relative  inline ${float}`}>
    <button
      onClick={goToNextPage}
      className={`${buttonClasses} text-white font-semibold px-4 py-2 rounded transition `}
       onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
     
    >
      
      {imgSrc ? (
          <Image src={imgSrc} alt={st} width={25} height={25}/>
        ) : (
          <span>{st}</span>
        )}
    </button>
    {hovered && st && (
        <div className="absolute overflow-visible bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-sm rounded shadow-lg">
          {st}
        </div>
      )}
  </div>);
};

export default PageButton;
