import datetime
from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS
from flask_socketio import SocketIO
import random
from datetime import date, timedelta

#economii
from abc import ABC, abstractmethod

class FinancialOperation(ABC):
    @abstractmethod
    def execute(self, client_id, amount, db_config):
        pass
#economii

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

db_config = {
    'host': 'localhost',
    'user': 'root',  
    'password': 'rootroot',  
    'database': 'utpay'  
}

cache_balance = {}

def get_balance_from_db(client_id):
    if client_id in cache_balance:
        return cache_balance[client_id]
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        query = "SELECT sold, economii FROM cont WHERE id_client = %s"
        cursor.execute(query, (client_id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result:
            cache_balance[client_id] = result
            print(result)
            return result
        else:
            return None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

@app.route('/api/balance', methods=['GET'])
def get_balance():
    client_id = 1 
    balance_data = get_balance_from_db(client_id)
    if balance_data:
        return jsonify({'balance': balance_data['sold'], 'savings': balance_data['economii']})
    else:
        return jsonify({'error': 'Soldul nu a fost găsit pentru acest client'}), 404

def get_client_data(client_id):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT c.id AS client_id, c.nume, c.prenume, c.cnp, c.telefon, c.email, 
                   t.iban, t.sold, t.economii, t.numar_card, t.cvv, t.data_expirare
            FROM client c
            JOIN cont t ON c.id = t.id_client
            WHERE c.id = %s
        """
        cursor.execute(query, (client_id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result:
            return result
        else:
            return None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
    
@app.route('/api/personal-data', methods=['GET'])
def get_personal_data():
    client_id = 1 
    client_data = get_client_data(client_id)
    
    if client_data:
        return jsonify(client_data)
    else:
        return jsonify({'error': 'Datele clientului nu au fost găsite'}), 404
    
@app.route('/api/transfer', methods=['POST'])
def transfer():
    data = request.get_json()
    recipient_id = data.get('clientId')
    amount = data.get('amount')
    
    if not amount:
        return jsonify({'error': 'Amount is missing'}), 400

    try:
    
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT id FROM client WHERE id = %s", (recipient_id,))
        recipient = cursor.fetchone()
        print(f"clientId received: {recipient}")

        if not recipient:
            return jsonify({'error': 'Recipient not found'}), 404

        cursor.execute("SELECT sold FROM cont WHERE id_client = 1")
        sender_account = cursor.fetchone()

        if not sender_account or sender_account['sold'] < amount:
            return jsonify({'error': 'Insufficient funds for the transfer'}), 400

        cursor.execute("UPDATE cont SET sold = sold + %s WHERE id_client = %s", (amount, recipient['id']))
        cursor.execute("UPDATE cont SET sold = sold - %s WHERE id_client = 1", (amount,))

        cursor.execute("""
            INSERT INTO tranzactie (id_expeditor, id_destinatar, suma, data, tip_destinatar, detalii)
            VALUES (%s, %s, %s, NOW(), 'client', NULL)
        """, (1, recipient['id'], amount))

        cursor.execute("""
            INSERT INTO notificare (id_client, mesaj, data_notificare, status)
            VALUES (%s, %s, NOW(), %s)
        """, (1, f'Transfer of {amount} RON to client ID {recipient["id"]} was successful!', 'necitit'))

        connection.commit()

        socketio.emit('transaction_notification', {'message': f'Transfer of {amount} RON was successful!'})

        return jsonify({'success': True})

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'An error occurred while processing the transfer'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/api/debt/pay', methods=['POST'])
def pay_debt():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Name is missing'}), 400

    try:

        nume, prenume = name.split(' ')

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM client WHERE nume = %s AND prenume = %s",
            (nume, prenume)
        )
        client = cursor.fetchone()

        if not client:
            return jsonify({'error': 'Recipient not found'}), 404

        recipient_id = client['id']

        cursor.execute(
            "SELECT datorie FROM prietenie WHERE id_client1 = %s AND id_client2 = %s",
            (1, recipient_id)
        )
        debt = cursor.fetchone()

        if not debt:
            return jsonify({'error': 'No debt found with this client'}), 404

        amount = debt['datorie']

        cursor.execute("SELECT sold FROM cont WHERE id_client = 1")
        sender_account = cursor.fetchone()

        if sender_account['sold'] < amount:
            return jsonify({'error': 'Insufficient funds for the transfer'}), 400

        cursor.execute("UPDATE cont SET sold = sold + %s WHERE id_client = %s", (amount, recipient_id))
        cursor.execute("UPDATE cont SET sold = sold - %s WHERE id_client = 1", (amount,))

        cursor.execute(
            "UPDATE prietenie SET datorie = 0 WHERE id_client1 = %s AND id_client2 = %s",
            (1, recipient_id)
        )
        connection.commit()

        return jsonify({'success': True, 'message': f'Debt of {amount} RON paid to {name} successfully!'}), 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'An error occurred while processing the debt payment'}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route('/api/client-by-phone/<phone_number>', methods=['GET'])
def get_client_by_phone(phone_number):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT nume, prenume FROM client WHERE telefon = %s", (phone_number,))
        client = cursor.fetchone()
        cursor.close()
        connection.close()
        if client:
            return jsonify(client)
        else:
            return jsonify({'error': 'Clientul nu a fost găsit'}), 404
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea datelor clientului'}), 500

@app.route('/api/client-by-name/<nume>/<prenume>', methods=['GET'])
def get_client_by_name(nume, prenume):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id FROM client WHERE nume = %s AND prenume = %s", (nume, prenume))
        client = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if client:
            return jsonify(client)
        else:
            return jsonify({'error': 'Clientul nu a fost găsit'}), 404
            
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea datelor clientului'}), 500

@app.route('/api/transaction-history', methods=['GET'])
def transaction_history():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT t.suma, t.data, t.id_expeditor, t.id_destinatar, t.id_magazin,
                   c1.nume AS from_nume, c1.prenume AS from_prenume, 
                   c2.nume AS to_nume, c2.prenume AS to_prenume, 
                   m.nume AS magazin_nume, m.adresa AS magazin_adresa
            FROM tranzactie t
            LEFT JOIN client c1 ON t.id_expeditor = c1.id
            LEFT JOIN client c2 ON t.id_destinatar = c2.id
            LEFT JOIN magazin m ON t.id_magazin = m.id
            WHERE t.id_expeditor = 1 OR t.id_destinatar = 1
            ORDER BY t.data DESC
        """)

        transactions = cursor.fetchall()
        for transaction in transactions:
            
            if transaction['id_expeditor'] == 1:
                transaction['suma'] = -transaction['suma']  
            elif transaction['id_destinatar'] == 1:
                transaction['suma'] = '+' + str(transaction['suma'])
        return jsonify(transactions)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea istoricului tranzacțiilor'}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/notificare', methods=['POST'])
