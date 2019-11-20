import React, { useState } from 'react';
import { useGlobal } from 'reactn';

import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import PlaylistAddOutlinedIcon from '@material-ui/icons/PlaylistAddOutlined';
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined';
import PlayForWorkIcon from '@material-ui/icons/PlayForWork';
import MaterialTable, {MTableToolbar} from 'material-table';
import download from 'downloadjs'
import yaml from 'js-yaml';
import JSZip from 'jszip';
import Dropzone,{useDropzone} from 'react-dropzone'
import CloneProfileDiag from '../CloneProfileDiag/CloneProfileDiag';
import ImportProfileDiag from '../ImportProfileDiag/ImportProfileDiag';
import ProfileForm from '../ProfileForm/ProfileForm';

import './ProfileList.css';

const ProfileList = () => {
  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: 'Manufacturer', field: 'manufacturer' },
    { title: 'Model', field: 'model' },
    { title: 'Label', field: 'labels', 
      render: rowData => {
        rowData.labels.sort();
        return (
          <div>
            {rowData.labels.map((label, labelIndex) =>
              <Chip
                key={label}
                label={label}
                color="primary"
                variant="outlined"
              />
            )}
          </div>
        );
      }
    }
  ];
  const [ route, setRoute ] = useState('viewprofile');
  const [ rowIndex, setRowIndex ] = useState(-1);
  const [ mode, setMode ] = useState('')
  const [ originProfileName, setOriginProfileName ] = useState('')
  const [ showImportDiag, setImportDiag ] = useState(false);

  const [ global, setGlobal ] = useGlobal();
  const [ profiles, setProfiles ] = useGlobal('profiles');

  const backToList = () => setRoute('viewprofile')

  const addNewProfile = () => {
    setGlobal({...global,
      name: '',
      description: '',
      manufacturer: '',
      model: '',
      labels: [],
      deviceResources: [],
      selectedResource: [],
      deviceCommands: [],
      coreCommands: [],
      open: false,
    });
    setRoute('addprofile')
    setMode('form')
  }

  const genYAMLFile = (data) => {
    const profile = Object.assign({}, data);
    delete profile.tableData;
console.log('profile yaml', profile)
    download(yaml.safeDump(profile,{'styles': {
        '!!str': '...' // dump null as ~
      }}), profile.name.trim() + ".yml", "text/plain");
  }

  const genArchiveFile = (data) => {    
    const zip = new JSZip();    
    const dir = zip.folder("deviceprofiles");
    profiles.map(profileData => {
      const profile = Object.assign({}, profileData);
      delete profile.tableData;

      dir.file(profile.name.trim() + '.yaml', yaml.dump(profile))
    })
    zip.generateAsync({type:"blob"})
      .then(content => {
        download(content, "edgex_profiles.zip");
    });
  }

  return (
    <div className="profileList">
      {showImportDiag && <ImportProfileDiag backToList={backToList} setOpen={setImportDiag} />}
      {route === 'viewprofile'
        ? <div>
            <MaterialTable
                title="Device Profile List"
                columns={columns}
                data={profiles}
                components={{
                  Toolbar: props => (
                    <div className="toolbar">
                      <MTableToolbar {...props} />
                      <div className="toolbar-item">
                      <Tooltip title="Add Profile">
                        <IconButton aria-label="add" size="medium" className="iconButton"  onClick={addNewProfile}>
                          <PlaylistAddOutlinedIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Import Profile">
                        <IconButton aria-label="import" size="medium" className="iconButton"  onClick={() => setImportDiag(true)}>
                          <PlayForWorkIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate Archive File">
                        <IconButton aria-label="archive" size="medium" className="iconButton"  onClick={genArchiveFile}>
                          <ArchiveOutlinedIcon fontSize="inherit" />
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
                          let data = profiles;
                          const index = data.indexOf(oldData);                  
                          data.splice(index, 1);
                          setProfiles(data);                          
                          fetch('http://localhost:3006/profiles/'+oldData.name, {method: 'DELETE'})
                            .then(res => res.json())
                            .then(res => {                              
                              return res
                            })
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
                      const profile = profiles[dataIndex];
                      const { name, description, model, manufacturer, labels, deviceResources, deviceCommands, coreCommands } = profile;
                      const resNames = deviceResources.map(dr => dr.name);
                      setGlobal({...global,
                          name: name,
                          description: description,
                          model: model,
                          manufacturer: manufacturer,
                          labels: labels,
                          selectedResource: resNames,
                          deviceCommands: deviceCommands,
                          coreCommands: coreCommands
                      })
                      setRowIndex(dataIndex);
                      setRoute('addprofile');
                      setMode('form')
                    }
                  },
                  {
                    icon: 'file_copy',
                    tooltip: 'Clone',
                    onClick: (event, rowData) => {
                      const dataIndex = rowData['tableData']['id'];
                      const profile = profiles[dataIndex];
                      const { name, description, model, manufacturer, labels, deviceResources, deviceCommands, coreCommands } = profile;
                      setOriginProfileName(name)
                      const resNames = deviceResources.map(dr => dr.name);
                      setGlobal({...global,
                        name: `${name}_Copy`,
                        description: description,
                        model: model,
                        manufacturer: manufacturer,
                        labels: labels,
                        selectedResource: resNames,
                        deviceCommands: deviceCommands,
                        coreCommands: coreCommands
                      })
                      setRowIndex(dataIndex);
                      setRoute('addprofile');
                      setMode('clone')
                    }
                  },
                  {
                    icon: 'publish',
                    tooltip: 'Export',
                    onClick: (event, rowData) => {                      
                      const dataIndex = rowData['tableData']['id'];                      
                      const profile = profiles[dataIndex];
                      genYAMLFile(profile);

                    }
                  }
                ]}
                options={{
                  pageSize: 10
                }}
            />
          </div>
        : (
              mode === 'form'
                ? <ProfileForm backToList={backToList} rowIndex={rowIndex} />
                : <CloneProfileDiag backToList={backToList} originProfileName={originProfileName} />
          )
      }
    </div>
  );
}

export default ProfileList;