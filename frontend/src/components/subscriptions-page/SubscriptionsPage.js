import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/subscriptions');
        if (response.data) {
          setSubscriptions(response.data);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };
    fetchSubscriptions();
  }, []);


  const handleDelete = async (platformName) => {
    try {
      const response = await axios.delete('http://localhost:8002/api/subscriptions/delete', {
        data: { platform_name: platformName },  
      });
      if (response.data.success) {
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.filter((subscription) => subscription.name !== platformName)
        );
        setSuccessMessage('Subscription cancelled successfully!');
        setOpenSnackbar(true);
      } else {
        console.error('Error deleting subscription:', response.data.error);
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Subscriptions
            </Typography>
            <Typography variant="h6" color="white" gutterBottom>
              Active Subscriptions
            </Typography>
            <List>
              {subscriptions.map((subscription) => (
                <ListItem key={subscription.name} sx={{ backgroundColor: '#3c4e4d', marginBottom: 1, borderRadius: 2 }}>
                  <ListItemText
                    primary={subscription.name}
                    secondary={`Price: ${subscription.price} RON | Start date: ${subscription.start_date}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      color="error" 
                      onClick={() => handleDelete(subscription.name)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Grid>
  );
};

export default SubscriptionsPage;
