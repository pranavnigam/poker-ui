import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
import CreateRoom from './pages/CreateRoom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Room from './pages/Room';

function App() {
  const [issueList, setIssueList] = useState([]);

  useEffect(() => {

  }, []);

  const fetchIssue = () => {
    fetch('http://localhost:8080/api/login')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setIssueList(data);
      
    })
    .catch(error => {
      console.log(error);
    })
  }

  const Home = React.lazy(() => import('./pages/Home'));

  return (
    <Suspense fallback={<></>}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route path="/poker" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
