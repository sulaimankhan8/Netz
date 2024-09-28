import { useEffect, useState } from 'react';
import Lottie from 'react-lottie';

const LottieAnimation = ({ src, height = 300, width = 300, loop = true, autoplay = true }) => {
  const [animationData, setAnimationData] = useState(null);

  // Load animation data dynamically
  useEffect(() => {
    const loadAnimation = async () => {
      const response = await fetch(src);  // Dynamically fetch the JSON file
      const data = await response.json();
      setAnimationData(data);
    };

    loadAnimation();
  }, [src]);

  const defaultOptions = {
    loop,
    autoplay,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Don't render Lottie until the animationData is loaded
  if (!animationData) return null;

  return (
    <div>
      <Lottie options={defaultOptions} height={height} width={width} />
    </div>
  );
};

export default LottieAnimation;
