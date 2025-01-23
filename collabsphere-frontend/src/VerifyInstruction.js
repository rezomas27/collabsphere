import React from 'react';
import { Link } from 'react-router-dom';

const VerifyInstruction = () => {
  return (
    <div>
      <h2>Verify Your Email</h2>
      <p>A verification link has been sent to your email. Please check your inbox to verify your email address.</p>
      <Link to="/">Return to Homepage</Link>
    </div>
  );
};

export default VerifyInstruction;
