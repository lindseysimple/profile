import React, {useEffect, useState} from 'react';
import { getGlobal, useGlobal } from 'reactn';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
  },
  backButton: {
    marginRight: theme.spacing(1),
    backgroundColor: '#8b9199',
    color: '#cedef2'
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formControl: {
    width: '60%',    
    margin: '25px',
  }
}));

const CloneProfileDiag = ({ backToList, originProfileName }) => {
  const classes = useStyles();
  const [ diagOpen, setDiagOpen ] = useState(false);

  const [ profiles, setProfiles ] = useGlobal('profiles');
  const { name, description, model, manufacturer, labels, deviceResources, selectedResource, deviceCommands, coreCommands } = getGlobal();
  const [ global, setGlobal ] = useGlobal();
console.log('global', global)
  const handleNameChange = event => {
    setGlobal({...global, name: event.target.value})
  };

  const handleClose = () => {
   // setRowData()
    setDiagOpen(false)
    backToList()
  }
  const updateProfile = () => {
    const deviceResourcesData = selectedResource.map(item => {
      const res = deviceResources.find(obj => obj.name === item)
      return { name: res.name, description: res.description, attributes: res.attributes, properties: res.properties }
    })

    const deviceCommandsData = deviceCommands.map(dc => {
      return { name: dc.name, get: dc.get, set: dc.set }
    })

    const coreCommandsData = coreCommands.map(cc => {
      return { name: cc.name, get: cc.get, put: cc.put }
    })
    const newProfile = {
      name: name,
      description: description,
      manufacturer: manufacturer,
      model: model,
      labels: labels,
      deviceResources: deviceResourcesData,
      deviceCommands: deviceCommandsData,
      coreCommands: coreCommandsData,
    };

      setProfiles([...profiles, newProfile]);
      fetch('http://localhost:3006/profiles', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newProfile)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Insert profile into DB successfully');
        //backToList()
        handleClose()
      })


  }
  useEffect(() => {

      setDiagOpen(true)

  }, [originProfileName]);
  return (
      <div>
        <Dialog open={diagOpen} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Clone Device Profile {originProfileName}</DialogTitle>
          <DialogContent>
            <TextField
                autoFocus
                margin="normal"
                id="name"
                label="New Device Profile Name"
                type="name"
                value={name}
                onChange={handleNameChange}
                fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={updateProfile} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
  );
}

export default CloneProfileDiag;
