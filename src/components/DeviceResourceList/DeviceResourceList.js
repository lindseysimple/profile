import {useEffect} from "react";
import React, { useState, useGlobal } from 'reactn';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import PlaylistAddOutlinedIcon from '@material-ui/icons/PlaylistAddOutlined';

import MaterialTable, { MTableToolbar } from 'material-table';

import DeviceResourceForm from '../DeviceResourceForm/DeviceResourceForm';
import CloneResourceDiag from '../CloneResourceDiag/CloneResourceDiag';

import './DeviceResourceList.css'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
}));

const DeviceResourceList = () => {
  const classes = useStyles();
  const [ deviceResources, setResources ] = useGlobal('deviceResources');
  const [ open, setOpen ] = useGlobal('open');

  const [ rowData, setRowData ] = useState('');
  const [ mode, setMode ] = useState('')
  const [ protocol, setFilter ] = useState('modbus')
  const [ filterDRs, setFilterDRs ] = useState([]);

  const handleUpdateRes = (obj, rowIndex) => {
    if (rowIndex)
      setResources([...deviceResources.slice(0, rowIndex), obj, ...deviceResources.slice(rowIndex + 1)])
        .then(data => setFilterDRs(data.deviceResources.filter(dr => dr.protocol === protocol)))
    else
      setResources([...deviceResources, obj])
        .then(data => setFilterDRs(data.deviceResources.filter(dr => dr.protocol === protocol)))
  }

  const handleAdd = () => {
    setRowData('')
    setMode('form')
    setOpen(true);
  }

  const handleDelete = (oldData) => {
    const index = deviceResources.indexOf(oldData);
    deviceResources.splice(index, 1);
    setResources(deviceResources)
      .then(data => {
        return setFilterDRs(data['deviceResources'].filter(dr => dr.protocol === protocol))
      });
  }
  const handleChange = (event) => {
    const prt = event.target.value
    setFilter(prt)
    setFilterDRs(deviceResources.filter(dr => dr.protocol === prt))
  }

  const closeDiag = () => setRowData('')

  useEffect(() => {
    const fetchResource = async () => {
      const response = await fetch('http://localhost:3006/resources');
      const result = await response.json()
      return  result;
    }
    fetchResource()
      .then(data => {
        const resources = data.map(item => {
          return {...item.info, protocol: item.protocol}
        })
        setResources(resources)
          .then(data => setFilterDRs(data.deviceResources.filter(dr => dr.protocol === protocol)))
      })
      .catch(err => console.log('Err:', err))
  }, []);
  return (
    <div>
      <MaterialTable
        title="Device Resource List"
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Description', field: 'description' },
        ]}
        data={filterDRs}
        components={{
          Toolbar: props => (
            <div className="toolbar">
              <MTableToolbar {...props} />
              <div className="toolbar-item">
              <Tooltip title="Add Device Resource">
                <IconButton aria-label="add" size="medium" className="iconButton" onClick={handleAdd}>
                  <PlaylistAddOutlinedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <FormControl variant="filled" className='selectDD'>
                <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                  Select Device Protocol
                </InputLabel>
                <Select
                    id="demo-simple-select-filled"
                    value={protocol}
                    onChange={handleChange}
                >
                  <MenuItem value='modbus'>Modbus</MenuItem>
                  <MenuItem value='opcua'>OPCUA</MenuItem>
                  <MenuItem value='ethercat'>EtherCAT</MenuItem>
                </Select>
              </FormControl>

              </div>
            </div>
          ),
        }}
        editable={{
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  handleDelete(oldData)
                  fetch('http://localhost:3006/resources/'+oldData.name, {method: 'DELETE'})
                    .then(res => res.json())
                    .then(res=>res)
                    .catch(err => console.error(err))
                }
                resolve()
              }, 100)
            }),
        }}        
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit',
            onClick: (event, rowData) => {
              const dataIndex = rowData['tableData']['id'];
              setOpen(true);
              setMode('form')
              setRowData(rowData)
            }
          },
          {
            icon: 'file_copy',
            tooltip: 'Clone',
            onClick: (event, rowData) => {
              setMode('clone')
              setRowData(rowData)
            }
          }
        ]}
        localization={{
          body: {
            editRow:{
              deleteText: 'Are you sure to delete this device resource?'
            }
          }
        }}
        options={{
          pageSize: 10
        }}
      />
      {
        mode === 'form'
          ? <DeviceResourceForm rowData={rowData} prt={protocol} handleUpdateRes={handleUpdateRes} />
          : <CloneResourceDiag rowData={rowData} setRowData={closeDiag} prt={protocol} handleUpdateRes={handleUpdateRes} />
      }
    </div>
  );
}

export default DeviceResourceList;