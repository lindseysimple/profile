import { useState, useEffect } from 'react';
import React, { useGlobal } from 'reactn';

import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';

const ProfileInfo = () => {
  const [ global, setGlobal ] = useGlobal();
  const { name, description, manufacturer, model, labels } = global;
  const [ label, setLabel ] = useState('');

  const handleChange = (name) => e => {
    setGlobal({ ...global, [name]: e.target.value });
  }

  const handleLabelChange = (name) => e => setLabel(e.target.value)

  const addLabel = () => {
    const labelSet = new Set([...labels]);
    labelSet.add(label);    
    setGlobal({ ...global, labels: [...labelSet]});
    setLabel('');
  }
  const handleDelete = (labelIndex) => {    
    const newLabels = [...labels];
    newLabels.splice(labelIndex, 1);
    setGlobal({ ...global, labels: newLabels});
  }
  return (
    <div className="ProfileForm">
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          label="Profile Name"          
          value={name}
          onChange={handleChange('name')}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Description"          
          value={description}
          onChange={handleChange('description')}
          margin="normal"
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Manufacturer"          
          value={manufacturer}
          onChange={handleChange('manufacturer')}
          margin="normal"
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Model"          
          value={model}
          onChange={handleChange('model')}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <div className="labelDiv">
          <InputLabel shrink htmlFor="label-name">
            Label
          </InputLabel>
        </div>
        {labels.map((label, labelIndex) =>
          <Chip
            key={label}
            label={label}
            onDelete={() => handleDelete(labelIndex)}
            color="primary"
            variant="outlined"
          />
        )}
        <TextField
          label="Type label to add..."
          value={label}
          onChange={handleLabelChange('label')}
          margin="normal"
          onKeyPress={(e) => {if (e.key==='Enter') addLabel();}}
        />
      </Grid>
      <Grid item xs={3}>
        <div className="addLabelBtn">
          <Button onClick={addLabel}>
            Add
          </Button>
        </div>
      </Grid>
    </Grid>
    </div>
  );
}

export default ProfileInfo;