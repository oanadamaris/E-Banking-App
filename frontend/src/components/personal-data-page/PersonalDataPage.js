import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const PersonalDataPage = () => {
  const [clientData, setClientData] = useState(null);

  // Apelul API pentru a obține datele personale ale clientului
  const fetchClientData = async () => {
    try {
      const response = await axios.get('http://localhost:8002/api/personal-data');
      if (response.data) {
        setClientData(response.data); // Actualizăm datele clientului
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  };

  useEffect(() => {
    fetchClientData(); // Apelăm API-ul când componenta este montată
  }, []);

  if (!clientData) {
    return (
      <Typography variant="h5" align="center">
        Încărcare date...
      </Typography>
    );
  }
  const expirationDate = new Date(clientData.data_expirare);
  const formattedExpirationDate = `${(expirationDate.getMonth() + 1).toString().padStart(2, '0')}/${expirationDate.getFullYear().toString().slice(-2)}`;
  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Datele personale
            </Typography>

            {/* Tabel cu datele clientului și cardului */}
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nume</TableCell>
                    <TableCell>{clientData.nume} {clientData.prenume}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>CNP</TableCell>
                    <TableCell>{clientData.cnp}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
                    <TableCell>{clientData.telefon}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell>{clientData.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Număr Card</TableCell>
                    <TableCell>{clientData.numar_card}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data Expirării</TableCell>
                    <TableCell>{formattedExpirationDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>CVC</TableCell>
                    <TableCell>{clientData.cvv}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>IBAN</TableCell>
                    <TableCell>{clientData.iban}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sold</TableCell>
                    <TableCell>{clientData.sold} RON</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Economii</TableCell>
                    <TableCell>{clientData.economii} RON</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PersonalDataPage;
