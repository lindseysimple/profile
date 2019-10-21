import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ProfileList from '../ProfileList/ProfileList';
import DeviceResourceList from '../DeviceResourceList/DeviceResourceList';

import './Navigation.css';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    /*flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,*/
    display: 'flex',
    justifyContent: 'center',
    marginTop: '150px',
  },
}));

const routes = [
  {
    path: "/",
    exact: true,    
    main: () => <h2>Home</h2>
  },
  {
    path: "/resources",
    main: () => <DeviceResourceList />
  },
  {
    path: "/profiles",
    main: () => <ProfileList />
  }
];

const Navigation = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <div className="sideBar"
          style={{
            padding: "10px",
            width: "10%",
            height: "100%",
            background: "#f0f0f0"
          }}
        >
          <ul >
            <li>
              <Link to="/resources">Device Resource</Link>
            </li>
            <li>
              <Link to="/profiles">Device Profile</Link>
            </li>
          </ul>

          <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
              />
            ))}
          </Switch>
        </div>

        <div style={{ flex: 1, padding: "10px" }}>
          <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                children={<route.main />}
              />
            ))}
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default Navigation;