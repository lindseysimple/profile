import { useState, useEffect } from 'react';
import React, { setGlobal, useDispatch, useGlobal } from 'reactn';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import './ResourceSelect.css'

const useStyles = makeStyles(theme => ({
  dialog: {
    width: '50%'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: '80%',
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  button: {
    margin: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  formControl: {
    width: '80%',
    margin: '15px',
  },
  chip: {
    margin: 2,
  },
}));


const ResourceSelect = ({ rowData }) => {
  const classes = useStyles();

  const [ deviceResources, setResources ] = useGlobal('deviceResources');
  const [ selectedResource, setSelectedResource] = useGlobal('selectedResource');
  console.log('deviceResources',deviceResources)
  const handleDelete = chipToDelete => () => {
    setSelectedResource(chips => chips.filter(chip => chip !== chipToDelete));
  };

  const handleToggle = value => () => {
    const currentIndex = selectedResource.indexOf(value);
    const newChecked = [...selectedResource];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedResource(newChecked);
  };

  useEffect(() => {
    const fetchResource = async () => {
      const response = await fetch('http://localhost:3006/resources');
      const result = await response.json()
      return  result;
    }
    fetchResource().then(data => {
      const resources = data.map(item => item.info)
      setResources(resources)
    });
  }, []);

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h4>Select Device Resource</h4>
          <FormControl className={classes.formControl}>
            <div className="chipSection">
              {selectedResource.map(data => {
                return (
                    <Chip size="small"
                        variant="outlined" color="primary"
                        key={data}
                        label={data}
                        onDelete={handleDelete(data)}
                    />
                );
              })}
            </div>
            <List className={classes.root}>
              {deviceResources.map(value => {
                const labelId = `checkbox-list-label-${value.name}`;
                return (
                  <ListItem key={value.name} role={undefined} dense button onClick={handleToggle(value.name)}>
                    <ListItemIcon>
                      <Checkbox
                          edge="start"
                          checked={selectedResource.indexOf(value.name) !== -1}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={value.name} />
                  </ListItem>
                );
              })}
            </List>
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
}

export default ResourceSelect;