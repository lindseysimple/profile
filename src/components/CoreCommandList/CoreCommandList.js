import React, { useState, useGlobal } from 'reactn';

import { makeStyles } from '@material-ui/core/styles';

import MaterialTable from 'material-table';

import CoreCommandForm from '../CoreCommandForm/CoreCommandForm';

import './CoreCommandList.css';

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

const CoreCommandList = () => {
  const classes = useStyles();
  const [ coreCommands, setCoreCommands ] = useGlobal('coreCommands');
  const [ open, setOpen ] = useGlobal('open');
  const [ rowData, setRowData ] = useState('');

  return (
    <div>
      <MaterialTable
        title="Core Command List"
        columns={[
          { title: 'Name', field: 'name' },
        ]}
        data={coreCommands}
        editable={{
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  let data = coreCommands;
                  const index = data.indexOf(oldData);                  
                  data.splice(index, 1);
                  setCoreCommands(data);
                }
                resolve()
              }, 100)
            }),
        }}        
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit User',
            onClick: (event, rowData) => {                          
              setOpen(true);
              setRowData(rowData)
            }
          }
        ]}
        localization={{
          body: {
            editRow:{
              deleteText: 'Are you sure to delete this core command?'
            }
          }
        }}

        detailPanel={rowData => {
          return (
            <div className="rowDetail">
              <div className="opblock opblock-get">
                <div className="opblock-summary opblock-summary-get">
                  <span className="opblock-summary-method">GET</span>
                  <span className="opblock-summary-path">
                    <span>{rowData['get']['path']}</span>
                  </span>
                </div>
              </div>
              <div className="opblock opblock-post">
                <div className="opblock-summary opblock-summary-post">
                  <span className="opblock-summary-method">PUT</span>
                  <span className="opblock-summary-path"><span>{rowData['put']['path']}</span></span>                          
                </div>
              </div>
            </div>
          )
        }}
        onRowClick={(event, rowData, togglePanel) => togglePanel()}
      />
      <CoreCommandForm rowData={rowData}  />
    </div>
  );
}

export default CoreCommandList;