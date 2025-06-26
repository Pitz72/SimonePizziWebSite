#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backend Flask per gestione form di contatto
Simone Pizzi Website - Contact Form Handler

Questo script gestisce l'invio delle email dal form di contatto del sito.
Utilizza SMTP Gmail per l'invio delle email.
"""

import os
import json
import smtplib
import hashlib
import time
from datetime import datetime, timedelta
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

# Configurazione Flask
app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
CORS(app, origins=['https://simonepizzi.runtimeradio.it', 'http://localhost:8080'])

# Configurazione email SMTP
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'pizzisimone1972@gmail.com'
SENDER_PASSWORD = 'INSERISCI_QUI_LA_PASSWORD_DELL_APP_GMAIL'  # Da configurare
RECIPIENT_EMAIL = 'pizzisimone1972@gmail.com'

# Directory per i file di dati
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# File di log e rate limiting
CONTACT_LOG_FILE = os.path.join(DATA_DIR, 'contact_log.json')
RATE_LIMIT_FILE = os.path.join(DATA_DIR, 'rate_limit.json')
CONTACT_HASHES_FILE = os.path.join(DATA_DIR, 'contact_hashes.json')

def load_json_file(filepath, default=None):
    """Carica un file JSON, ritorna default se non esiste"""
    if default is None:
        default = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default

def save_json_file(filepath, data):
    """Salva dati in un file JSON"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Errore nel salvare {filepath}: {e}")
        return False

def get_client_ip():
    """Ottiene l'IP del client considerando i proxy"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def is_rate_limited(ip_address, max_requests=5, time_window=3600):
    """Verifica se un IP ha superato il limite di richieste"""
    rate_limits = load_json_file(RATE_LIMIT_FILE, {})
    current_time = time.time()
    
    if ip_address not in rate_limits:
        rate_limits[ip_address] = []
    
    # Rimuovi richieste vecchie fuori dalla finestra temporale
    rate_limits[ip_address] = [
        timestamp for timestamp in rate_limits[ip_address] 
        if current_time - timestamp < time_window
    ]
    
    # Verifica se ha superato il limite
    if len(rate_limits[ip_address]) >= max_requests:
        return True
    
    # Aggiungi la richiesta corrente
    rate_limits[ip_address].append(current_time)
    save_json_file(RATE_LIMIT_FILE, rate_limits)
    return False

def create_message_hash(name, email, message):
    """Crea un hash del messaggio per rilevare duplicati"""
    content = f"{name.lower()}{email.lower()}{message.lower()}"
    return hashlib.md5(content.encode()).hexdigest()

def is_duplicate_message(message_hash, time_window=300):
    """Verifica se il messaggio è un duplicato recente"""
    hashes = load_json_file(CONTACT_HASHES_FILE, {})
    current_time = time.time()
    
    # Rimuovi hash vecchi
    for hash_key in list(hashes.keys()):
        if current_time - hashes[hash_key] > time_window:
            del hashes[hash_key]
    
    if message_hash in hashes:
        return True
    
    hashes[message_hash] = current_time
    save_json_file(CONTACT_HASHES_FILE, hashes)
    return False

def validate_email(email):
    """Validazione semplice dell'email"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def log_contact_attempt(ip_address, name, email, subject, success=True, error_msg=None):
    """Registra il tentativo di contatto nel log"""
    log_data = load_json_file(CONTACT_LOG_FILE, [])
    
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'ip_address': ip_address,
        'name': name,
        'email': email,
        'subject': subject,
        'success': success,
        'error': error_msg
    }
    
    log_data.append(log_entry)
    
    # Mantieni solo gli ultimi 1000 log per evitare file troppo grandi
    if len(log_data) > 1000:
        log_data = log_data[-1000:]
    
    save_json_file(CONTACT_LOG_FILE, log_data)

