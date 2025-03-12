# 🏦 UtPay - E-Banking Application  

A modern e-banking platform designed to simplify financial management, offering features like QR transfers, bill splitting, savings goals, and debt tracking.  

---

## 📖 Table of Contents  
- [📌 Description](#-description)  
  - [💛 Motivation](#-motivation)  
  - [🎯 Why this project?](#-why-this-project)  
  - [✅ What problem does it solve?](#-what-problem-does-it-solve)  
  - [💡 What we learned](#-what-we-learned)  
- [🚀 Usage](#-usage)  
  - [🔑 Key Features](#-key-features)  
  - [🖼️ Preview](#%EF%B8%8F-preview)  
- [✨ Technical Highlights](#-technical-highlights)  
- [🛠️ Built With](#%EF%B8%8F-built-with)  
- [👥 Collaboration](#-collaboration)  

---

## 📌 Description  

UtPay empowers users to manage funds, split bills, track debts, and achieve savings goals through an intuitive interface. Built with modularity and scalability in mind.  

### 💛 Motivation  
Traditional banking apps often lack flexibility for peer-to-peer interactions. UtPay addresses this with features like QR-based transfers and automated bill splitting, making financial management seamless.  

### 🎯 Why this project?  
We aimed to explore modern web development practices, integrate design patterns, and solve real-world financial coordination challenges.  

### ✅ What problem does it solve?  
- Eliminates manual transaction errors and tedious processes through QR automation.  
- Simplifies group payments with **Split the Bill**.  
- Tracks debts and subscriptions to avoid overspending.  
- Encourages savings with goal-oriented features.  

### 💡 What we learned  
- **React.js** for dynamic frontend interfaces.  
- **Python/Flask** for REST API development.  
- **Design Patterns**: Observer (notifications), Strategy (savings operations).  
- **MySQL** for relational data management.  
- **Socket.IO** for real-time notifications.  

---

## 🚀 Usage  

### 🔑 Key Features  
1. **QR Code Transfers**  
   - Generate/scan QR codes to auto-fill recipient and amount.
  
   <img width="600" src="https://github.com/user-attachments/assets/99a47cbe-b690-4133-9807-d7c5d8dcaf3a" />
  
2. **Split the Bill**  
   - Automatically divide expenses among friends and send payment requests.

   <img width="600" src="https://github.com/user-attachments/assets/a3ea6429-f20f-44ff-b244-2edb208e0041" />
   
      
3. **Savings Goals**  
   - Set targets, track progress, and manage deposits/withdrawals.

   <img width="600" src="https://github.com/user-attachments/assets/f357fc82-b081-456c-acaa-371fe4df1ab5" />

     
4. **Debt Management**  
   - Track overdue debts with auto-notifications (1-month and 6-month reminders).

   <img width="600" src="https://github.com/user-attachments/assets/5ff5b451-5ffb-4fdc-af07-f9892a6ef338" />


5. **Subscription Tracker**  
   - Monitor active subscriptions and cancel unused ones.
  
   <img width="600" src="https://github.com/user-attachments/assets/a079cea4-e9c7-409e-8f3f-610669465866" />


### 🖼️ Preview  

<img width="600" src="https://github.com/user-attachments/assets/a19d0f94-1fd8-4a51-9d42-f73de778d01f" />


---

## ✨ Technical Highlights  
✅ **Design Patterns**  
- **Observer**: Real-time notifications for transactions and overdue debts.  
- **Strategy**: Modular logic for savings operations (deposit, withdraw, goal tracking).  

✅ **Real-Time Updates**  
- Socket.IO triggers UI changes instantly after database updates.  

✅ **Input Validation**  
- Checks for sufficient funds, valid recipients, and debt deadlines.  

✅ **Database Efficiency**  
- MySQL tables for `transactions`, `debts`, `savings`, and `subscriptions`.  
- ACID-compliant transactions for financial operations.  

---

## 🛠️ Built With  
| Technology       | Description                          |  
|------------------|--------------------------------------|  
| **React.js**     | Frontend framework                   |  
| **Python/Flask** | Backend API development              |  
| **MySQL**        | Database management                  |  
| **Socket.IO**    | Real-time notifications              |  

---

## 👥 Collaboration  

This project was developed in collaboration with:  

- **Kulcsar Noemi**: [@KulcsarNoemi](https://github.com/noemikulcsar) 

- **Ureche Simona**: [@SimonaUreche](https://github.com/SimonaUreche)  

---
