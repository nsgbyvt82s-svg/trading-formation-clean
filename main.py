import os
import asyncio
import threading
from app import app as web_app
from bot import bot
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
from dotenv import load_dotenv
load_dotenv()

def run_web():
    """Lance le serveur web Flask"""
    web_app.run(host='0.0.0.0', port=5000, debug=False)

async def run_bot():
    """Lance le bot Discord"""
    try:
        token = os.getenv('DISCORD_BOT_TOKEN')
        if not token:
            logger.error("Token Discord non trouvé dans les variables d'environnement")
            return
            
        await bot.start(token)
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du bot: {e}")
    finally:
        if not bot.is_closed():
            await bot.close()

def run_async(coro):
    """Exécute une coroutine dans un nouvel event loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(coro)
    loop.close()

if __name__ == '__main__':
    # Démarrer le serveur web dans un thread séparé
    web_thread = threading.Thread(target=run_web)
    web_thread.daemon = True
    web_thread.start()
    
    logger.info("Serveur web démarré sur http://localhost:5000")
    
    # Démarrer le bot Discord dans le thread principal
    try:
        run_async(run_bot())
    except KeyboardInterrupt:
        logger.info("Arrêt en cours...")
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
    finally:
        logger.info("Arrêt du programme")
