# Backend Contact Form - Simone Pizzi Website

Backend Flask per gestire l'invio delle email dal form di contatto del sito simonepizzi.runtimeradio.it.

## 🚀 Avvio Rapido

### 1. Installa le dipendenze
```bash
pip install -r requirements.txt
```

### 2. Configura la password Gmail
Modifica il file `app.py` alla riga con `SENDER_PASSWORD` e inserisci la password dell'app Gmail:

```python
SENDER_PASSWORD = 'la_tua_password_app_gmail_di_16_caratteri'
```

### 3. Avvia il server
```bash
python start_server.py
```
oppure
```bash
python app.py
```

## 🔧 Configurazione Gmail

### Generare una Password App Gmail

1. **Vai alle impostazioni del tuo account Google:**
   - https://myaccount.google.com/security

2. **Abilita la verifica in due passaggi** (se non già attiva)

3. **Genera una password app:**
   - https://myaccount.google.com/apppasswords
   - Seleziona "App" → "Altro (nome personalizzato)"
   - Inserisci "Simone Pizzi Website"
   - Copia la password di 16 caratteri generata

4. **Configura il backend:**
   - Apri `app.py`
   - Trova la riga `SENDER_PASSWORD = 'INSERISCI_QUI_LA_PASSWORD_DELL_APP_GMAIL'`
   - Sostituisci con la password generata: `SENDER_PASSWORD = 'abcd efgh ijkl mnop'`

⚠️ **IMPORTANTE:** Non usare mai la password normale di Gmail! Usa solo la password app.

## 🌐 Endpoints API

### Health Check
```
GET /api/health
```
Risposta:
```json
{
  "status": "ok",
  "service": "Contact Form API",
  "version": "1.0.0",
  "timestamp": "2025-01-26T10:30:00.000Z"
}
```

### Contact Form
```
POST /api/contact
Content-Type: application/json
```

Payload:
```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "subject": "Collaborazione Podcast",
  "message": "Ciao Simone, volevo contattarti per...",
  "privacy": true
}
```

Risposta di successo:
```json
{
  "message": "Messaggio inviato con successo! Ti risponderò al più presto.",
  "status": "success"
}
```

Risposta di errore:
```json
{
  "error": "Campo email obbligatorio"
}
```

## 🛡️ Sicurezza e Rate Limiting

### Protezioni Implementate

- **Rate Limiting:** Max 5 richieste per ora per IP
- **Anti-Duplicazione:** Blocca messaggi identici per 5 minuti
- **Validazione Input:** Controlli su lunghezza e formato dei campi
- **CORS:** Configurato per simonepizzi.runtimeradio.it e localhost:8080
- **Logging:** Tutti i tentativi vengono registrati

### File di Dati

Il sistema crea automaticamente una cartella `data/` con:

- `contact_log.json` - Log di tutti i messaggi
- `rate_limit.json` - Tracciamento rate limiting per IP
- `contact_hashes.json` - Hash per rilevare duplicati

## 🔍 Monitoraggio

### Log dei Messaggi
Tutti i messaggi vengono registrati con:
- Timestamp
- IP del mittente
- Dati del contatto (nome, email, oggetto)
- Stato di successo/errore
- Eventuali messaggi di errore

### Rate Limiting
Il sistema traccia automaticamente:
- Richieste per IP nell'ultima ora
- Blocco automatico dopo 5 richieste
- Reset automatico dopo 1 ora

## 🚨 Risoluzione Problemi

### Il server non si avvia
```bash
# Verifica la versione Python (richiesto 3.8+)
python --version

# Reinstalla le dipendenze
pip install -r requirements.txt --force-reinstall
```

### Le email non vengono inviate
1. Verifica che la password Gmail sia configurata correttamente
2. Controlla che la verifica in due passaggi sia attiva su Gmail
3. Controlla i log del server per errori SMTP

### Errori 404 sui form
- Il frontend deve puntare a `/api/contact`
- Verifica che il server sia in ascolto sulla porta 5000
- Controlla la configurazione CORS in `app.py`

### Rate limiting troppo aggressivo
Modifica i parametri in `app.py`:
```python
# Aumenta il limite di richieste o la finestra temporale
if is_rate_limited(client_ip, max_requests=10, time_window=7200):  # 10 req/2h
```

## 🔧 Personalizzazione

### Modifica Template Email
Modifica la funzione `send_email()` in `app.py` per personalizzare:
- Oggetto dell'email
- Template HTML
- Formato del messaggio

### Aggiunta Campi Form
Per aggiungere nuovi campi al form:
1. Aggiorna la validazione in `handle_contact()`
2. Modifica il template email in `send_email()`
3. Aggiorna il frontend JavaScript

## 📊 Performance

### Raccomandazioni per Produzione

1. **Reverse Proxy:** Usa Nginx o Apache davanti a Flask
2. **WSGI Server:** Usa Gunicorn invece del server Flask built-in
3. **Database:** Sostituisci i file JSON con PostgreSQL/MySQL
4. **Caching:** Implementa Redis per rate limiting
5. **SSL/TLS:** Configura HTTPS per la sicurezza

### Esempio Configurazione Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📋 TODO Future Implementazioni

- [ ] Integrazione database PostgreSQL
- [ ] Dashboard amministrativa
- [ ] Notifiche email multiple
- [ ] API per statistiche messaggi
- [ ] Backup automatico dei dati
- [ ] Integrazione con servizi di monitoring

---

**Autore:** Simone Pizzi  
**Versione:** 1.0.0  
**Ultimo aggiornamento:** Gennaio 2025 