#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script di avvio per SimonePizziWebSite
Gestisce automaticamente l'installazione delle dipendenze e l'avvio del server
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Esegue un comando e mostra il risultato"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completato con successo")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Errore durante {description}:")
        print(f"   {e.stderr}")
        return False

def check_python():
    """Verifica la versione di Python"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Richiesto Python 3.7 o superiore")
        print(f"   Versione attuale: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor} OK")
    return True

def install_dependencies():
    """Installa le dipendenze Python"""
    requirements_file = Path('requirements.txt')
    if not requirements_file.exists():
        print("❌ File requirements.txt non trovato")
        return False
    
    return run_command(
        f"{sys.executable} -m pip install -r requirements.txt",
        "Installazione dipendenze Flask"
    )

def configure_email():
    """Guida l'utente nella configurazione email"""
    print("\n🔧 CONFIGURAZIONE EMAIL")
    print("=" * 50)
    print("Per abilitare l'invio email, devi configurare una password app Gmail:")
    print("")
    print("1. Vai su https://myaccount.google.com/apppasswords")
    print("2. Seleziona 'App' -> 'Altro' e scrivi 'SimonePizziWebSite'")
    print("3. Copia la password di 16 caratteri generata")
    print("4. Modifica il file app.py alla riga 31:")
    print("   'sender_password': 'TUA_PASSWORD_APP_QUI'")
    print("")
    print("⚠️  IMPORTANTE: Non usare mai la password normale di Gmail!")
    print("⚠️  Usa solo la password app generata da Google!")
    print("")

def start_server():
    """Avvia il server Flask"""
    print("\n🚀 AVVIO SERVER...")
    print("=" * 50)
    print("🌐 Sito disponibile su: http://localhost:5000")
    print("📧 Configurazione email: modifica app.py")
    print("🛑 Per fermare il server: Ctrl+C")
    print("")
    
    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n\n👋 Server fermato dall'utente")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Errore avvio server: {e}")

def main():
    """Funzione principale"""
    print("🚀 SimonePizziWebSite - Sistema di Avvio")
    print("=" * 50)
    
    # Verifica Python
    if not check_python():
        input("\nPremi INVIO per uscire...")
        sys.exit(1)
    
    # Installa dipendenze
    if not install_dependencies():
        input("\nPremi INVIO per uscire...")
        sys.exit(1)
    
    # Configurazione email
    configure_email()
    
    # Chiedi se procedere
    print("Vuoi avviare il server ora? (y/n): ", end="")
    choice = input().lower().strip()
    
    if choice in ['y', 'yes', 's', 'si', '']:
        start_server()
    else:
        print("\n👋 Esegui 'python app.py' quando sei pronto!")

if __name__ == "__main__":
    main() 