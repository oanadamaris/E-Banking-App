import React, { useState } from 'react';
import './Header.css'; 
import logo from '../../assets/logo.png';  
import { Button, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, Settings as SettingsIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material'; 
import axios from 'axios';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); 
  const [nume, setNume] = useState(''); 
  const [prenume, setPrenume] = useState(''); 
  const [cnp, setCnp] = useState('');
  const [telefon, setTelefon] = useState(''); 
  const [email, setEmail] = useState(''); 

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddFriend = async () => {
    if (nume && prenume && cnp && telefon && email) {
      try {
        const response = await axios.post('http://localhost:8002/api/add-friend', {
          nume,
          prenume,
          cnp,
          telefon,
          email,
        });

        if (response.data.success) {
          alert('Friend added successfully!');
          setNume('');
          setPrenume('');
          setCnp('');
          setTelefon('');
          setEmail('');
          handleCloseDialog();
        } else {
          alert('Failed to add friend. Please try again!');
        }
      } catch (error) {
        console.error('Error adding friend:', error);
        alert('An error occurred while adding the friend.');
      }
    } else {
      alert('Please complete all fields.');
    }
  };

  return (
    <header className="header-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      
      <div className="header-title">
        <h1>Home</h1>
      </div>

      <div className="menu">
        <Button 
          variant="contained" 
          sx={{ backgroundColor: '#2f4f4f', color: 'white', '&:hover': { backgroundColor: '#4e6363' } }}
          onClick={handleClick}
          startIcon={<MenuIcon />}  
        >
          Menu
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <HomeIcon style={{ marginRight: 10 }} /> 
            Home
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <SettingsIcon style={{ marginRight: 10 }} />  
            Settings
          </MenuItem>
          <MenuItem onClick={handleOpenDialog}>
            <GroupAddIcon style={{ marginRight: 10 }} />  
            Add friends
          </MenuItem>
        </Menu>
      </div>

      {/* Add Friend Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={prenume}
            onChange={(e) => setPrenume(e.target.value)}
          />
          <TextField
            margin="dense"
            label="CNP"
            type="text"
            fullWidth
            variant="outlined"
            value={cnp}
            onChange={(e) => setCnp(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddFriend} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </header>
  );
};

export default Header;
