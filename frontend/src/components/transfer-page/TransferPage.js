import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Grid, Typography, Box, Snackbar, Alert, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel} from '@mui/material';
import QRCode from 'qrcode'; 
import axios from 'axios';
import { io } from 'socket.io-client';
import { BrowserMultiFormatReader } from '@zxing/browser'; 

const TransferPage = () => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [qrData, setQrData] = useState(''); 
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null); 
  const scannerRef = useRef(null);
  const [openSplitDialog, setOpenSplitDialog] = useState(false);
  const [splitAmount, setSplitAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [splitClients, setSplitClients] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [amountRequested, setAmountRequested] = useState(0);


  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Eroare la obținerea listei de clienți:', error);
      }
    };

    fetchClients();

    const socket = io('http://localhost:8002');
    socket.on('transaction_notification', (data) => {
      setNotificationMessage(data.message);
    });

    return () => socket.disconnect();
  }, []);

  
  const startScanning = () => {
    if (videoRef.current) {
      const multiFormatReader = new BrowserMultiFormatReader();
      scannerRef.current = multiFormatReader;
  
      multiFormatReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          handleScan(result.getText());
        } else if (error) {
          console.log('No QR code found or error:', error);
        }
      }).catch((err) => {
        console.error("Error during scanning:", err);
      });
    }
  };

  const stopScanning = () => {
    const stream = videoRef.current?.srcObject;
  
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  
  useEffect(() => {
    if (isScanning) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isScanning]);
  

  const handleClientChange = (event) => {
    console.log(event.target.value);
    setSelectedClientId(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    setNotificationMessage('');
  
    if (!selectedClientId || !amount) {
      setError('Please fill in both fields');
      return;
    }
  
    const parsedAmount = parseFloat(amount);
  
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
  
    console.log('Selected Client ID:', selectedClientId);
    console.log('Amount:', parsedAmount);
  
    try {
      const transferResponse = await axios.post('http://localhost:8002/api/transfer', {
        clientId: selectedClientId,
        amount: parsedAmount,
      });
  
      console.log('Transfer Response:', transferResponse.data);
  
      if (transferResponse.data.success) {
        setNotificationMessage(`Transfer de ${parsedAmount} RON către client efectuat cu succes!`);
        setSelectedClientId('');
        setAmount('');
      } else {
        setError(transferResponse.data.error || 'A apărut o eroare la procesarea transferului');
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      setError('A apărut o eroare la procesarea transferului');
    }
  };
  
  const generateQrCode = () => {
    if (selectedClientId && amount) {
      const data = {
        clientId: selectedClientId,
        amount,
      };

      QRCode.toDataURL(JSON.stringify(data))
        .then((url) => {
          setQrData(url); 
        })
        .catch((err) => {
          console.error('Eroare la generarea codului QR:', err);
          setError('Eroare la generarea codului QR');
        });
    } else {
      setError('Please select a client and enter an amount');
    }
  };

  const handleCloseQrCode = () => {
    setQrData(''); 
  };

  const handleScan = (data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.clientId && parsedData.amount) {
          setSelectedClientId(parsedData.clientId);
          setAmount(parsedData.amount);
        } else {
          setError('QR code is invalid');
        }
      } catch (e) {
        setError('Invalid QR code format');
      }
    }
  };

  const handleOpenSplitDialog = () => {
    setOpenSplitDialog(true);
  };

  const handleCloseSplitDialog = () => {
    setPayerId('');
    setSplitAmount(''); 
    setSplitClients([]); 
    setOpenSplitDialog(false);
  };

  const handleSplitAmountChange = (event) => {
    setSplitAmount(event.target.value);
  };

  const handlePayerChange = (event) => {
    setPayerId(event.target.value);
  };

  const handleClientSelect = (clientId) => {
    setSplitClients((prevSelected) => {
      if (prevSelected.includes(clientId)) {
        return prevSelected.filter(id => id !== clientId);
      } else {
        return [...prevSelected, clientId];
      }
    });
  };

  const handleConfirmSplitDialog = (payerId) => {
    if (!splitAmount || splitAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    console.log('Payer ID:', payerId);
    console.log('Selected clients:', splitClients);
    setAmountRequested(calculateSplitAmount());
    if (payerId == 1){
      splitClients.forEach(async (clientId) => {
        try {
          const response = await axios.post('http://localhost:8002/api/add-debt', {
            payerId: 1,
            clientId: clientId,
            amount: calculateSplitAmount(),
          });
          
          if (response.status == 201) {
            setNotificationMessage("Soliciare de plata trimisa cu succes!");
            setSplitAmount('');
            setSplitClients([]);
            handleCloseSplitDialog();
          }
        } catch (error) {
          console.error('Eroare: ', error);
          setError('A aparut o eroare.');
        }
      });
    }
    else{
      setIsDialogOpen(true);
    }
  };

  const handleCloseNewDialog = () => {
    setIsDialogOpen(false);
    handleCloseSplitDialog();
  };

  const calculateSplitAmount = () => {
    if (splitClients.length === 0) return 0;
    return parseFloat(splitAmount) / (splitClients.length + 1);
  };

  const availableClientsForSplit = clients.filter(client => client.id !== payerId);
  
  const getPayerName = () => {
    const payer = clients.find(client => client.id === payerId);
    return payer ? `${payer.nume} ${payer.prenume}` : 'Nume necunoscut';
  };
  
  const handlePayRequest = async () => {
    if (!payerId || amountRequested <= 0) {
      setError('Please provide valid payerId and amount');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8002/api/transfer', {
        clientId: payerId,
        amount: amountRequested,
      });
  
      if (response.status === 200 || response.status === 201) {
        setNotificationMessage(`Transaction successful! You paid ${amountRequested} RON.`);
        setAmountRequested(0);
        handleCloseSplitDialog();
      } else {
        setError('An error occurred during the payment transaction.');
      }
      handleCloseNewDialog();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process the payment. Please try again.');
    }
  };

  const handleDeclineRequest = async (clientId) => {
    if (amountRequested <= 0) {
      setError('Please provide a valid amount.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8002/api/add-debt', {
        payerId: payerId,
        clientId: 1,
        amount: amountRequested,
      });
  
      if (response.status === 201) {
        setNotificationMessage('Debt has been added successfully.');
        setAmountRequested(0); 
        handleCloseSplitDialog(); 
      } else {
        setError('An error occurred while adding the debt.');
      }
      handleCloseNewDialog();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add the debt. Please try again.');
    }
  };


  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Transfer Sum
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            select
            label="To whom?"
            variant="outlined"
            fullWidth
            value={selectedClientId}
            onChange={handleClientChange}
          >
            {clients.map(client => (
              <MenuItem key={client.id} value={client.id}>
                {client.nume} {client.prenume}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Sum"
            variant="outlined"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={generateQrCode}
            style={{
            color: '#FFFFFF',
            backgroundColor: '#662e91',
            }}>
            Generate QR Code
          </Button>
        </Grid>

        {qrData && (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <img src={qrData} alt="QR Code" />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCloseQrCode}
              style={{
                position: 'absolute',
                top: '320px',
                right: '540px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
              }}
            >
              X
            </Button>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button 
            variant="contained"
            color="secondary" 
            fullWidth
            onClick={() => setIsScanning(!isScanning)}
            style={{
              color: '#FFFFFF',
              backgroundColor: '#007db0',
              }}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Button>
        </Grid>

        {isScanning && (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <video ref={videoRef} width="100%" height="auto" />
          </Grid>
        )}

        <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleOpenSplitDialog}
              style={{
                color: '#FFFFFF',
                backgroundColor: '#f58120',
                }}>
              Split the bill
            </Button>
        </Grid>

        <Grid item xs={12}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleSubmit}
            >
              Confirm Transfer
            </Button>
        </Grid>
      </Grid>
      <>
        <Dialog open={isDialogOpen} onClose={handleCloseNewDialog}>
          <DialogContent>
            <p>{getPayerName()} is asking for {amountRequested} RON.  Pay now?</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePayRequest}>Pay</Button> 
            <Button onClick={handleDeclineRequest}>Not now</Button>
          </DialogActions>
        </Dialog>
      </>
      <Dialog open={openSplitDialog} onClose={handleCloseSplitDialog}>
        <DialogTitle>Split the bill</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Who is paying?"
            variant="outlined"
            fullWidth
            value={payerId}
            onChange={handlePayerChange}
          >
            {clients.map(client => (
              <MenuItem key={client.id} value={client.id}>
                {client.nume} {client.prenume}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Amount"
            variant="outlined"
            fullWidth
            value={splitAmount}
            onChange={handleSplitAmountChange}
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            sx={{ marginTop: 2 }}
          />

          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Split with:
          </Typography>

          {availableClientsForSplit.map(client => (
            <FormControlLabel
              key={client.id}
              control={
                <Checkbox
                  checked={splitClients.includes(client.id)}
                  onChange={() => handleClientSelect(client.id)}
                />
              }
              label={`${client.nume} ${client.prenume}`}
            />
          ))}

          <Typography variant="body2" sx={{ marginTop: 2 }}>
            Amount per person: {calculateSplitAmount()} RON
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSplitDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleConfirmSplitDialog(payerId)} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notificationMessage}
        autoHideDuration={6000}
        onClose={() => setNotificationMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotificationMessage('')} severity="success" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransferPage;