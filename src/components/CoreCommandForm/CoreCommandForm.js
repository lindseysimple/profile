import { useState, useEffect } from 'react';
import React, { useDispatch, useGlobal } from 'reactn';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import MaterialTable from 'material-table';

import Combobox from 'react-widgets/lib/Combobox'

import 'react-widgets/dist/css/react-widgets.css';
import Grid from "@material-ui/core/Grid";

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

const CoreCommandForm = ({ rowData }) => {
  const classes = useStyles();
  const theme = useTheme();

  const [ deviceResources ] = useGlobal('deviceResources');
  const [ open, setOpen ] = useGlobal('open');

  const initialState = {
    name: '',    
    path: '/api/v1/device/{deviceId}/',
    //getResps: [],
    getResps: [{code: '200', description: 'Success', expectedValues: []},
               {code: '500', description: 'Failed transaction', expectedValues: []}],
    paramNames: [],
    putResps: [{code: '200', description: 'Success', expectedValues: []},
               {code: '500', description: 'Failed transaction', expectedValues: []}]
  };

  const [state, setState] = useState(initialState);  
  const { name, path, getResps, paramNames, putResps } = state;
  const [ rowIndex, setRowIndex ] = useState(-1);

  const [ selectedResource ] = useGlobal('selectedResource');
  const [ deviceCommands ] = useGlobal('deviceCommands');

  const resourceNames = selectedResource.map(data => ({ name: data, source: 'Device Resource' }))
  const devCmdNames = deviceCommands.map(data => ({name: data.name, source: 'Device Command' }))
  const cmdNames =   resourceNames.concat(devCmdNames);

  useEffect(() => {    
    if (rowData) {
      setState({
        name: rowData.name,
        path: rowData['get']['path'],
        getResps: rowData['get']['responses'],
        paramNames: rowData['put']['parameterNames'],
        putResps: rowData['put']['responses'],
      });
      setRowIndex(rowData['tableData']['id']);
    }
  }, [rowData]);

  const handleCmdNameChange = (value) => {
    let setParams;
    if (value.source === 'Device Command') {
      const selectedDC = deviceCommands.find(dc => dc.name === value.name)
      setParams = selectedDC.set.map(set=>set.parameter)
    }
    else
      setParams = [ value.name ]
    setState({ ...state, 'name': value.name, path: path.slice(0, path.lastIndexOf('/') + 1).concat(value.name), paramNames: setParams })
  }

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
           accumulator.push({code:resp.code, description: resp.description, expectedValues: []})
           return accumulator;
        },
        []
      );
      let newCoreCommand = [];      
      if (rowIndex === -1) {
        newCoreCommand = [...coreCommands, {
            name: name,
            get: {
              path: path,
              responses: getRspData
            },
            put: {
              path: path,
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
              path: path,
              responses: getRspData
            },
            put: {
              path: path,
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
          <div className="selectDiv">
            <InputLabel shrink htmlFor="label-name">
                Select Device Resource or Device Command
            </InputLabel>
          </div>
          <Combobox
            data={cmdNames}
            caseSensitive={false}
            textField='name'
            valueField='name'
            filter='contains'
            onChange={handleCmdNameChange}
            groupBy='source'
            value={name}
            />
          <h4>Get Methods</h4>
          <TextField
            label="Path"
            className={classes.textField}
            value={path}
            onChange={(evt) => handleChange('path', evt)}
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
            value={path}
            onChange={(evt) => handleChange('path', evt)}
            margin="normal"
          />
          <FormControl className={classes.formControl}>
            <InputLabel shrink htmlFor="param-name">
              Parameter Names
            </InputLabel>
            <div className="chipSection">
              {paramNames.map((label) =>
                <Chip
                  key={label}
                  label={label}
                  color="primary"
                  variant="outlined"
                />
              )}
            </div>
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