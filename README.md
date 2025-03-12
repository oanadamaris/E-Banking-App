**UTPay** reprezintă o aplicație financiară complexă, dezvoltată pentru a oferi utilizatorilor funcționalități avansate de gestionare a fondurilor, efectuare de tranzacții și monitorizare a finanțelor personale. Printr-un design modern și o interfață intuitivă, aplicația facilitează gestionarea tranzacțiilor, a economiilor și a abonamentelor, oferind în același timp instrumente eficiente pentru monitorizarea datoriilor și planificarea financiară.

Sistemul este construit pe un backend robust cu Flask și MySQL și un frontend prietenos realizat în React, oferind o experiență optimizată pentru utilizator.

**Funcționalități:**
1. **Transfer de bani:**
Posibilitatea de a efectua tranzacții clasice prin selectarea manuală a destinatarului și introducerea sumei.
Generare și scanare de coduri QR pentru tranzacții rapide:
Câmpurile „To Whom” și „Amount” se completează automat după scanarea codului QR.
Funcționalitatea „Split the bill”:
Permite împărțirea notei de plată cu prietenii.
Calcul automat al sumei de plată per persoană.
Transfer direct al fondurilor către persoana care a plătit.
2. **Pagina de economii:**
Afișarea soldului curent și a economiilor acumulate.
Gestionarea obiectivelor financiare:
Adăugarea, afișarea, progresul și ștergerea obiectivelor financiare.
Depuneri și retrageri validate pe baza soldului disponibil.
Notificări vizuale pentru succesul sau erorile operațiunilor.
3. **Pagina de datorii:**
Evidența datoriilor către prieteni, cu posibilitatea:
De a plăti datoriile existente.
De a adăuga datorii noi.
Notificări automate pentru datoriile neplătite:
Reamintire lunară pentru datorii mai vechi de 1 lună.
Afișare pe pagina principală pentru datorii mai vechi de 6 luni.
4. **Istoric tranzacții:**
Vizualizarea detaliilor fiecărei tranzacții:
Suma, data, ora și destinatarul.
5. **Subscriptions:**
Monitorizarea abonamentelor utilizatorului.
Identificarea abonamentelor care nu sunt suficient utilizate pentru a justifica costul.
6. **Date personale:**
Afișarea informațiilor utilizatorului și a detaliilor cardului.
Aplicația integrează toate aceste funcționalități într-o manieră modulară și extensibilă, fiind ușor de adaptat pentru nevoile viitoare.

**Tehnologii utilizate**

**Backend – Flask**
Framework-ul ales pentru backend a fost Flask, datorită flexibilității și simplității sale. Flask este ușor de utilizat și permite integrarea rapidă a diferitelor funcționalități prin intermediul bibliotecilor disponibile. În plus, fiind un framework minimal, permite o personalizare mai mare și un control complet asupra aplicației. Flask a fost ideal pentru acest proiect, având în vedere cerințele sale de performanță și modularitate.

**Baza de date – MySQL**
Pentru stocarea datelor a fost utilizat MySQL, datorită scalabilității și performanței sale. Structura bazei de date a fost proiectată astfel încât să permită relații eficiente între tabele, iar informațiile să poată fi accesate rapid. De asemenea, MySQL oferă o integrare ușoară cu Flask prin intermediul unor biblioteci precum mysql-connector-python.

**Frontend – React**
React a fost utilizat pentru dezvoltarea interfeței utilizator. Fiind o tehnologie modernă bazată pe component-based architecture, React a permis crearea unei aplicații frontend performante, scalabile și ușor de întreținut. Utilizarea Virtual DOM și a unor biblioteci precum Material-UI a contribuit la o experiență de utilizare plăcută și dinamică.

**Socket.IO**
Pentru notificările în timp real, proiectul a integrat Socket.IO, care permite comunicarea bidirecțională între server și client. Această tehnologie asigură livrarea instantă a notificărilor către utilizatori.

**Coduri QR – ZXing și QRCode**
Pentru generarea și scanarea codurilor QR s-au utilizat librăriile @zxing/browser și qrcode. Acestea permit inițierea transferurilor direct prin scanarea unui cod QR asociat unui cont sau unei tranzacții.
