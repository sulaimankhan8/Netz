import html2canvas from 'html2canvas';
import { useState } from 'react';
import TButton from '../components/TButton';

const ExportToPNG= ({ elementId, fileName, tooltipText, color, altText, imgSrc, float,className }) => {
  const [showMessage, setShowMessage] = useState(false);

  const exportToPNG = () => {
    const element = document.getElementById(elementId);
    if (element.tagName === 'CANVAS') {
      const link = document.createElement('a');
      link.href = element.toDataURL('image/png');
      link.download = fileName;
      link.click();
    } else {
      html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = fileName;
        link.click();
      });
    }
    showCopied();
  };

  const showCopied = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  return (
    <div>
      <TButton onClick={exportToPNG}
      tooltipText={tooltipText}
      color={color}
      imgSrc="/copy.svg"
      float={float}
      altText={altText}
      
       className={className}>
        
      </TButton>
      {showMessage && <div style={{
        display: showMessage ? 'block' : 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px',
        position: 'fixed',
        bottom: '30px',
        right: '20px',
        borderRadius: '5px'}}>Copied!</div>}
    </div>
  );
};

export default ExportToPNG;
