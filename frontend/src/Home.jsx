import { useState } from 'react';
import AuthToggle from './components/AuthToggle';
import TaskManager from './components/TaskManager';
import { Toaster } from 'react-hot-toast';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('user')
  );

  return (
    <>
      {isAuthenticated ? <TaskManager /> : <AuthToggle />}
      <Toaster />
    </>
  );
}

export default Home;