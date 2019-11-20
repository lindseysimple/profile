import { useState, useEffect } from 'react';
import React, { useDispatch } from 'reactn';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const DeviceResourceForm = ({ rowData, setRowData, prt, handleUpdateRes }) => {
  const initialState = {
    name: '',
    description: '',
    primaryTable: '',
    startingAddress: '',
    isByteSwap: false,
    isWordSwap: false,
    rawType: '',
    permission: '',
    dataType: '',
    size: '',
    base: '',
    scale: '',
    offset: '',
    min: '',
    max: '',
    defaultVal: '',
    unit: '',
  };
  const [state, setState] = useState(initialState);
  const { name, description, primaryTable, startingAddress, dataType, permission, unit, size, base, scale, offset, min, max, defaultVal, isByteSwap, isWordSwap, rawType } = state;
  const [ diagOpen, setDiagOpen ] = useState(false);

  useEffect(() => {
    if (rowData !== '') {
      const { name, description, attributes, properties } = rowData;
      const { primaryTable, startingAddress, isByteSwap, isWordSwap, rawType } = attributes;
      const { units, value } = properties;
      const newState = {
        name: `${name}_Copy`,
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
        unit: units['defaultValue']
      };
      setState(newState)
      setDiagOpen(true)
    }
  }, [rowData]);

  const handleNameChange = event => {
    setState({ ...state, name: event.target.value });
  };

  const handleClose = () => {
    setRowData()
    setDiagOpen(false)
  }
  
  const addDeviceRes = useDispatch(
    (deviceResources) =>  [...deviceResources, {
        name: name,
        protocol: prt,
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
    fetch(`http://localhost:3006/resources/${prt}`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newResource)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Insert device resource into DB successfully');
      handleUpdateRes({...newResource, protocol: prt})
      handleClose()
    })
  }

  return (
    <div>
      <Dialog open={diagOpen} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Clone Device Resource {rowData.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="New Device Resource Name"
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
          <Button onClick={addResource} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeviceResourceForm;