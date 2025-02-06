import React from 'react';

const LearnMoreButton = ({ text = "Read More" }) => {
  return (
    <>
      <style>
        {`
          .learn-more-btn .circle {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            background: linear-gradient(to right, #7c3aed, #4f46e5);
          }
          
          .learn-more-btn .circle .icon {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
          }
          
          .learn-more-btn .circle .icon.arrow {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
          }
          
          .learn-more-btn .circle .icon.arrow::before {
            content: "";
            position: absolute;
            top: -0.29rem;
            right: 0.0625rem;
            width: 0.625rem;
            height: 0.625rem;
            border-top: 0.125rem solid white;
            border-right: 0.125rem solid white;
            transform: rotate(45deg);
          }
          
          .learn-more-btn:hover .circle {
            width: 100%;
          }
          
          .learn-more-btn:hover .circle .icon.arrow {
            background: white;
            transform: translate(1rem, 0);
          }
          
          .learn-more-btn:hover .button-text {
            color: white;
          }

          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          .learn-more-btn .circle {
            background-size: 200% 200%;
            animation: gradientMove 3s ease infinite;
          }
        `}
      </style>

      <button className="learn-more-btn relative inline-block cursor-pointer outline-none border-0 align-middle bg-transparent p-0 font-inherit w-40">
        <span className="circle relative block m-0 w-12 h-12 rounded-full">
          <span className="icon arrow absolute top-0 bottom-0 my-auto left-2.5 w-4.5 h-0.5 bg-transparent"></span>
        </span>
        <span className="button-text absolute inset-0 py-3 pl-7 pr-0 text-indigo-600 font-medium text-sm leading-relaxed text-center transition-all duration-450">
          {text}
        </span>
      </button>
    </>
  );
};

export default LearnMoreButton;