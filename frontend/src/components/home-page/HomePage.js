import React, { useState, useEffect } from 'react';
import Header from '../header/Header'; 
import { useNavigate } from 'react-router-dom'; 
import { Grid, Card, CardContent, Typography, Button, Snackbar, Alert, IconButton } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PreviewIcon from '@mui/icons-material/Preview';
import SavingsIcon from '@mui/icons-material/Savings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CloseIcon from '@mui/icons-material/Close';
import './HomePage.css'; 
import axios from 'axios';

const HomePage = () => {

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const handleTransferClick = () => navigate('/transfer');
  const handlePersonalDataClick = () => navigate('/personal-data');
  const handleTransactionHistoryClick = () => navigate('/transaction-history-page');
  const handleSavingsAccountClick = () => navigate('/savings-account');
  const handleSubscriptionsClick = () => navigate('/subscriptions');
  const handleDebtClick = () => navigate('/debt');

  const calculateDebtAgeInMonths = (debtDateString) => {
    const debtDate = new Date(debtDateString);
    const currentDate = new Date();
    
    let yearsDiff = currentDate.getFullYear() - debtDate.getFullYear();
    let monthsDiff = currentDate.getMonth() - debtDate.getMonth();

    if (monthsDiff < 0) {
      yearsDiff--;
      monthsDiff += 12;
    }

    return yearsDiff * 12 + monthsDiff;
  };

  const isOlderThanMonths = (dateString, months) => {
    const debtAgeInMonths = calculateDebtAgeInMonths(dateString);
    return debtAgeInMonths >= months;
  };

  useEffect(() => {
    const fetchDebtData = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/debt');
        if (response.data) {
          const overdueDebts = response.data.filter((debt) =>
            isOlderThanMonths(debt.date, 6) 
          );

          if (overdueDebts.length > 0) {
            setNotifications([{
              id: 'general-debt-notification',
              message: 'YOU HAVE DEBT OLDER THAN 6 MONTHS!',
              open: true,
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching debt data:', error);
      }
    };
    fetchDebtData();
  }, []);

  const handleCloseAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="home-page-container">
      {/* Header */}
      <Header />
      {/* debts older than 6 months */}
      {notifications.length > 0 && (
        <Snackbar
          open={notifications[0].open}
          autoHideDuration={10000}
          onClose={handleCloseAllNotifications}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity="warning"
            sx={{ width: '100%' }}
            onClose={handleCloseAllNotifications}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleCloseAllNotifications}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {notifications[0].message}
          </Alert>
        </Snackbar>
      )}

      <div className="content-container">
      <Grid container spacing={2} justifyContent="center">
          {/* Box 1: Transfer prin numărul de telefon și QR */}
          <Grid item xs={24} sm={6}>
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2,  height: '250px' }}>
              <CardContent>
                <Typography variant="h5" align="center"
                sx={{marginTop: '50px' }}>
                  Transfer
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                  onClick={handleTransferClick} >
                  <PaymentsIcon sx={{ marginRight: 1 }} /> 
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Box 2: Afisare date personale */}
          <Grid item xs={24} sm={6}>
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2,  height: '250px' }}>
              <CardContent>
              <Typography variant="h5" align="center"
              sx={{marginTop: '50px' }}>
                Personal data
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                  onClick={handlePersonalDataClick} >
                  <PreviewIcon sx={{ marginRight: 1 }} /> 
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Box 3: Istoric Tranzacții */}
          <Grid item xs={24} sm={6}>
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2,  height: '250px' }}>
              <CardContent>
              <Typography variant="h5" align="center"
              sx={{marginTop: '50px' }}>
                Transaction History
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                  onClick={handleTransactionHistoryClick} >
                  <AccountBalanceWalletIcon sx={{ marginRight: 1 }} /> 
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Box 4: Cont Economii */}
          <Grid item xs={24} sm={6}>
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2,  height: '250px'}}>
              <CardContent>
                <Typography variant="h5" align="center"
                sx={{marginTop: '50px' }}>
                  Savings account
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                  onClick={handleSavingsAccountClick}>
                  <SavingsIcon sx={{ marginRight: 1 }} /> 
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Box 5: Urmărire Abonamente */}
          <Grid item xs={25} sm={6}>
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2,  height: '250px' }}>
              <CardContent>
              <Typography variant="h5" align="center"
              sx={{marginTop: '50px' }}>
                Subscriptions  
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                  onClick={handleSubscriptionsClick }>
                  <SubscriptionsIcon sx={{ marginRight: 1 }} /> 
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Box 6: Modul de datorii */}
          <Grid item xs={24} sm={6} >
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 , height: '250px'}}>
              <CardContent>
              <Typography variant="h5" align="center"
              sx={{marginTop: '50px' }}
              >
                Debt  
                </Typography>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' }}}
                  onClick={handleDebtClick }>
                  <CurrencyExchangeIcon sx={{ marginRight: 1 }} /> 
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default HomePage;
