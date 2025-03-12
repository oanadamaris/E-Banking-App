import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../../components/home-page/HomePage'; 
import TransferPage from '../../components/transfer-page/TransferPage'; 
import PersonalDataPage from '../../components/personal-data-page/PersonalDataPage'; 
import TransactionHistoryPage from '../../components/transaction-history-page/TransactionHistoryPage'; 
import SavingsAccountPage from '../../components/savings-account-page/SavingsAccountPage'; 
import SubscriptionsPage from '../../components/subscriptions-page/SubscriptionsPage';
import DebtPage from '../../components/debt-page/DebtPage'; 


const Routing = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transfer" element={<TransferPage />} />  {/* Ruta pentru Transfer */}
            <Route path="/personal-data" element={<PersonalDataPage />} />
            <Route path="/transaction-history-page" element={<TransactionHistoryPage />} />
            <Route path="/savings-account" element={<SavingsAccountPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/debt" element={<DebtPage />} />
        </Routes>
    );
}

export default Routing;