def send_email(name, email, subject, message):
    """Invia l'email tramite SMTP Gmail"""
    try:
        # Crea il messaggio email
        msg = MimeMultipart('alternative')
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECIPIENT_EMAIL
        msg['Subject'] = f"[CONTATTO SITO] {subject}"
        
        # Template HTML dell'email
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
                .highlight {{ color: #00ff88; font-weight: 600; }}
                .info-box {{ background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #00ff88; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">📧 Nuovo Messaggio dal Sito</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">simonepizzi.runtimeradio.it</p>
                </div>
                <div class="content">
                    <div class="info-box">
                        <strong>👤 Nome:</strong> <span class="highlight">{name}</span><br>
                        <strong>📧 Email:</strong> <span class="highlight">{email}</span><br>
                        <strong>📝 Oggetto:</strong> <span class="highlight">{subject}</span><br>
                        <strong>🕒 Data:</strong> {datetime.now().strftime('%d/%m/%Y alle %H:%M')}
                    </div>
                    
                    <h3 style="color: #1a1a1a; margin-top: 25px;">💬 Messaggio:</h3>
                    <div style="background: white; padding: 20px; border-radius: 5px; border: 1px solid #ddd; white-space: pre-wrap;">{message}</div>
                    
                    <div class="footer">
                        <p>📱 Messaggio ricevuto tramite il form di contatto del sito web<br>
                        🔗 <a href="https://simonepizzi.runtimeradio.it" style="color: #00ff88;">simonepizzi.runtimeradio.it</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Versione testo
        text_body = f"""
Nuovo messaggio dal sito simonepizzi.runtimeradio.it

Nome: {name}
Email: {email}
Oggetto: {subject}
Data: {datetime.now().strftime('%d/%m/%Y alle %H:%M')}

Messaggio:
{message}

---
Messaggio ricevuto tramite il form di contatto del sito web.
        """
        
        # Aggiungi entrambe le versioni
        msg.attach(MimeText(text_body, 'plain', 'utf-8'))
        msg.attach(MimeText(html_body, 'html', 'utf-8'))
        
        # Connessione SMTP e invio
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        return True, None
        
    except Exception as e:
        return False, str(e)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'Contact Form API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    """Gestisce l'invio del form di contatto"""
    client_ip = get_client_ip()
    
    try:
        # Verifica Content-Type
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve essere application/json'}), 400
        
        data = request.get_json()
        
        # Validazione campi obbligatori
        required_fields = ['name', 'email', 'subject', 'message', 'privacy']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} obbligatorio'}), 400
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        subject = data['subject']
        message = data['message'].strip()
        privacy = data['privacy']
        
        # Validazioni
        if len(name) < 2 or len(name) > 100:
            return jsonify({'error': 'Il nome deve essere tra 2 e 100 caratteri'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Indirizzo email non valido'}), 400
        
        if len(message) < 10 or len(message) > 2000:
            return jsonify({'error': 'Il messaggio deve essere tra 10 e 2000 caratteri'}), 400
        
        if not privacy:
            return jsonify({'error': 'È necessario accettare il trattamento dei dati personali'}), 400
        
        # Rate limiting
        if is_rate_limited(client_ip):
            log_contact_attempt(client_ip, name, email, subject, False, 'Rate limit exceeded')
            return jsonify({'error': 'Troppe richieste. Riprova tra un\'ora.'}), 429
        
        # Controllo duplicati
        message_hash = create_message_hash(name, email, message)
        if is_duplicate_message(message_hash):
            log_contact_attempt(client_ip, name, email, subject, False, 'Duplicate message')
            return jsonify({'error': 'Messaggio duplicato. Attendere prima di inviare nuovamente.'}), 409
        
        # Controlla configurazione email
        if SENDER_PASSWORD == 'INSERISCI_QUI_LA_PASSWORD_DELL_APP_GMAIL':
            log_contact_attempt(client_ip, name, email, subject, False, 'Email not configured')
            return jsonify({'error': 'Servizio email non configurato. Contatta direttamente pizzisimone1972@gmail.com'}), 503
        
        # Invio email
        success, error_msg = send_email(name, email, subject, message)
        
        if success:
            log_contact_attempt(client_ip, name, email, subject, True)
            return jsonify({
                'message': 'Messaggio inviato con successo! Ti risponderò al più presto.',
                'status': 'success'
            })
        else:
            log_contact_attempt(client_ip, name, email, subject, False, error_msg)
            return jsonify({'error': f'Errore nell\'invio dell\'email: {error_msg}'}), 500
            
    except Exception as e:
        log_contact_attempt(client_ip, 'unknown', 'unknown', 'unknown', False, str(e))
        return jsonify({'error': 'Errore interno del server'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint non trovato'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Errore interno del server'}), 500

if __name__ == '__main__':
    print("🚀 Avvio server Flask per Contact Form...")
    print(f"📧 Email configurata: {SENDER_EMAIL}")
    print(f"📁 Directory dati: {DATA_DIR}")
    print("⚠️  IMPORTANTE: Configurare SENDER_PASSWORD nel file app.py")
    print("🌐 Server disponibile su: http://localhost:5000")
    print("🔗 Health check: http://localhost:5000/api/health")
    print("📮 Endpoint contatti: http://localhost:5000/api/contact")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 