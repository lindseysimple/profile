import React, { setGlobal } from 'reactn';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

fetch('http://localhost:3006/profiles')
  .then(response => response.json())
  .then(data => {
    const profiles = data.map(value => value['info']);
    console.log('profiles', profiles);
    setGlobal({
      name: '',
      description: '',
      manufacturer: '',
      model: '',
      labels: [],
      deviceResources: [],
      deviceCommands: [],
      coreCommands: [],
      open: false,
      profiles: profiles
    });
  })

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
/*
    {
      name: 'test',
      description: 'test description',
      manufacturer: 'test',
      model: 'test',
      labels: [ 'test', 'modbus' ]
    }
*/