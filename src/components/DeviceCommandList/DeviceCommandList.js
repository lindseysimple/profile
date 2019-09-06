import React, { useState, useGlobal } from 'reactn';

import { makeStyles } from '@material-ui/core/styles';

import MaterialTable from 'material-table';

import DeviceCommandForm from '../DeviceCommandForm/DeviceCommandForm';

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

const DeviceCommandList = () => {
  const classes = useStyles();
  const [ deviceCommands, setDeviceCommands ] = useGlobal('deviceCommands');
  const [ open, setOpen ] = useGlobal('open');

  const [ rowData, setRowData ] = useState('');

  return (
    <div>
      <MaterialTable
        title="Device Command List"
        columns={[
          { title: 'Name', field: 'name' },
        ]}
        data={deviceCommands}
        editable={{
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  let data = deviceCommands;
                  const index = data.indexOf(oldData);                  
                  data.splice(index, 1);
                  setDeviceCommands(data);
                }
                resolve()
              }, 100)
            }),
        }}        
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit Device Command',
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
        detailPanel={rowData => {
          console.log('rowData: ', rowData);
          return (
            <div className="rowDetail">
              {rowData['get'].length > 0 &&
                <div className="opblock opblock-get">
                  <div className="opblock-summary opblock-summary-get">
                    <span className="opblock-summary-method">GET</span>
                  </div>
                  <div className="opblock-body">
                    <div className="opblock-section">
                      <div className="opblock-section-header">
                        <div className="tab-header"><h4 className="opblock-title">Resource Operation</h4></div>
                      </div>
                      <div className="parameters-container">
                        <div className="table-container">
                          <table className="parameters">
                            <thead><tr><th clavss="col_header parameters-col_name">Name</th></tr></thead>
                            <tbody>
                              {rowData['get'].map(data => (
                                <tr data-param-name="username" data-param-in="query" key={data['parameter']}>
                                  <td className="parameters-col_name">
                                    <div className="parameter__name required">{data['parameter']}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
              {rowData['set'].length > 0 &&
                <div className="opblock opblock-post">
                  <div className="opblock-summary opblock-summary-post">
                    <span className="opblock-summary-method">SET</span>            
                  </div>
                  <div className="opblock-body">
                    <div className="opblock-section">
                      <div className="opblock-section-header">
                        <div className="tab-header"><h4 className="opblock-title">Resource Operation</h4></div>
                      </div>
                      <div className="parameters-container">
                        <div className="table-container">
                          <table className="parameters">
                            <thead><tr><th clavss="col_header parameters-col_name">Name</th></tr></thead>
                            <tbody>
                              {rowData['set'].map(data => (
                                <tr data-param-name="username" data-param-in="query" key={data['parameter']} >
                                  <td className="parameters-col_name">
                                    <div className="parameter__name required">{data['parameter']}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          )
        }}
        onRowClick={(event, rowData, togglePanel) => togglePanel()}
      />
      <DeviceCommandForm rowData={rowData} />
    </div>
  );
}

export default DeviceCommandList;