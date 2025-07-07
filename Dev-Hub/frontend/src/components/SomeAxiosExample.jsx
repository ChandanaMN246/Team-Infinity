import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Bonus: Example of using axiosInstance for protected API calls
const SomeAxiosExample = () => {
  // Uncomment axiosInstance in AuthContext to use this
  // const { axiosInstance } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setResult(null);
    try {
      // Uncomment the next line if axiosInstance is enabled in AuthContext
      // const response = await axiosInstance.get('/projects/');
      // setResult(response.data);
      setError('Uncomment axiosInstance in AuthContext to use this example.');
    } catch (err) {
      setError('Request failed');
    }
  };

  return (
    <div>
      <button onClick={handleClick} className="px-4 py-2 bg-blue-500 text-white rounded-md">Test Axios Protected Call</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default SomeAxiosExample; 