def add_notificare():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        data = request.json
        id_client = data.get('id_client')
        mesaj = data.get('mesaj')
        
        if not id_client or not mesaj:
            return jsonify({'error': 'Lipsesc datele necesare'}), 400
        
        data_notificare = datetime.now()
        cursor.execute("""
            INSERT INTO notificare (id_client, mesaj, data_notificare, status)
            VALUES (%s, %s, %s, %s)
        """, (id_client, mesaj, data_notificare, 'necitit'))
        
        connection.commit()
        return jsonify({'success': True}), 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la salvarea notificării'}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT platforma.nume AS name, platforma.pret AS price, abonament.data_inceput AS start_date
            FROM abonament
            JOIN platforma ON abonament.id_platforma = platforma.id
            WHERE abonament.id_client = %s
        """, (1,))
        
        subscriptions = cursor.fetchall()
        return jsonify(subscriptions)
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea abonamentelor'}), 500
    
    finally:
        cursor.close()
        connection.close()

@app.route('/api/add-friend', methods=['POST'])
def add_friend():

    data = request.get_json()
    
    nume = data.get('nume')
    prenume = data.get('prenume')
    cnp = data.get('cnp')
    telefon = data.get('telefon')
    email = data.get('email')
    
    if not nume or not prenume or not cnp or not telefon or not email:
        return jsonify({'error': 'Toate câmpurile sunt necesare!'}), 400

    try:

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO client (nume, prenume, cnp, telefon, email)
            VALUES (%s, %s, %s, %s, %s)
        """, (nume, prenume, cnp, telefon, email))

        client_id = cursor.lastrowid

        iban_base = "RO49AAAA1B31007593"
        iban_random = str(random.randint(100000, 999999))
        iban = iban_base + iban_random
        card_number = ''.join([str(random.randint(0, 9)) for _ in range(16)])
        cvv = random.randint(100, 999)

        expiry_year = random.randint(2028, 2035)
        expiry_month = random.randint(1, 12)
        expiry_day = 1
        expiry_date = date(expiry_year, expiry_month, expiry_day).isoformat()

        cursor.execute("""
            INSERT INTO cont (id_client, iban, sold, economii, numar_card, cvv, data_expirare)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (client_id, iban, 0, 0, card_number, cvv, expiry_date))

        cursor.execute("""
            INSERT INTO prietenie (id_client1, id_client2, datorie)
            VALUES (%s, %s, %s)
        """, (1, client_id, 0))
        
        connection.commit()
        return jsonify({'success': True, 'message': 'Prieten adăugat cu succes!'}), 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la adăugarea prietenului.'}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, nume, prenume FROM client")
        clients = cursor.fetchall()
        return jsonify(clients), 200
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Eroare la obținerea listei de clienți'}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/subscriptions/delete', methods=['DELETE'])
def delete_subscription_by_name():
    try:
        platform_name = request.json.get('platform_name')
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM platforma WHERE nume = %s", (platform_name,))
        platform = cursor.fetchone()

        if not platform:
            return jsonify({'error': 'Platforma nu a fost găsită'}), 404

        platform_id = platform[0]
        cursor.execute("DELETE FROM abonament WHERE id_platforma = %s AND id_client = %s", (platform_id, 1))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Abonamentul nu a fost găsit sau deja șters'}), 404

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la ștergerea abonamentului'}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/api/debt', methods=['GET'])
def get_debt_data():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT CONCAT(p2.nume, ' ', p2.prenume) AS name, pr.datorie AS amount, DATE(pr.data_datorie) AS date
            FROM prietenie pr
            JOIN client p2 ON pr.id_client2 = p2.id
            WHERE pr.id_client1 = %s
        """, (1,))
        
        debt_data = cursor.fetchall()
        return jsonify(debt_data)
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Error fetching debt data'}), 500
    
    finally:
        cursor.close()
        connection.close()


