import React, { useState } from 'react'
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
function ReadMore({ text }) {
    const maxLength = 300; // Limite de 500 caractères
    const [isTruncated, setIsTruncated] = useState(true);
  
    const toggleTruncate = () => {
      setIsTruncated(!isTruncated);
    };
  return (
    <p>
      {isTruncated ? (
        <>
          {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
          {text.length > maxLength && (
            <ReadMoreIcon className='text-danger' onClick={toggleTruncate}>Read More</ReadMoreIcon>
          )}
        </>
      ) : (
        <>
          {text}
          <ExpandLessIcon className='text-danger' onClick={toggleTruncate}>Show Less</ExpandLessIcon>
        </>
      )}
    </p>
  )
}

export default ReadMore