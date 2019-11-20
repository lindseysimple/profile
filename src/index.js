import React, { setGlobal } from 'reactn';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

const fetchData = async () => {
  const resources = await fetch('http://localhost:3006/resources');
  const resourcesJson = await resources.json()
  const resData = resourcesJson.map(item => {
    return {...item.info, protocol: item.protocol}
  })
  const profiles = await fetch('http://localhost:3006/profiles');
  const profilesJson = await profiles.json()
  const profilesInfo = profilesJson ? profilesJson.map(value => value['info']) : [];
  return { res: resData, profiles: profilesInfo };
}

fetchData()
  .then(data => {
    setGlobal({
      name: '',
      description: '',
      manufacturer: '',
      model: '',
      labels: [],
      deviceResources: data.res,
      selectedResource: [],
      deviceCommands: [],
      coreCommands: [],
      open: false,
      profiles: data.profiles?data.profiles:[]
    })
  })
  .catch(err => console.log('Err:', err))

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
