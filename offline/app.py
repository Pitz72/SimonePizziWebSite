#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backend Flask per SimonePizziWebSite
Gestisce l'invio email del form di contatto
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
import os
import logging
from datetime import datetime, timedelta
import re
import json
import hashlib
from pathlib import Path

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Abilita CORS per permettere richieste dal frontend

# Configurazione email SMTP Runtime Radio (modifica questi valori)
EMAIL_CONFIG = {
    'smtp_server': 'mail.runtimeradio.it',  # SMTP Server Runtime Radio
    'smtp_port': 587,                       # Porta standard STARTTLS
    'sender_email': 'noreply@runtimeradio.it',    # Email mittente del dominio
    'sender_password': '',                  # Password hosting Runtime Radio
    'recipient_email': 'pizzisimone1972@gmail.com'  # Dove ricevere i messaggi
}

# Configurazione sicurezza
SECURITY_CONFIG = {
    'rate_limit_messages': 3,
    'rate_limit_window': 300,  # 5 minuti in secondi
    'max_name_length': 100,
    'min_name_length': 2,
    'max_message_length': 2000,
    'min_message_length': 10,
    'log_file': 'data/contact_log.json',
    'rate_limit_file': 'data/rate_limit.json',
    'hash_file': 'data/contact_hashes.json'
}

# Crea directory data se non esiste
Path('data').mkdir(exist_ok=True)

# Pattern sospetti per nomi (da Runtime Radio)
SUSPICIOUS_PATTERNS = [
    'admin', 'test', 'bot', 'spam', 'fake', 'dummy', 
    'qwerty', 'asdf', 'xxx', 'null', 'undefined'
]

def validate_email(email):
    """Valida formato email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def load_json_file(filepath, default=None):
    """Carica file JSON con gestione errori"""
    try:
        if Path(filepath).exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Errore caricamento {filepath}: {e}")
    return default or {}

def save_json_file(filepath, data):
    """Salva file JSON con gestione errori"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Errore salvataggio {filepath}: {e}")
        return False

def check_rate_limit(ip_address):
    """Rate limiting - max 3 messaggi ogni 5 minuti per IP"""
    rate_data = load_json_file(SECURITY_CONFIG['rate_limit_file'], {})
    current_time = datetime.now().isoformat()
    
    # Pulizia vecchi record
    cutoff_time = datetime.now() - timedelta(seconds=SECURITY_CONFIG['rate_limit_window'])
    rate_data = {
        ip: timestamps for ip, timestamps in rate_data.items()
        if any(datetime.fromisoformat(ts) > cutoff_time for ts in timestamps)
    }
    
    # Controlla IP corrente
    if ip_address not in rate_data:
        rate_data[ip_address] = []
    
    # Filtra timestamp vecchi per questo IP
    rate_data[ip_address] = [
        ts for ts in rate_data[ip_address]
        if datetime.fromisoformat(ts) > cutoff_time
    ]
    
    # Controlla limite
    if len(rate_data[ip_address]) >= SECURITY_CONFIG['rate_limit_messages']:
        return False
    
    # Aggiungi nuovo timestamp
    rate_data[ip_address].append(current_time)
    save_json_file(SECURITY_CONFIG['rate_limit_file'], rate_data)
    return True

def check_suspicious_name(name):
    """Controlla pattern sospetti nel nome"""
    name_lower = name.lower()
    return any(pattern in name_lower for pattern in SUSPICIOUS_PATTERNS)

def check_duplicate_message(name, email, message):
    """Previene messaggi duplicati usando hash MD5"""
    message_content = f"{name.lower()}{email.lower()}{message.lower()}"
    message_hash = hashlib.md5(message_content.encode()).hexdigest()
    
    hash_data = load_json_file(SECURITY_CONFIG['hash_file'], {})
    current_time = datetime.now().isoformat()
    
    # Pulizia hash vecchi (oltre 1 ora)
    cutoff_time = datetime.now() - timedelta(hours=1)
    hash_data = {
        h: timestamp for h, timestamp in hash_data.items()
        if datetime.fromisoformat(timestamp) > cutoff_time
    }
    
    # Controlla se hash esiste
    if message_hash in hash_data:
        return False
    
    # Salva nuovo hash
    hash_data[message_hash] = current_time
    save_json_file(SECURITY_CONFIG['hash_file'], hash_data)
    return True

