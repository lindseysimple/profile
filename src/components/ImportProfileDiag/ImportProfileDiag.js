import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import updateProfile from "../../utils/updateProfile";

const CloneProfileDiag = ({ backToList, setOpen }) => {
  const handleClose = () => {
    setOpen(false)
    backToList()
  }

  const handleYAML = () => {
    const file = document.getElementById('input').files[0]
    const reader = new FileReader();
    reader.onload = function(evt) {
      updateProfile(evt.target.result)
      handleClose()
    };
    reader.readAsText(file);
  }

  return (
      <div>
        <Dialog open={true} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Import Device Profile</DialogTitle>
          <DialogContent>
            <input type="file" id="input" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleYAML} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
  );
}

export default CloneProfileDiag;
