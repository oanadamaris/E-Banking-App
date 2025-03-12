import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/transaction-history');
        if (response.data) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    };
    fetchTransactionHistory();
  }, []);

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Istoric Tranzacții
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <thead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>De la</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Către</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sumă</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  </TableRow>
                </thead>
                <TableBody>
                  {transactions.map((transaction, index) => {
                    let from = '';
                    let to = '';
                    let sumaAfisata = '';

                    if (transaction.id_expeditor === 1) {
                      from = `${transaction.from_nume} ${transaction.from_prenume}`;
                      sumaAfisata = `${transaction.suma}`;
                      to = transaction.id_destinatar === 1 
                        ? `${transaction.to_nume} ${transaction.to_prenume}`
                        : (transaction.id_magazin ? `${transaction.magazin_nume}, ${transaction.magazin_adresa}` : `${transaction.to_nume} ${transaction.to_prenume}`);
                    } else if (transaction.id_destinatar === 1) {
                      from = `${transaction.from_nume} ${transaction.from_prenume}`;
                      sumaAfisata = `${transaction.suma}`;
                      to = `${transaction.to_nume} ${transaction.to_prenume}`;
                    } else {
                      from = `${transaction.from_nume} ${transaction.from_prenume}`;
                      to = transaction.id_magazin ? `${transaction.magazin_nume}, ${transaction.magazin_adresa}` : `${transaction.to_nume} ${transaction.to_prenume}`;
                      sumaAfisata = `${transaction.suma}`;
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell>{from}</TableCell>
                        <TableCell>{to}</TableCell>
                        <TableCell>{sumaAfisata}</TableCell>
                        <TableCell>{new Date(transaction.data).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TransactionHistoryPage;
