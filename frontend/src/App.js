import React from 'react';
import { BrowserRouter } from 'react-router-dom'; 
import Routing from './utils/routing/Routing'; 

function App() {
  return (
    <BrowserRouter>  
      <Routing />  
    </BrowserRouter>
  );
}

export default App;