#economii 
#depunere
class Deposit(FinancialOperation):
    def execute(self, client_id, amount, db_config):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            # Obținem soldul curent al clientului
            cursor.execute("SELECT sold, economii FROM cont WHERE id_client = %s", (client_id,))
            result = cursor.fetchone()

            if result is None:
                return {'error': 'Client not found'}

            current_balance = result[0]  # Soldul curent
            current_savings = result[1]  # Economiile curente

            # Verificăm dacă suma depusă nu este mai mare decât soldul curent
            if amount > current_balance:
                return {'error': 'Deposit amount cannot be greater than current balance'}

            #(scădem suma din sold)
            new_balance = current_balance - amount

            #(adăugăm suma la economii)
            new_savings = current_savings + amount

            #executăm interogările pentru actualizarea soldului și economiilor
            cursor.execute("UPDATE cont SET sold = %s, economii = %s WHERE id_client = %s", 
                           (new_balance, new_savings, client_id))

            connection.commit()

            #reobținem economiile și soldul actualizat
            cursor.execute("SELECT sold, economii FROM cont WHERE id_client = %s", (client_id,))
            result = cursor.fetchone()

            return {'success': True, 'balance': result[0], 'savings': result[1]} if result else {'error': 'Client not found'}

        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return {'error': 'Database error'}
        finally:
            cursor.close()
            connection.close()
@app.route('/api/deposit', methods=['POST'])
def deposit():
    data = request.json
    amount = data.get('amount', 0)

    strategy = Deposit()
    result = strategy.execute(1, amount, db_config)
    if result.get('success'):
        return jsonify(result)
    else:
        return jsonify(result), 400

#retragere
class Withdraw(FinancialOperation):
    def execute(self, client_id, amount, db_config):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            # Obținem soldul curent și economiile
            cursor.execute("SELECT sold, economii FROM cont WHERE id_client = %s", (client_id,))
            result = cursor.fetchone()

            if not result:
                return {'error': 'Client not found'}

            current_balance = result[0]  # Soldul curent
            current_savings = result[1]  # Economiile curente

            # Verificăm dacă clientul are fonduri suficiente în economii
            if current_savings < amount:
                return {'error': 'Fonduri insuficiente pentru retragere'}

            # Retragem suma din economii și o adăugăm în soldul curent
            new_savings = current_savings - amount
            new_balance = current_balance + amount

            # Executăm interogarea pentru actualizarea economiilor și a soldului
            cursor.execute("UPDATE cont SET sold = %s, economii = %s WHERE id_client = %s", 
                           (new_balance, new_savings, client_id))

            connection.commit()

            # Reobținem soldul și economiile actualizate
            cursor.execute("SELECT sold, economii FROM cont WHERE id_client = %s", (client_id,))
            result = cursor.fetchone()

            # Verificăm dacă clientul a fost găsit și returnăm valorile actualizate
            return {'success': True, 'balance': result[0], 'savings': result[1]} if result else {'error': 'Client not found'}

        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return {'error': 'Database error'}
        finally:
            cursor.close()
            connection.close()

