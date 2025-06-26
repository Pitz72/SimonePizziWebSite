# SimonePizziWebSite - Backend Flask

Sistema backend completo per il sito web di Simone Pizzi con form di contatto sicuro e professionale.

## 🚀 Avvio Rapido

```bash
# Installa dipendenze
pip install -r requirements.txt

# Avvia il server
python app.py
```

Il sito sarà disponibile su: **http://localhost:5000**

## ⚙️ Configurazione Email

### SMTP Runtime Radio (Raccomandato)
Per utilizzare il server SMTP di Runtime Radio, modifica in `app.py`:

```python
EMAIL_CONFIG = {
    'smtp_server': 'mail.runtimeradio.it',
    'smtp_port': 587,
    'sender_email': 'noreply@runtimeradio.it',
    'sender_password': 'your_hosting_password',  # ← Inserisci qui
    'recipient_email': 'pizzisimone1972@gmail.com'
}
```

### SMTP Generico (Alternativo)
Per altri provider hosting:

```python
EMAIL_CONFIG = {
    'smtp_server': 'mail.tuohosting.com',
    'smtp_port': 587,
    'sender_email': 'noreply@tuodominio.it',
    'sender_password': 'your_hosting_password',
    'recipient_email': 'pizzisimone1972@gmail.com'
}
```

### Gmail (Solo per Test)
Solo per ambiente di sviluppo:

```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'sender_email': 'tuo@gmail.com',
    'sender_password': 'password_app_gmail',
    'recipient_email': 'pizzisimone1972@gmail.com'
}
```

## 🛡️ Sicurezza Multi-Layer

Il sistema implementa **6 livelli di sicurezza**:

1. **Rate Limiting**: Max 3 messaggi ogni 5 minuti per IP
2. **Honeypot Field**: Campo nascosto anti-bot
3. **Pattern Recognition**: Rileva nomi sospetti
4. **Duplicate Detection**: Previene spam con hash MD5
5. **Input Validation**: Lunghezze e formati rigorosi
6. **GDPR Compliance**: Privacy obbligatoria

## 📊 Endpoints API

- `POST /api/contact` - Invio form contatti
- `GET /api/health` - Status del server
- `GET /api/stats` - Statistiche messaggi

## 📁 File di Dati

- `data/contact_log.json` - Log completo messaggi
- `data/rate_limit.json` - Rate limiting per IP
- `data/contact_hashes.json` - Hash anti-duplicati

## 🌐 Deploy Produzione

### 1. Hosting con SMTP
Carica i file e configura la password SMTP del tuo hosting:

```python
'sender_password': 'password_fornita_da_hosting'
```

### 2. Server WSGI
Per produzione, usa Gunicorn invece del server Flask dev:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### 3. Variabili Ambiente
In produzione, usa variabili ambiente invece di hardcoding:

```python
import os
EMAIL_CONFIG = {
    'sender_password': os.environ.get('SMTP_PASSWORD', '')
}
```

## 📧 Template Email

Il sistema invia email professionali con:
- ✅ Design brand Simone Pizzi
- ✅ HTML responsive
- ✅ Metadati completi del contatto
- ✅ Timestamp e dati tecnici

## 🔧 Personalizzazione

### Modifica Sicurezza
In `SECURITY_CONFIG`:

```python
SECURITY_CONFIG = {
    'rate_limit_messages': 3,    # Messaggi per finestra
    'rate_limit_window': 300,    # Secondi (5 minuti)
    'max_name_length': 100,      # Lunghezza massima nome
    'max_message_length': 2000   # Lunghezza massima messaggio
}
```

### Aggiungi Pattern Sospetti
In `SUSPICIOUS_PATTERNS`:

```python
SUSPICIOUS_PATTERNS = [
    'admin', 'test', 'bot', 'spam', 'fake', 'dummy',
    'nuovo_pattern_sospetto'  # ← Aggiungi qui
]
```

## 📈 Monitoraggio

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Statistiche
```bash
curl http://localhost:5000/api/stats
```

Risposta esempio:
```json
{
  "total_messages": 42,
  "successful_messages": 38,
  "failed_messages": 4,
  "success_rate": 90.5,
  "messages_last_7_days": 12,
  "top_subjects": {
    "Collaborazione": 15,
    "Informazioni": 8,
    "Altro": 5
  }
}
```

## 🚨 Troubleshooting

### Email Non Inviate
1. Verifica configurazione SMTP in `EMAIL_CONFIG`
2. Controlla log server per errori
3. Testa connessione SMTP manualmente

### Errori Rate Limiting
File `data/rate_limit.json` corrotto:
```bash
rm data/rate_limit.json  # Il sistema lo ricreerà
```

### Problemi CORS
Il frontend deve chiamare `http://localhost:5000`, non aprire file HTML direttamente.

## 📝 Note Tecniche

- **Framework**: Flask + Flask-CORS
- **Email**: smtplib con STARTTLS
- **Logging**: JSON strutturato
- **Storage**: File JSON (nessun database richiesto)
- **Sicurezza**: Ispirato a Runtime Radio
- **Compatibilità**: Python 3.7+

---

**Simone Pizzi Website Backend v2.0**  
*Sicurezza Enterprise, Semplicità di Configurazione* 