import React, { useState } from 'react';
import { getGlobal, useGlobal } from 'reactn';

import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import Divider from '@material-ui/core/Divider';
import BackIcon from '@material-ui/icons/ArrowBackOutlined';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import CoreCommandList from '../CoreCommandList/CoreCommandList';
import DeviceCommandList from '../DeviceCommandList/DeviceCommandList';
import DeviceResourceList from '../DeviceResourceList/DeviceResourceList';
import ProfileInfo from '../ProfileInfo/ProfileInfo';

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

const getSteps = () => ['Profile Type', 'Profile Information', 'Device Resource', 'Device Command', 'Core Command']

export default function HorizontalLabelPositionBelowStepper({ backToList, rowIndex }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();

  const [ profiles, setProfiles ] = useGlobal('profiles');

  const updateProfile = () => {
    const { name, description, model, manufacturer, labels, deviceResources, deviceCommands, coreCommands } = getGlobal();

    const deviceResourcesData = deviceResources.map(dr => {
      return { name: dr.name, description: dr.description, attributes: dr.attributes, properties: dr.properties }
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
    if(rowIndex === -1) {
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
      })
    }
    else {
      setProfiles([...profiles.slice(0, rowIndex), newProfile, ...profiles.slice(rowIndex + 1)]);
      fetch('http://localhost:3006/profiles', {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(newProfile), // body data type must match "Content-Type" header
      })
      .then(response => response.json()); 
    }
  }

  const handleNext = async () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    if (activeStep === steps.length - 1) {
       updateProfile();
       backToList();
    }
  }

  const handleBack = () => setActiveStep(prevActiveStep => prevActiveStep - 1);

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <FormControl className={classes.formControl}>
            <InputLabel shrink htmlFor="age-native-label-placeholder">
              Profile Type
            </InputLabel>
            <NativeSelect
              value="modbus"
              input={<Input name="dataType" />}
            >
              <option value="modbus">modbus</option>
              <option value="OPCUA">OPCUA</option>
              <option value="BACNET-ip">BACNET-ip</option>
              <option value="BACNET-mstp">BACNET-mstp</option>
            </NativeSelect>             
          </FormControl>
        );
      case 1:
        return (
          <ProfileInfo />
        );
      case 2:
        return (
          <div>
            <DeviceResourceList />            
          </div>
        );
      case 3:
        return ( 
          <div>
            <DeviceCommandList />            
          </div>
        );
      case 4:
        return ( 
          <div>
            <CoreCommandList />            
          </div>
      );
      default:
        return 'Uknown stepIndex';
    }
  }

  return (
    <div className={classes.root}>
      <div className="formHeader">
        <div className="backBtn">
          <Tooltip title="Back to Profile List">
            <IconButton aria-label="add" size="medium" className="iconButton"  onClick={backToList}>
              <BackIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </div>
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
      <div>
        <Typography className={classes.instructions}></Typography>
        {getStepContent(activeStep)}
        <div className="formBtns">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            className="backPreBtn"
          >
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Save Profile' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
