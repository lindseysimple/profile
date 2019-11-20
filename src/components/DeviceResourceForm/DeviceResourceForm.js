import { useState, useEffect } from 'react';
import React, { setGlobal, useDispatch, useGlobal } from 'reactn';

import Checkbox from '@material-ui/core/Checkbox';
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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";

import './DeviceResource.css'
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

const dataTypeOpts = [ 'BOOL', 'FLOAT32', 'FLOAT64', 'INT16', 'INT32', 'INT64', 'UINT16', 'UINT32', 'UINT64']

const getSteps = () => ['Protocol Type', 'Device Resource Information']

const DeviceResourceForm = ({ rowData, prt, handleUpdateRes }) => {
  const classes = useStyles();
  const initialState = {
    name: '',
    description: '', 
    primaryTable: 'HOLDING_REGISTERS',
    startingAddress: '',
    permission: ['R'],
    dataType: 'INT16',
    size: '',
    base: '',
    scale: '',
    offset: '',
    min: '',
    max: '',
    defaultVal: 0,
    unit: '',
    isByteSwap: false,
    isWordSwap: false,
    rawType: ''
  };

  const [state, setState] = useState(initialState);    
  const { name, description, primaryTable, startingAddress, dataType, permission, unit, size, base, scale, offset, min, max, defaultVal, isByteSwap, isWordSwap, rawType } = state;
  const [ rowIndex, setRowIndex ] = useState(-1);
  const [ nameFieldErr, setNameFieldErr ] = useState(false);
  const [ nameHelperText, setNameHelperText ] = useState('')
  const [ activeStep, setActiveStep] = useState(0);

  const [ deviceResources ] = useGlobal('deviceResources');
  const [ open, setOpen ] = useGlobal('open');

  const steps = getSteps();

  useEffect(() => {
    if (rowData) {
      const { name, description, attributes, properties } = rowData;
      const { primaryTable, startingAddress, isByteSwap, isWordSwap, rawType } = attributes;
      const { units, value } = properties;
      setState({
        name: name,
        description: description,
        primaryTable: primaryTable,
        startingAddress: startingAddress,
        isByteSwap: isByteSwap ? isByteSwap : false,
        isWordSwap: isWordSwap ? isWordSwap : false,
        rawType: rawType ? rawType : '',
        permission: value['readWrite'].split(''),
        dataType: value['type'], 
        size: value['size'],
        base: value['base'],
        scale: value['scale'],
        offset: value['offset'],
        min: value['minimum'],
        max: value['maximum'],
        defaultVal: value['defaultValue'],
        unit: units['defaultValue'],
      });
      setRowIndex(rowData['tableData']['id']);
      console.log('rowIndex', rowIndex)
    }
    else
      setState(initialState)
  }, [rowData]);

  const checkValidation = (name, value) => {
    if (name ==='name') {
      if (deviceResources.some(dr => dr.name === value)) {
        setNameFieldErr(true)
        setNameHelperText('Name already exist')
      }
      else {
        setNameFieldErr(false)
        setNameHelperText('')
      }
    }
  }
  const handleChange = name => event => {
    checkValidation(name, event.target.value)
      setState({ ...state, [name]: event.target.value });
  };

  const handleMultiSelectChange = (name, event) => {    
    setState({ ...state, [name]: event.target.value})
  }

  const handleToggleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const handleAdd = () => {
    setState(initialState);
    setRowIndex(-1);
    setOpen(true);
  }
  
  const handleClose = () => {
    setOpen(false)
    setRowIndex(-1)
  }
  
  const addDeviceRes = useDispatch(
    (deviceResources) =>  [...deviceResources, {
        name: name,
        description: description,
        attributes: {
          primaryTable: primaryTable,
          startingAddress: startingAddress,
          rawType: rawType,
          isByteSwap: isByteSwap,
          isWordSwap: isWordSwap
        },
        properties: {
          value: {
            type: dataType, 
            readWrite: permission.join(''), 
            size: size, 
            scale: scale,
            base: base,
            offset: offset,
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

  const addResource = () => {
    const newResource = {
        name: name,
        description: description,
        attributes: {
          primaryTable: primaryTable,
          startingAddress: startingAddress,
          rawType: rawType
        },
        properties: {
          value: {
            type: dataType, 
            readWrite: permission.join(''),
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

    if (rawType)
      newResource['attributes']['rawType'] = rawType
    if (isByteSwap)
      newResource['attributes']['isByteSwap'] = isByteSwap
    if (isWordSwap)
      newResource['attributes']['isWordSwap'] = isWordSwap
    if (size !== '')
      newResource['properties']['value']['size'] = size
    if (base !== '')
      newResource['properties']['value']['base'] = base
    if (scale !== '')
      newResource['properties']['value']['scale'] = scale
    if (offset !== '')
      newResource['properties']['value']['offset'] = offset

    //addDeviceRes();
    if (rowIndex === -1) {
      fetch(`http://localhost:3006/resources/${prt}`, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newResource)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Insert device resource into DB successfully');
        handleUpdateRes({...newResource, protocol: prt})
      });
    }
    else {
      fetch('http://localhost:3006/resources', {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(newResource), // body data type must match "Content-Type" header
      })
        .then(response => response.json())
        .then(data => {
          console.log('Update device resource into DB successfully');
          handleUpdateRes({...newResource, protocol: prt}, rowIndex)
        });
    }
  }

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    if (activeStep === steps.length - 1) {
      addResource();
      setState({ ...initialState });
      handleClose();
      setActiveStep(0)
    }
  }

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <FormControl className={classes.formControl}>
            <InputLabel shrink htmlFor="age-native-label-placeholder">
                Device Protocol Type
            </InputLabel>
            <NativeSelect
                value="modbus"
                input={<Input name="prtType" />}
            >
              <option value="modbus">Modbus</option>
              <option value="OPCUA">OPCUA</option>
              <option value="BACNET-ip">BACNET-ip</option>
              <option value="BACNET-mstp">BACNET-mstp</option>
            </NativeSelect>
          </FormControl>
        );
        case 1:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Device Resource Name"
                  className={classes.textField}
                  value={name}
                  onChange={handleChange('name')}
                  margin="normal"
                  error={nameFieldErr}
                  helperText={nameHelperText}
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
                  <Divider variant="middle"/>
              </Grid>
              <Grid item xs={6}>
                <FormControl className={classes.formControl}>
                  <InputLabel shrink htmlFor="primaryTable-placeholder">
                    Primary Table
                  </InputLabel>
                  <NativeSelect
                    value={primaryTable}
                    onChange={handleChange('primaryTable')}
                    input={<Input name="primaryTable"/>}
                  >
                    <option value="HOLDING_REGISTERS">HOLDING REGISTERS</option>
                    <option value="COILS">COILS</option>
                    <option value="INPUT_REGISTERS">INPUT REGISTERS</option>
                    <option value="DISCRETES_INPUT">DISCRETES INPUT</option>
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
              <Grid item xs={6}>
                  <FormControlLabel
                      value="isByteSwap"
                      control={<Checkbox color="primary" checked={isByteSwap} onChange={handleToggleChange('isByteSwap')}/>}
                      label="Byte Swap"
                      labelPlacement="start"
                  />
                  <FormControlLabel
                      value="isWordSwap"
                      control={<Checkbox color="primary" checked={isWordSwap} onChange={handleToggleChange('isWordSwap')}/>}
                      label="Word Swap"
                      labelPlacement="start"
                  />
              </Grid>
              <Grid item xs={6}>
                <FormControl className={classes.formControl}>
                  <InputLabel shrink htmlFor="rawType-placeholder">
                    Raw Type
                  </InputLabel>
                  <NativeSelect
                    value={rawType}
                    onChange={handleChange('rawType')}
                    input={<Input name="rawType"/>}
                  >
                    <option value="">none</option>
                    <option value="INT16">INT16</option>
                    <option value="UINT16">UINT16</option>
                  </NativeSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                  <h3>Properties</h3>
                  <Divider variant="middle"/>
              </Grid>
              <Grid item xs={6}>
                <FormControl className={classes.formControl}>
                  <InputLabel shrink htmlFor="age-native-label-placeholder">
                    Data Type
                  </InputLabel>
                  <NativeSelect
                    value={dataType}
                    onChange={handleChange('dataType')}
                    input={<Input name="dataType"/>}
                  >
                    { dataTypeOpts.map(opt => <option value={opt}>{opt}</option>) }
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
                          onChange={e => handleMultiSelectChange('permission', e)}
                          input={<Input id="exp-vals"/>}
                          renderValue={selected => (
                              <div className={classes.chips}>
                                  {selected.map(value => (
                                      <Chip key={value} label={value} className={classes.chip}/>
                                  ))}
                              </div>
                          )}
                          MenuProps={MenuProps}
                      >
                          <MenuItem key='R' value='R' style={{fontWeight: '14px'}}>
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
                      label="Size"
                      className={classes.textField}
                      value={size}
                      onChange={handleChange('size')}
                      margin="normal"
                  />
              </Grid>
              <Grid item xs={6}>
                  <TextField
                      label="Default Value"
                      className={classes.textField}
                      value={defaultVal}
                      onChange={handleChange('defaultVal')}
                      margin="normal"
                  />
              </Grid>
              {dataType !== 'BOOL' &&
                <Grid container spacing={5} className='numGridContainer'>
                  <Grid item xs={4}>
                    <TextField
                      label="Base"
                      className={classes.textField}
                      value={base}
                      onChange={handleChange('base')}
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
                      label="Offset"
                      className={classes.textField}
                      value={offset}
                      onChange={handleChange('offset')}
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
                  {(dataType === 'FLOAT32' || dataType ==='FLOAT64') &&
                  <Grid item xs={4}>
                    <TextField
                      label="Float Encoding"
                      className={classes.textField}

                      margin="normal"
                    />
                  </Grid>}
                </Grid>
              }
              <Grid item xs={12}>
                  <TextField
                      label="Data Unit"
                      className={classes.textField}
                      value={unit}
                      onChange={handleChange('unit')}
                      margin="normal"
                  />
              </Grid>
            </Grid>
          )
        default:
            return 'Uknown stepIndex';
    }
  }

  return (
    <div>
      <Dialog        
        fullWidth={false}
        maxWidth="md"
        open={ open ? open : false }
        onClose={handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle>Device Resource</DialogTitle>
        <DialogContent>
          <div className="formHeader">
            <div className="stepperBar">
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
          </div>
          {getStepContent(activeStep)}
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
              onClick={handleNext} >
              {activeStep === steps.length - 1 ? 'Save' : 'Next'}
            </Button>
          </Grid>
        </DialogContent>  
      </Dialog>
    </div>
  );
}


export default DeviceResourceForm;