def log_contact_message(data, ip_address, success=True, error_msg=None):
    """Logging completo messaggi di contatto"""
    log_data = load_json_file(SECURITY_CONFIG['log_file'], [])
    
    # Assicurati che log_data sia sempre una lista
    if not isinstance(log_data, list):
        log_data = []
    
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'ip_address': ip_address,
        'success': success,
        'name': data.get('name', ''),
        'email': data.get('email', ''),
        'subject': data.get('subject', ''),
        'privacy_accepted': data.get('privacy', False),
        'message_length': len(data.get('message', '')),
        'error_message': error_msg
    }
    
    try:
        log_data.append(log_entry)
        
        # Mantieni solo ultimi 1000 record
        if len(log_data) > 1000:
            log_data = log_data[-1000:]
        
        save_json_file(SECURITY_CONFIG['log_file'], log_data)
    except Exception as e:
        logger.error(f"Errore salvataggio log: {str(e)}")
        # Continua l'esecuzione anche se il logging fallisce

def send_email(name, email, subject, message):
    """Invia email tramite SMTP Runtime Radio"""
    try:
        # Crea messaggio
        msg = MIMEMultipart()
        msg['From'] = formataddr(('Sito Web Simone Pizzi', EMAIL_CONFIG['sender_email']))
        msg['To'] = EMAIL_CONFIG['recipient_email']
        msg['Subject'] = f"[SITO WEB] {subject}"
        
        # Template email professionale (ispirato a Runtime Radio)
        current_time = datetime.now()
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nuovo Contatto - Simone Pizzi</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #111111;">
                
                <!-- Header con brand -->
                <div style="background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #000000;">SIMONE PIZZI</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #000000; opacity: 0.8;">Idee, Storie e Sperimentazione</p>
                </div>
                
                <!-- Intestazione messaggio -->
                <div style="padding: 30px 20px 20px 20px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #00ff88; text-align: center;">
                        📧 Nuovo Messaggio dal Sito Web
                    </h2>
                </div>
                
                <!-- Dati contatto -->
                <div style="margin: 0 20px 20px 20px; background-color: #1a1a1a; border-radius: 12px; padding: 25px; border-left: 4px solid #00ff88;">
                    <h3 style="margin: 0 0 15px 0; color: #00ff88; font-size: 18px;">👤 Dettagli Contatto</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #cccccc; width: 80px;">Nome:</td>
                            <td style="padding: 8px 0; color: #ffffff;">{name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #cccccc;">Email:</td>
                            <td style="padding: 8px 0; color: #00ff88;"><a href="mailto:{email}" style="color: #00ff88; text-decoration: none;">{email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #cccccc;">Oggetto:</td>
                            <td style="padding: 8px 0; color: #ffffff;">{subject}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Messaggio -->
                <div style="margin: 0 20px 30px 20px; background-color: #222222; border-radius: 12px; padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #00ff88; font-size: 18px;">💬 Messaggio</h3>
                    <div style="background-color: #111111; padding: 20px; border-radius: 8px; border-left: 3px solid #00ff88;">
                        <p style="margin: 0; line-height: 1.6; color: #ffffff; white-space: pre-wrap;">{message}</p>
                    </div>
                </div>
                
                <!-- Footer tecnico -->
                <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333333;">
                    <p style="margin: 0; font-size: 12px; color: #666666;">
                        🕐 Ricevuto il {current_time.strftime('%d/%m/%Y alle %H:%M')} <br>
                        🌐 Da: simonepizzi.runtimeradio.it <br>
                        🔒 Sistema Anti-Spam Attivo
                    </p>
                </div>
                
                <!-- Signature -->
                <div style="background-color: #00ff88; padding: 15px 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000000;">
                        Sistema di Contatti Automatico - Simone Pizzi
                    </p>
                </div>
                
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Connessione SMTP
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()
        server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email inviata con successo da {email}")
        return True
        
    except Exception as e:
        logger.error(f"Errore invio email: {str(e)}")
        return False

@app.route('/')
def serve_index():
    """Serve la homepage"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve file statici"""
    return send_from_directory('.', filename)

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    """Gestisce l'invio del form di contatto con sicurezza multi-layer"""
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', '127.0.0.1'))
    
    try:
        # Verifica Content-Type
        if not request.is_json:
            error_msg = 'Content-Type deve essere application/json'
            log_contact_message({}, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': error_msg}), 400
        
        data = request.get_json()
        
        # SICUREZZA 1: Rate Limiting (3 messaggi ogni 5 minuti)
        if not check_rate_limit(ip_address):
            error_msg = 'Troppi messaggi inviati. Riprova tra qualche minuto.'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': error_msg}), 429
        
        # SICUREZZA 2: Honeypot field (anti-bot)
        if data.get('website'):  # Campo honeypot nascosto
            error_msg = 'Rilevato comportamento bot'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': 'Errore di validazione'}), 400
        
        # Validazione campi richiesti
        required_fields = ['name', 'email', 'subject', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            error_msg = f'Campi mancanti: {", ".join(missing_fields)}'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': error_msg}), 400
        
        # Estrazione e pulizia dati
        name = data['name'].strip()
        email = data['email'].strip().lower()
        subject = data['subject'].strip()
        message = data['message'].strip()
        privacy_accepted = data.get('privacy', False)
        
        # SICUREZZA 3: Validazioni lunghezza
        if not (SECURITY_CONFIG['min_name_length'] <= len(name) <= SECURITY_CONFIG['max_name_length']):
            error_msg = f'Il nome deve essere tra {SECURITY_CONFIG["min_name_length"]} e {SECURITY_CONFIG["max_name_length"]} caratteri'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': error_msg}), 400
        
        if not (SECURITY_CONFIG['min_message_length'] <= len(message) <= SECURITY_CONFIG['max_message_length']):
            error_msg = f'Il messaggio deve essere tra {SECURITY_CONFIG["min_message_length"]} e {SECURITY_CONFIG["max_message_length"]} caratteri'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': error_msg}), 400
        
        # SICUREZZA 4: Pattern sospetti
        if check_suspicious_name(name):
            error_msg = 'Nome contiene pattern sospetti'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': 'Formato nome non valido'}), 400
        
        # SICUREZZA 5: Validazione email
        if not validate_email(email):
            error_msg = 'Formato email non valido'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': error_msg}), 400
        
        # SICUREZZA 6: Controllo duplicati
        if not check_duplicate_message(name, email, message):
            error_msg = 'Messaggio duplicato rilevato'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({'success': False, 'message': 'Messaggio già inviato di recente'}), 400
        
        # Validazione GDPR
        if not privacy_accepted:
            error_msg = 'Privacy non accettata'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({
                'success': False,
                'message': 'È necessario accettare il trattamento dei dati personali'
            }), 400
        
        # Controllo configurazione email
        if not EMAIL_CONFIG['sender_password']:
            error_msg = 'Password email non configurata'
            log_contact_message(data, ip_address, False, error_msg)
            logger.error("Password email non configurata")
            return jsonify({
                'success': False,
                'message': 'Servizio email temporaneamente non disponibile'
            }), 503
        
        # Invio email
        if send_email(name, email, subject, message):
            log_contact_message(data, ip_address, True)
            return jsonify({
                'success': True,
                'message': 'Messaggio inviato con successo! Ti risponderò il prima possibile.'
            })
        else:
            error_msg = 'Errore SMTP durante invio'
            log_contact_message(data, ip_address, False, error_msg)
            return jsonify({
                'success': False,
                'message': 'Errore durante l\'invio. Riprova tra qualche minuto.'
            }), 500
            
    except Exception as e:
        error_msg = f'Eccezione server: {str(e)}'
        log_contact_message(data if 'data' in locals() else {}, ip_address, False, error_msg)
        logger.error(f"Errore handler contact: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Errore interno del server'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint per verificare lo stato del server"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'email_configured': bool(EMAIL_CONFIG['sender_password'])
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Endpoint per consultare statistiche messaggi (per admin)"""
    try:
        log_data = load_json_file(SECURITY_CONFIG['log_file'], [])
        
        # Assicurati che log_data sia sempre una lista
        if not isinstance(log_data, list):
            log_data = []
        
        # Calcola statistiche
        total_messages = len(log_data)
        successful_messages = len([msg for msg in log_data if msg.get('success', False)])
        failed_messages = total_messages - successful_messages
        
        # Statistiche per soggetto
        subjects = {}
        for msg in log_data:
            if msg.get('success', False):
                subject = msg.get('subject', 'Altro')
                subjects[subject] = subjects.get(subject, 0) + 1
        
        # Ultimi 7 giorni
        cutoff_date = datetime.now() - timedelta(days=7)
        recent_messages = [
            msg for msg in log_data 
            if datetime.fromisoformat(msg.get('timestamp', '1970-01-01')) > cutoff_date
        ]
        
        return jsonify({
            'total_messages': total_messages,
            'successful_messages': successful_messages,
            'failed_messages': failed_messages,
            'success_rate': round((successful_messages / total_messages * 100) if total_messages > 0 else 0, 1),
            'messages_last_7_days': len(recent_messages),
            'top_subjects': dict(sorted(subjects.items(), key=lambda x: x[1], reverse=True)[:5]),
            'last_updated': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Errore recupero statistiche: {str(e)}")
        return jsonify({'error': 'Errore interno del server'}), 500

if __name__ == '__main__':
    print("🚀 Avvio server SimonePizziWebSite...")
    print("📧 Per configurare SMTP Runtime Radio, modifica EMAIL_CONFIG['sender_password'] in app.py")
    print("🌐 Sito disponibile su: http://localhost:5000")
    print("📊 Health check: http://localhost:5000/api/health")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 