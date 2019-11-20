import { useState, useEffect } from 'react';
import React, { setGlobal, useDispatch, useGlobal } from 'reactn';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const DeviceCommandForm = ({ rowData }) => {  
  const classes = useStyles();
  const theme = useTheme();
  const initialState = {
    name: '',    
    setResourceNames: [],
    getResourceNames: [],
  };

  const [ state, setState ] = useState(initialState);  
  const { name, setResourceNames, getResourceNames } = state;
  const [ rowIndex, setRowIndex ] = useState(-1);
  
  const [ deviceResources ] = useGlobal('deviceResources');
  const [ selectedResource ] = useGlobal('selectedResource');
  const [ open, setOpen ] = useGlobal('open');

  useEffect(() => {    
    if (rowData) {
      const setData = rowData['set'].length > 0 ? rowData['set'].reduce((acc, val) =>{
          acc.push(val.parameter);          
          return acc;
        }, []) : [];      
      const getData = (rowData['get'].length > 0) ? rowData['get'].reduce((acc, val) => {
          acc.push(val.parameter);
          return acc;
        }, []) : [];
      setState({
        name: rowData.name,
        setResourceNames: setData,
        getResourceNames: getData,
      });
      setRowIndex(rowData['tableData']['id']);
    }
  }, [rowData]);

  const handleChange = (name, event) => {    
    setState({ ...state, [name]: event.target.value})
  }
    
  const handleAddCommand = () => {
    setState(initialState);
    setRowIndex(-1);
    setOpen(true);
  }
  
  const handleClose = () => setOpen(false)
  
  const addCommand = useDispatch(
    (deviceCommands) =>  {
      const setOperations = setResourceNames.map((name, index) => {
        return { index: (index + 1).toString(), operation: "set", object: name, parameter: name }
      });
      const getOperations = getResourceNames.map((name, index) => {
        return { index: (index + 1).toString(), operation: "get", object: name, parameter: name }
      });
      let newDeviceCommand = [];
      if (rowIndex === -1) {
        newDeviceCommand = [...deviceCommands, {
          name: name,
          set: setOperations,
          get: getOperations,        
        }];
      }
      else {
        newDeviceCommand = [...deviceCommands.slice(0, rowIndex), {
            name: name,
            set: setOperations,
            get: getOperations,       
          }, ...deviceCommands.slice(rowIndex + 1)
        ];
      }
      return newDeviceCommand
    },
    'deviceCommands'
  )

  const saveCommand = () => {    
    addCommand();
    setState({ ...initialState }); handleClose();
  }

  return (
    <div>
      <Dialog        
        fullWidth={false}
        maxWidth="md"
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">Device Command</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Device Command Name"
                className={classes.textField}
                value={name}
                onChange={(evt) => handleChange('name', evt)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <h4>Set Methods</h4>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="select-multiple-chip">Device Resource</InputLabel>
                <Select
                  multiple
                  value={setResourceNames}
                  onChange={(evt) => handleChange('setResourceNames', evt)}
                  input={<Input id="select-multiple-chip" />}
                  renderValue={selected => (
                    <div className={classes.chips}>
                      {selected.map(value => (
                        <Chip key={value} label={value} className={classes.chip} />
                      ))}
                    </div>
                  )}
                  MenuProps={MenuProps}
                >
                  {selectedResource.map(deviceResource => (
                      <MenuItem key={deviceResource} value={deviceResource} style={{fontWeight: theme.typography.fontWeightRegular}}>
                        {deviceResource}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <h4>Get Methods</h4>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="get-resource-name">Device Resource</InputLabel>
                <Select
                  multiple
                  value={getResourceNames}
                  onChange={(evt) => handleChange('getResourceNames', evt)}
                  input={<Input id="get-resource-name" />}
                  renderValue={selected => (
                    <div className={classes.chips}>
                      {selected.map(value => (
                        <Chip key={value} label={value} className={classes.chip} />
                      ))}
                    </div>
                  )}
                  MenuProps={MenuProps}
                >
                  {selectedResource.map(deviceResource => (
                    <MenuItem key={deviceResource} value={deviceResource} style={{fontWeight: theme.typography.fontWeightRegular}}>
                      {deviceResource}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justify="flex-end"
            alignItems="flex-end"
          >
            <Button variant="contained" className={classes.button} onClick={handleClose} >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              className={classes.button}
              onClick={saveCommand}            
            >
              Save
            </Button>          
          </Grid>
        </DialogContent>  
      </Dialog>
      <Fab variant="extended" color="primary" aria-label="add" className={classes.margin} onClick={handleAddCommand}>
        <AddIcon className={classes.extendedIcon} />
        Add Device Command
      </Fab>
    </div>
  );
}

export default DeviceCommandForm;