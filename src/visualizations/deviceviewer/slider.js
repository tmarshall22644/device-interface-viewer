import React from 'react';

const Slider = ({ min, max, step, value, onChange }) => {
  const handleChange = (event) => {
        // if (event.type === "mouseup") {
            const newValue = parseInt(event.target.value, 10);
            // console.log("Test: ", event);
        onChange(newValue);
        // }
  };
//   const handleRelease = (event) => {
//     if (onRelease) {
//         const newValue = parseInt(event.target.value, 10);
//         onRelease(newValue);
//     }
//   };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
    //   onRelease={handleRelease}
    />
  );
};

export default Slider;
