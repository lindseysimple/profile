import { getGlobal, setGlobal } from "reactn";

import yaml from 'js-yaml';

const updateProfile = (profileContent) => {
    yaml.safeLoadAll(profileContent, function (newProfile) {
        const global = getGlobal();
        setGlobal({...global, profiles: [...global.profiles, newProfile]})
          .then(data=> {
            fetch('http://localhost:3006/profiles', {
              method: 'post',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(newProfile)
            })
              .then(response => response.json())
              .then(data => {
                console.log('Insert profile into DB successfully');
              })
          })
    });
}

export default updateProfile;