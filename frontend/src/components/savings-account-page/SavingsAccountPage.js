import React, { useState, useEffect } from 'react'; 
import { Grid, Card, CardContent, Typography, TextField, Button, Alert, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info'; // Icon pentru Info

const SavingsAccountPage = () => {
  const [balance, setBalance] = useState(0); // Soldul curent
  const [savings, setSavings] = useState(0); // Economiile curente
  const [amount, setAmount] = useState(''); // Suma introdusă
  const [objectives, setObjectives] = useState([]); // Obiective financiare
  const [error, setError] = useState(''); // Eroare
  const [result, setResult] = useState(''); // Rezultatul operațiilor
  const [newObjectiveDescription, setNewObjectiveDescription] = useState(''); // Descrierea obiectivului nou
  const [newObjectiveAmount, setNewObjectiveAmount] = useState(''); // Suma obiectivului nou

// Strategii
// Clasa de bază pentru strategii
class Operation {
  execute(params) {
    throw new Error("Metoda 'execute' trebuie implementată.");
  }
}

// Strategia pentru Depunere
class Deposit extends Operation {
  execute({ savings, amount }) {
    return savings + amount;
  }
}

// Strategia pentru Retragere
class Withdraw extends Operation {
  execute({ savings, amount }) {
    if (amount > savings) {
      throw new Error("Sold insuficient pentru retragere!");
    }
    return savings - amount;
  }
}

// Strategia pentru Adăugare Obiectiv
class AddObjective extends Operation {
  async execute({ objectives, newObjective, updateObjectives }) {
    try {
      const response = await axios.post('http://localhost:8002/api/objectives', newObjective);
      if (response.data.success) {
        updateObjectives([...objectives, response.data.newObjective]);
        return 'Obiectiv adăugat cu succes!';
      }
      throw new Error(response.data.error || 'Eroare la adăugarea obiectivului');
    } catch (err) {
      console.error('Error adding objective:', err);
      throw new Error('Eroare la adăugarea obiectivului');
    }
  }
}

// Strategia pentru Ștergere Obiectiv
class DeleteObjective extends Operation {
  async execute({ objectives, objectiveId, updateObjectives }) {
    try {
      const response = await axios.delete(`http://localhost:8002/api/objectives/${objectiveId}`);
      if (response.data.success) {
        updateObjectives(objectives.filter((obj) => obj.id_obiective !== objectiveId));
        return 'Obiectiv șters cu succes!';
      }
      throw new Error(response.data.error || 'Eroare la ștergerea obiectivului');
    } catch (err) {
      console.error('Error deleting objective:', err);
      throw new Error('Eroare la ștergerea obiectivului');
    }
  }
}

const performOperation = async (strategy, params) => {
  try {
    return await strategy.execute(params);
  } catch (error) {
    return error.message;
  }
};

const checkGoalStatus = (savings, goal) => {
  const futureBalance = savings;
  if (futureBalance >= goal) {
    return `Obiectivul de ${goal} RON a fost atins!`;
  } else {
    const needed = goal - futureBalance;
    return `Mai ai nevoie de ${needed.toFixed(2)} RON pentru a atinge obiectivul.`;
  }
};

  //extragem soldul si economiile din backen pt afisare
  useEffect(() => {
    const fetchBalanceAndSavings = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/balance');
        if (response.data.balance !== undefined && response.data.savings !== undefined) {
          setBalance(response.data.balance);
          setSavings(response.data.savings);
        }
      } catch (err) {
        console.error('Error fetching balance and savings:', err);
      }
    };

    const fetchObjectives = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/objectives');
        setObjectives(response.data);
      } catch (err) {
        console.error('Error fetching objectives:', err);
      }
    };

    fetchBalanceAndSavings();
    fetchObjectives();

    // Actualizare periodică
    const intervalId = setInterval(() => {
      fetchBalanceAndSavings();
      fetchObjectives();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  //handler apelat la depunere de economii
  const handleDeposit = async () => {
    setError('');
    setResult('');
    try {
      const depositStrategy = new Deposit();
      const newSavings = await performOperation(depositStrategy, { savings, amount: parseFloat(amount) });
      setSavings(newSavings);
  
      // Simulăm actualizarea backend-ului
      await axios.post('http://localhost:8002/api/deposit', { amount: parseFloat(amount) });
      setResult(`Depunere reușită! Economii actualizate: ${newSavings} RON`);
    } catch (err) {
      console.error('Error during deposit:', err);
      setError(err.message || 'Eroare la depunere');
    }
  };
  
  
  //handler apelat la retragere de economii
  const handleWithdraw = async () => {
    setError('');
    setResult('');
    try {
      const withdrawStrategy = new Withdraw();
      const newSavings = await performOperation(withdrawStrategy, { savings, amount: parseFloat(amount) });
      setSavings(newSavings);
  
      // Simulăm actualizarea backend-ului
      await axios.post('http://localhost:8002/api/withdraw', { amount: parseFloat(amount) });
      setResult(`Retragere reușită! Economii actualizate: ${newSavings} RON`);
    } catch (err) {
      console.error('Error during withdrawal:', err);
      setError(err.message || 'Eroare la retragere');
    }
  };
  

  //handler apelat la stergerea unui obiectiv din lista
  const handleDeleteObjective = async (objectiveId) => {
    setError('');
    setResult('');
    try {
      const deleteObjectiveStrategy = new DeleteObjective();
      const resultMessage = await performOperation(deleteObjectiveStrategy, {
        objectives,
        objectiveId,
        updateObjectives: setObjectives,
      });
      setResult(resultMessage);
    } catch (err) {
      console.error('Error deleting objective:', err);
      setError(err.message || 'Eroare la ștergerea obiectivului');
    }
  };
  
  
  //handler apelat la adaugarea unui obiectiv in lista
  const handleAddObjective = async () => {
    setError('');
    setResult('');
    try {
      const response = await axios.post('http://localhost:8002/api/add_objectives', {
        descriere: newObjectiveDescription,
        suma_obiectiv: parseFloat(newObjectiveAmount),
      });
      if (response.data.success) {
        setObjectives((prev) => [...prev, response.data.newObjective]);
        setResult('Obiectiv adăugat cu succes!');
        setNewObjectiveDescription('');
        setNewObjectiveAmount('');
      } else {
        setError(response.data.error || 'Eroare la adăugarea obiectivului');
      }
    } catch (err) {
      console.error('Error adding objective:', err);
      setError('Eroare la adăugarea obiectivului');
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Cont Economii
            </Typography>

            {/* Sold curent și Economii */}
            <Typography variant="h5" color="white" align="center">
              Sold curent: {`${balance} RON`}
            </Typography>
            <Typography variant="h6" color="white" align="center">
              Economii: {`${savings} RON`}
            </Typography>

            {/* Depunere și Retragere */}
            <TextField
              label="Suma"
              variant="outlined"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              sx={{ marginTop: 2 }}
            />
            <Button
              onClick={handleDeposit}
              variant="contained"
              sx={{ margin: 1, backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
            >
              Depunere
            </Button>
            <Button
              onClick={handleWithdraw}
              variant="contained"
              sx={{ margin: 1, backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
            >
              Retragere
            </Button>

               {/* Casete text și buton pentru adăugarea obiectivului */}
               <Typography variant="h5" color="white" align="center" sx={{ marginTop: 3 }}>
              Adaugă Obiectiv Financiar
            </Typography>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Descriere Obiectiv"
                  variant="outlined"
                  fullWidth
                  value={newObjectiveDescription}
                  onChange={(e) => setNewObjectiveDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Suma Obiectiv"
                  variant="outlined"
                  fullWidth
                  value={newObjectiveAmount}
                  onChange={(e) => setNewObjectiveAmount(e.target.value)}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleAddObjective}
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                >
                  Adaugă Obiectiv
                </Button>
              </Grid>
            </Grid>


            {/* Afișarea obiectivelor financiare */}
            <Typography variant="h5" color="white" align="center" sx={{ marginTop: 3 }}>
              Obiective financiare
            </Typography>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {objectives.map((objective) => (
              <Grid item xs={12} sm={6} key={objective.id}>
                <Card sx={{ padding: 2, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="black">
                    {objective.descriere}: {`${objective.suma_obiectiv} RON`}
                  </Typography>
                  <Tooltip
                    title={checkGoalStatus(savings, objective.suma_obiectiv)}
                    placement="top"
                  >
                      <IconButton color="primary">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Șterge obiectiv">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteObjective(objective.id_obiective)} 
                      >
                        ✖
                      </IconButton>
                    </Tooltip>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Rezultate */}
            {result && (
              <Alert severity="success" sx={{ marginTop: 2 }}>
                {result}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ marginTop: 2 }}>
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SavingsAccountPage;
