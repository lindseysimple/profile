import { useState, useEffect } from 'react';
import React, { setGlobal, useDispatch, useGlobal } from 'reactn';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';
import NativeSelect from '@material-ui/core/NativeSelect';
import MaterialTable from 'material-table';


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
    width: '100%',
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
    width: '50%',
    marginLeft: theme.spacing(2),
    marginTop: '15px',
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
function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const CoreCommandForm = ({ rowData }) => {
  const classes = useStyles();
  const theme = useTheme();

  const [ deviceResources ] = useGlobal('deviceResources');
  const [ open, setOpen ] = useGlobal('open');

  const initialState = {
    name: '',    
    getPath: '/api/v1/device/{deviceId}/',  
    getResps: [],
    putPath: '/api/v1/device/{deviceId}/',
    paramNames: [],
    putResps: [],
  };

  const [state, setState] = useState(initialState);  
  const { name, getPath, getResps, putPath, paramNames, putResps } = state;      
  
  const [ rowIndex, setRowIndex ] = useState(-1);

  useEffect(() => {    
    if (rowData) {
      setState({
        name: rowData.name,
        getPath: rowData['get']['path'],
        getResps: rowData['get']['responses'],
        putPath: rowData['put']['path'],
        paramNames: rowData['put']['parameterNames'],
        putResps: rowData['put']['responses'],
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

  const columns = [
      { title: 'Response Code', 
        field: 'code',
        lookup: { 200: '200 OK', 400: '400 Bad Request', 404: '404 Not Found', 423: '423 Locked', 500: '500 Internal Server Error' } },

      { title: 'Description', field: 'description' },
      { title: 'Expected Values', field: 'expectedValues',
        editComponent: props =>           
          <Select
            multiple
            value={props.value ? props.value : []}
            onChange={ e => props.onChange(e.target.value)}
            input={<Input id="exp-vals" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value} label={value} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {deviceResources.map(deviceResource => (
              <MenuItem key={deviceResource.name} value={deviceResource.name} style={{fontWeight: theme.typography.fontWeightMedium}}>
                {deviceResource.name}
              </MenuItem>
            ))}
          </Select>
      },      
  ];
  const updateCoreCommand = useDispatch(
    (coreCommands) =>  {
      const getRspData = getResps.reduce((accumulator, resp) => {
           accumulator.push({code:resp.code, description: resp.description, expectedValues: resp.expectedValues})
           return accumulator;
        },
        []
      );
      const putRspData = putResps.reduce((accumulator, resp) => {
           accumulator.push({code:resp.code, description: resp.description, expectedValues: resp.expectedValues})
           return accumulator;
        },
        []
      );
      let newCoreCommand = [];      
      if (rowIndex === -1) {
        newCoreCommand = [...coreCommands, {
            name: name,
            get: {
              path: getPath,
              responses: getRspData
            },
            put: {
              path: putPath,
              parameterNames: paramNames,
              responses: putRspData
            },        
          }];
      }
      else {
      
        newCoreCommand = [...coreCommands.slice(0, rowIndex),
          {
            name: name,
            get: {
              path: getPath,
              responses: getRspData
            },
            put: {
              path: putPath,
              parameterNames: paramNames,
              responses: putRspData
            },        
          }, ...coreCommands.slice(rowIndex + 1)];
      }
      
      return newCoreCommand
    },
    'coreCommands'
  )

  const saveCommand = () => {    
    updateCoreCommand();
    setState({ ...initialState }); handleClose();
  }

  const [ coreCommands ] = useGlobal('coreCommands');  

  return (
    <div>
      <Dialog        
        fullWidth={false}
        maxWidth="md"
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">Core Command</DialogTitle>
        <DialogContent>        
          <TextField
            label="Core Command Name"
            className={classes.textField}
            value={name}
            onChange={(evt) => handleChange('name', evt)}
            margin="normal"
          />
          <h4>Get Methods</h4>
          <TextField
            label="Path"
            className={classes.textField}
            value={getPath}
            onChange={(evt) => handleChange('getPath', evt)}
            margin="normal"
          />
          <MaterialTable
              title="HTTP Responses"
              columns={columns}
              data={getResps}
              editable={{
                onRowAdd: newData =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      const data = [...getResps];
                      console.log('getResps data: ', data)
                      data.push(newData);
                      setState({ ...state, getResps: data });
                    }, 100);
                  }),
                onRowUpdate: (newData, oldData) =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      const data = getResps;                      
                      data[data.indexOf(oldData)] = { code: newData.code, description: newData.description, expectedValues: newData.expectedValues }; 
                      setState({ ...state, getResps: data });
                    }, 100);
                  }),
                onRowDelete: oldData =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      const data = [...state.data];
                      data.splice(data.indexOf(oldData), 1);
                      setState({ ...state, data });
                    }, 100);
                  }),
              }}
          />
          <h4>Put Methods</h4>
          <TextField
            label="Path"
            className={classes.textField}
            value={putPath}
            onChange={(evt) => handleChange('putPath', evt)}
            margin="normal"
          />
          <FormControl className={classes.formControl}>
            <InputLabel shrink htmlFor="param-name">
              Parameter Names
            </InputLabel>
            <Select
              multiple
              value={paramNames}              
              onChange={(evt) => handleChange('paramNames', evt)}
              input={<Input id="param-name" />}
              renderValue={selected => (
                <div className={classes.chips}>
                  {selected.map(value => (
                    <Chip key={value} label={value} className={classes.chip} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {deviceResources.map(deviceResource => (
                <MenuItem key={deviceResource.name} value={deviceResource.name} style={{fontWeight: theme.typography.fontWeightMedium}}>
                  {deviceResource.name}
                </MenuItem>
              ))}
            </Select>    
          </FormControl>
          <MaterialTable
              title="HTTP Responses"
              columns={columns}
              data={putResps}
              editable={{
                onRowAdd: newData =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      const data = putResps;
                      data.push(newData);
                      setState({ ...state, data });
                    }, 100);
                  }),
                onRowUpdate: (newData, oldData) =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      const data = putResps;                      
                      data[data.indexOf(oldData)] = newData;                      
                      setState({ ...state, putResps: data });
                    }, 100);
                  }),
                onRowDelete: oldData =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      const data = [...state.data];
                      data.splice(data.indexOf(oldData), 1);
                      setState({ ...state, data });
                    }, 100);
                  }),
              }}
            />
          
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
        </DialogContent>  
      </Dialog>
      <Fab variant="extended" color="primary" aria-label="add" className={classes.margin} onClick={handleAddCommand}>
        <AddIcon className={classes.extendedIcon} />
        Add Core Command
      </Fab>
    </div>
  );
}

export default CoreCommandForm;