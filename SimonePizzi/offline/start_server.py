#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script di avvio per il backend Flask
Simone Pizzi Website - Contact Form Server

Questo script avvia il server Flask con controlli preliminari.
"""

import os
import sys
import subprocess
import importlib.util

def check_python_version():
    """Verifica che la versione Python sia compatibile"""
    if sys.version_info < (3, 8):
        print("❌ Errore: È richiesto Python 3.8 o superiore")
        print(f"   Versione attuale: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} - OK")
    return True

def check_dependencies():
    """Verifica che tutte le dipendenze siano installate"""
    required_packages = ['flask', 'flask_cors', 'werkzeug']
    missing_packages = []
    
    for package in required_packages:
        spec = importlib.util.find_spec(package)
        if spec is None:
            missing_packages.append(package)
        else:
            print(f"✅ {package} - OK")
    
    if missing_packages:
        print(f"❌ Pacchetti mancanti: {', '.join(missing_packages)}")
        print("📦 Installali con: pip install -r requirements.txt")
        return False
    
    return True

def check_email_config():
    """Verifica che la configurazione email sia impostata"""
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
        if 'INSERISCI_QUI_LA_PASSWORD_DELL_APP_GMAIL' in content:
            print("⚠️  ATTENZIONE: Password email non configurata!")
            print("   Modifica SENDER_PASSWORD in app.py con la password dell'app Gmail")
            print("   Il server funzionerà ma non invierà email reali")
            return False
    
    print("✅ Configurazione email - OK")
    return True

def create_data_directory():
    """Crea la directory data se non esiste"""
    if not os.path.exists('data'):
        os.makedirs('data')
        print("✅ Directory 'data' creata")
    else:
        print("✅ Directory 'data' - OK")

def main():
    """Funzione principale"""
    print("🚀 Avvio Backend Flask - Simone Pizzi Contact Form")
    print("=" * 50)
    
    # Controlla versione Python
    if not check_python_version():
        sys.exit(1)
    
    print()
    
    # Controlla dipendenze
    print("📋 Controllo dipendenze...")
    if not check_dependencies():
        sys.exit(1)
    
    print()
    
    # Crea directory data
    print("📁 Controllo directory...")
    create_data_directory()
    
    print()
    
    # Controlla configurazione email
    print("📧 Controllo configurazione email...")
    email_configured = check_email_config()
    
    print()
    print("=" * 50)
    
    if email_configured:
        print("🎉 Tutti i controlli superati!")
    else:
        print("⚠️  Controlli completati con avvisi")
    
    print("🌐 Avvio del server su http://localhost:5000")
    print("📮 Endpoint API: http://localhost:5000/api/contact")
    print("🔗 Health check: http://localhost:5000/api/health")
    print("❌ Premi Ctrl+C per fermare il server")
    print("=" * 50)
    
    # Avvia l'app Flask
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Server fermato dall'utente")
    except ImportError as e:
        print(f"❌ Errore nell'importare app.py: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Errore nell'avvio del server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 