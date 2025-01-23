import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/users/verify-email/${token}`);
        if (response.status === 200) {
          setIsLoading(false);
          setTimeout(() => {
            navigate('/login'); // Redirect to login page after 3 seconds
          }, 3000);
        }
      } catch (err) {
        console.error('Error verifying email:', err);
        setError('Verification failed. Invalid or expired token.');
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div>
        <h2>Verifying Email...</h2>
        <p>Please wait while we verify your email.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Verification Failed</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Email Verified Successfully!</h2>
      <p>You will be redirected to the login page shortly.</p>
    </div>
  );
};

export default VerifyEmail;
