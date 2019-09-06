import React from 'react';

import Navigation from './components/Navigation/Navigation';
import { StylesProvider } from "@material-ui/styles";

import './App.css';

function App() {
  return (
    <StylesProvider injectFirst>
      <div className="App">
        <Navigation />      
      </div>
    </StylesProvider>
  );
}

export default App;
