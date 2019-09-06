import { useState, useEffect } from 'react';
import React, { setGlobal, useDispatch, useGlobal } from 'reactn';

import Fab from '@material-ui/core/Fab';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Chip from '@material-ui/core/Chip';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

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
  }
}));

const DeviceResourceForm = ({ rowData }) => {  
  const classes = useStyles();
  const initialState = {
    name: '',
    description: '', 
    primaryTable: '',
    startingAddress: '',
    permission: ['R'],
    dataType: '',
    size: '',
    scale: '',
    min: '',
    max: '',
    defaultVal: 0,
    unit: ''
  };

  const [state, setState] = useState(initialState);    
  const { name, description, primaryTable, startingAddress, dataType, permission, unit, size, scale, min, max, defaultVal } = state;
  const [ rowIndex, setRowIndex ] = useState(-1);
  
  const [ deviceResources ] = useGlobal('deviceResources');
  const [ open, setOpen ] = useGlobal('open');  

  useEffect(() => {    
    if (rowData) {      
      const { name, description, attributes, properties } = rowData;    
      const { primaryTable, startingAddress } = attributes;      
      const { units, value } = properties;
      setState({
        name: name,
        description: description,
        primaryTable: primaryTable,
        startingAddress: startingAddress,
        permission: value['readWrite'].split(''),
        dataType: value['type'], 
        size: value['size'],
        scale: value['scale'],
        min: value['minimum'],
        max: value['maximum'],
        defaultVal: value['defaultValue'],
        unit: units['defaultValue']
      });
      setRowIndex(rowData['tableData']['id']);
    }
  }, [rowData]);

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.value });
  };

  const handleMultiSelectChange = (name, event) => {    
    setState({ ...state, [name]: event.target.value})
  }

  const handleAdd = () => {
    setState(initialState);
    setRowIndex(-1);
    setOpen(true);
  }
  
  const handleClose = () =>setOpen(false)  
  
  const addResource = useDispatch(
    (deviceResources) =>  [...deviceResources, {
        name: name,
        description: description,
        attributes: {
          primaryTable: primaryTable,
          startingAddress: startingAddress,
        },
        properties: {
          value: {
            type: dataType, 
            readWrite: permission.join(''), 
            size: size, 
            scale: scale,
            minimum: min,
            maximum: max,
            defaultValue: defaultVal
          },
          units: { 
            type: "String", 
            readWrite: "R", 
            defaultValue: unit
          }
        }
      }
    ],
    'deviceResources',
  )
  
  return (
    <div>
      <Dialog        
        fullWidth={false}
        maxWidth="md"
        open={open}
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle>Device Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Device Resource Name"
                className={classes.textField}
                value={name}
                onChange={handleChange('name')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField                
                label="Description"
                className={classes.textField}
                value={description}
                onChange={handleChange('description')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <h3>Attributes</h3>
              <Divider variant="middle" />
            </Grid>
            <Grid item xs={6}>

              <FormControl className={classes.formControl}>
                <InputLabel shrink htmlFor="primaryTable-placeholder">
                  Primary Table
                </InputLabel>
                <NativeSelect
                  value={primaryTable}
                  onChange={handleChange('primaryTable')}
                  input={<Input name="primaryTable" />}
                >
                  <option value="HOLDING_REGISTERS">HOLDING_REGISTERS</option>
                  <option value="COILS">COILS</option>
                  <option value="INPUT_REGISTERS">INPUT_REGISTERS</option>
                  <option value="INPUT_STATUS">INPUT_STATUS</option>
             
                </NativeSelect>             
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Starting Address"
                className={classes.textField}
                value={startingAddress}
                onChange={handleChange('startingAddress')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <h3>Properties</h3>
              <Divider variant="middle" />
            </Grid>
            <Grid item xs={6}>
              <FormControl className={classes.formControl}>
                <InputLabel shrink htmlFor="age-native-label-placeholder">
                  Data Type
                </InputLabel>
                <NativeSelect
                  value={dataType}
                  onChange={handleChange('dataType')}
                  input={<Input name="dataType" />}
                >
                  <option value="BOOL">BOOL</option>
                  <option value="FLOAT32">FLOAT32</option>
                  <option value="FLOAT64">FLOAT64</option>
                  <option value="INT16">INT16</option>
                  <option value="INT32">INT32</option>
                  <option value="INT64">INT64</option>
                  <option value="UINT16">UINT16</option>
                  <option value="UINT32">UINT32</option>
                  <option value="UINT64">UINT64</option>          
                </NativeSelect>             
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className={classes.formControl}>
                <InputLabel shrink htmlFor="param-name">
                  Permission
                </InputLabel>
                <Select
                  multiple
                  value={permission}
                  onChange={ e => handleMultiSelectChange('permission', e)}
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
                  <MenuItem key='R' value='R' style={{fontWeight:'14px'}}>
                    Read
                  </MenuItem>
                  <MenuItem key='W' value='W' style={{fontWeight: '14px'}}>
                    Write
                  </MenuItem>
                </Select>
              </FormControl>
          </Grid>
            <Grid item xs={6}>
              <TextField                
                label="Data Unit"
                className={classes.textField}
                value={unit}
                onChange={handleChange('unit')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField                
                label="Size"
                className={classes.textField}
                value={size}
                onChange={handleChange('size')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField                
                label="Scale"
                className={classes.textField}
                value={scale}
                onChange={handleChange('scale')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField                
                label="Default Value"
                className={classes.textField}
                value={defaultVal}
                onChange={handleChange('defaultVal')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField              
                label="Minimum"
                className={classes.textField}
                value={min}
                onChange={handleChange('min')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Maximum"
                className={classes.textField}
                value={max}
                onChange={handleChange('max')}
                margin="normal"
              />
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
              onClick={() => {addResource(); setState({ ...initialState }); handleClose();}} >
              Save
            </Button>
          </Grid>
        </DialogContent>  
      </Dialog>
      <Fab variant="extended" color="primary" aria-label="add" className={classes.margin} onClick={handleAdd}>
        <AddIcon className={classes.extendedIcon} />
        Add Device Resource
      </Fab>
    </div>
  );
}

export default DeviceResourceForm;