@app.route('/api/withdraw', methods=['POST'])
def withdraw():
    data = request.json
    amount = data.get('amount', 0)

    strategy = Withdraw()
    result = strategy.execute(1, amount, db_config)
    
    if result.get('success'):
        return jsonify(result)  # Returnează result care conține soldul și economiile actualizate
    else:
        return jsonify(result), 400


#obiectiv
def get_objectives(client_id):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id_obiective, suma_obiectiv, descriere FROM obiective WHERE client_id = %s", (client_id,))
        return cursor.fetchall()
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/objectives', methods=['GET'])
def get_objectives_data():
    client_id = 1  
    objectives_data = get_objectives(client_id)

    if objectives_data:
        return jsonify(objectives_data)
        print(objectives_data)
    else:
        return jsonify({'error': 'Obiectivele clientului nu au fost găsite'}), 404



#sterge obiectiv
@app.route('/api/objectives/<int:objective_id>', methods=['DELETE'])
def delete_objective(objective_id):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Șterge obiectivul cu ID-ul specificat
        cursor.execute("DELETE FROM obiective WHERE id_obiective = %s AND client_id = %s", (objective_id, 1))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'success': True, 'message': 'Obiectiv șters cu succes'}), 200
        else:
            return jsonify({'error': 'Obiectivul nu a fost găsit'}), 404
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la ștergerea obiectivului'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

#adaugare nou obiectiv
@app.route('/api/add_objectives', methods=['POST'])
def add_objective():
    try:
        data = request.get_json()
        descriere = data.get('descriere')
        suma_obiectiv = data.get('suma_obiectiv')

        if not descriere or not suma_obiectiv:
            return jsonify({'error': 'Descrierea și suma obiectivului sunt necesare!'}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        query = """
            INSERT INTO obiective (client_id, descriere, suma_obiectiv)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (1, descriere, suma_obiectiv))  
        connection.commit()

        new_objective = {
            'id_obiective': cursor.lastrowid,
            'descriere': descriere,
            'suma_obiectiv': suma_obiectiv,
        }

        return jsonify({'success': True, 'newObjective': new_objective}), 201
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la adăugarea obiectivului'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

#economii


@app.route('/api/add-debt', methods=['POST'])
def add_debt():
    try:
        data = request.get_json()
        payer_id = data['payerId']
        client_id = data['clientId']
        amount = data['amount']

        if not payer_id or not client_id or not amount or amount <= 0:
            return jsonify({'error': 'Date invalide pentru datoria adăugată'}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query_check = """
            SELECT datorie FROM prietenie
            WHERE id_client1 = %s AND id_client2 = %s
        """
        cursor.execute(query_check, (client_id, payer_id))
        existing_debt = cursor.fetchone()

        if existing_debt:
            new_amount = existing_debt[0] + amount 
            query_update = """
                UPDATE prietenie
                SET datorie = %s
                WHERE (id_client1 = %s AND id_client2 = %s)
            """
            cursor.execute(query_update, (new_amount, client_id, payer_id))
            connection.commit()
            message = f"Suma datorată a fost actualizată la {new_amount} RON."
        else:
            
            current_date = date.today().strftime('%Y-%m-%d')  
            query_insert = """
                INSERT INTO prietenie (id_client1, id_client2, datorie, data_datorie)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query_insert, (client_id, payer_id, amount, current_date))
            connection.commit()
            message = f"Datoria a fost adăugată cu succes! Suma datorată este {amount} RON."

        cursor.close()
        connection.close()

        return jsonify({'message': message}), 201

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la adăugarea datoriei'}), 500

if __name__ == '__main__':
    #app.run(debug=True)
    socketio.run(app, debug=True, port=8002)


