import React, { useState, useGlobal } from 'reactn';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

import PlaylistAddOutlinedIcon from '@material-ui/icons/PlaylistAddOutlined';
import MaterialTable, { MTableToolbar } from 'material-table';

import DeviceResourceForm from '../DeviceResourceForm/DeviceResourceForm';

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
  const [ deviceResources, setDeviceResources ] = useGlobal('deviceResources');
  const [ open, setOpen ] = useGlobal('open');

  const [ rowData, setRowData ] = useState('');

  const handleAdd = () => {
    //setState(initialState);
    //setRowIndex(-1);
    setOpen(true);
  }

  return (
    <div>
      <MaterialTable
        title="Device Resource List"
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Description', field: 'description' },
        ]}
        data={deviceResources}
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
              </div>
            </div>
          ),
        }}
        editable={{
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  let data = deviceResources;
                  const index = data.indexOf(oldData);                  
                  data.splice(index, 1);
                  setDeviceResources(data);
                }
                resolve()
              }, 100)
            }),
        }}        
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit Device Resource',
            onClick: (event, rowData) => {                          
              setOpen(true);
              setRowData(rowData)
            }
          }
        ]}
        localization={{
          body: {
            editRow:{
              deleteText: 'Are you sure to delete this device command?'
            }
          }
        }}      
      />
      <DeviceResourceForm rowData={rowData} />
    </div>
  );
}

export default DeviceResourceList;