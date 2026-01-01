import os
import discord
import datetime
import aiohttp
import asyncio
import json
from discord.ext import commands
from dotenv import load_dotenv
from typing import Optional, Union

# Charger les variables d'environnement
load_dotenv()

# Configuration des intents
intents = discord.Intents.default()
intents.messages = True
intents.guilds = True
intents.members = True
intents.message_content = True

# Fonction de journalisation
async def log_action(action: str, user: Union[discord.Member, discord.User], guild: discord.Guild = None, **details):
    """Journalise une action effectuée par un utilisateur"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] {action} - Utilisateur: {user} (ID: {user.id})"
    
    if guild:
        log_message += f" - Serveur: {guild.name} (ID: {guild.id})"
    
    for key, value in details.items():
        log_message += f" - {key}: {value}"
    
    print(log_message)  # Affiche dans la console
    
    # Vous pouvez aussi écrire dans un fichier de log si nécessaire
    with open('bot.log', 'a', encoding='utf-8') as f:
        f.write(f"{log_message}\n")

async def has_permission(ctx):
    """Vérifie si l'utilisateur a le rôle requis pour utiliser le bot"""
    try:
        # Vérifier si c'est en MP (refuser tout accès en MP)
        if not ctx.guild:
            return False
            
        # Vérifier si l'utilisateur a le rôle requis
        required_role = ctx.guild.get_role(ADMIN_ROLE_ID)
        if not required_role:
            await log_action("ERREUR: Rôle requis introuvable", ctx.author, ctx.guild)
            return False
            
        has_required_role = required_role in ctx.author.roles
        
        # Journaliser les tentatives d'accès non autorisées
        if not has_required_role:
            await log_action("Tentative d'accès non autorisée", 
                           ctx.author, 
                           ctx.guild,
                           commande=ctx.command.name if ctx.command else "inconnue",
                           message="Rôle requis manquant")
            
        return has_required_role
        
    except Exception as e:
        print(f"Erreur dans has_permission: {str(e)}")
        # En cas d'erreur, on refuse l'accès par sécurité
        return False

# Initialisation du bot avec le préfixe de commande
bot = commands.Bot(command_prefix='!', intents=intents)

# ID du rôle admin
ADMIN_ROLE_ID = 1452850689288962079

def get_role_color(role_name: str) -> int:
    """Retourne la couleur correspondant au rôle"""
    colors = {
        'owner': 0xFFD700,    # Or
        'admin': 0xFF4500,    # OrangeRed
        'moderator': 0x3498DB, # Blue
        'member': 0x2ECC71     # Green
    }
    return colors.get(role_name.lower(), 0x5865F2)  # Bleu Discord par défaut

# ID des rôles
ROLES = {
    'owner': 1443384502490763264,  # ID du rôle Owner
    'admin': 1452844583347027981,  # ID du rôle Admin
    'moderator': 1452844554536489144  # ID du rôle Modérateur
}

def get_user_role(ctx) -> str:
    """
    Détermine le rôle principal de l'utilisateur avec priorité : Owner > Admin > Moderator > Member
    Retourne une chaîne représentant le rôle : 'owner', 'admin', 'moderator' ou 'member'
    """
    try:
        if not ctx.guild:  # Si c'est en MP
            print("Avertissement: Commande utilisée en MP, rôle par défaut: member")
            return 'member'
            
        member = ctx.author
        
        # Vérifier si l'utilisateur est le propriétaire du serveur
        if member == ctx.guild.owner:
            print(f"Détection de rôle: {member} est le propriétaire du serveur")
            return 'owner'
            
        # Vérifier les rôles dans l'ordre de priorité
        for role in member.roles:
            if role.id == ROLES['owner']:
                print(f"Détection de rôle: {member} a le rôle Owner")
                return 'owner'
            elif role.id == ROLES['admin']:
                print(f"Détection de rôle: {member} a le rôle Admin")
                return 'admin'
            elif role.id == ROLES['moderator']:
                print(f"Détection de rôle: {member} a le rôle Moderator")
                return 'moderator'
        
        print(f"Détection de rôle: {member} n'a aucun rôle spécial, rôle par défaut: member")
        return 'member'
        
    except Exception as e:
        print(f"Erreur dans get_user_role: {str(e)}")
        return 'member'  # En cas d'erreur, retourner le rôle le moins élevé

@bot.event
async def on_ready():
    await log_action("Bot démarré", bot.user, None, version="1.0")
    print(f'Connecté en tant que {bot.user.name} (ID: {bot.user.id})')
    print('------')
    await bot.change_presence(activity=discord.Game(name='!aide pour les commandes'))

async def register_user_on_website(credentials: dict, discord_user: discord.Member, role: str) -> bool:
    """
    Enregistre l'utilisateur sur le site web via l'API
    
    Args:
        credentials: Dictionnaire contenant les identifiants (username, email, password)
        discord_user: L'objet membre Discord de l'utilisateur
        role: Le rôle Discord de l'utilisateur (owner, admin, moderator, member)
        
    Returns:
        bool: True si l'enregistrement a réussi, False sinon
    """
    # URL de l'API d'enregistrement Discord
    api_url = "http://localhost:3000/api/discord/register"
    
    # Récupérer la clé API depuis les variables d'environnement
    api_key = os.getenv('API_KEY')
    if not api_key:
        print("❌ Clé API non configurée dans les variables d'environnement")
        return False
    
    # Calculer la date d'expiration (10 minutes à partir de maintenant)
    from datetime import datetime, timedelta
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
    
    # Préparer les données pour l'API
    payload = {
        'username': credentials['username'],
        'password': credentials['password'],
        'discordId': str(discord_user.id),
        'role': role.lower(),  # L'API s'attend à un rôle en minuscules
        'expiresAt': expires_at  # Date d'expiration du compte
    }
    
    print(f"Tentative d'enregistrement de l'utilisateur {credentials.get('username')} avec le rôle {role}...")
    
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
        
        async with aiohttp.ClientSession() as session:
            # Envoyer la requête à l'API
            async with session.post(api_url, json=payload, headers=headers) as response:
                if response.status == 201:
                    data = await response.json()
                    print(f"✅ Utilisateur {credentials['username']} créé avec succès (Rôle: {role})")
                    print(f"Réponse API: {data}")
                    return True
                else:
                    try:
                        data = await response.json()
                        error_msg = data.get('error', 'Erreur inconnue')
                        print(f"❌ Erreur API ({response.status}): {error_msg}")
                        print(f"Détails: {data}")
                    except:
                        error_text = await response.text()
                        print(f"❌ Erreur API ({response.status}): Réponse non JSON")
                        print(f"Réponse brute: {error_text}")
                    return False
                    
    except aiohttp.ClientError as e:
        print(f"❌ Erreur de connexion à l'API: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
        return False

def generate_credentials(user_id: int, discord_username: str, role: str) -> dict:
    """
    Génère des identifiants uniques pour l'utilisateur
    
    Args:
        user_id: ID Discord de l'utilisateur
        discord_username: Nom d'utilisateur Discord
        role: Rôle de l'utilisateur (owner, admin, moderator, member)
        
    Returns:
        Un dictionnaire contenant les identifiants générés
    """
    import secrets
    import string
    
    print(f"Génération des identifiants pour {discord_username} (ID: {user_id}, Rôle: {role})")
    
    # Générer un mot de passe sécurisé
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    # Nettoyer le nom d'utilisateur pour qu'il soit valide
    clean_username = ''.join(c for c in discord_username.lower() if c.isalnum() or c in '_-')
    
    # Si le nom d'utilisateur est vide après nettoyage, utiliser une valeur par défaut
    if not clean_username:
        clean_username = f'user_{user_id}'
    
    # Préfixe de rôle
    role_prefix = {
        'owner': 'own',
        'admin': 'adm',
        'moderator': 'mod',
        'member': 'usr'
    }.get(role.lower(), 'usr')
    
    # Créer un nom d'utilisateur simple et lisible
    username = f"{clean_username}"
    
    # Limiter la longueur du nom d'utilisateur à 30 caractères
    if len(username) > 30:
        username = username[:30]
    
    # Générer un email basé sur le nom d'utilisateur
    email = f"{username}@discord.app"
    
    credentials = {
        'username': username,
        'email': email,
        'password': password,
        'discord_id': str(user_id),
        'discord_username': discord_username,
        'role': role.lower(),
        'generated_at': datetime.datetime.now().isoformat()
    }
    
    print(f"Identifiants générés: {credentials}")
    return credentials

@bot.command(name='aide')
@commands.check(has_permission)
async def aide(ctx):
    """Affiche les commandes disponibles selon votre rôle"""
    try:
        # Supprimer le message de commande
        try:
            await ctx.message.delete()
        except:
            pass

        # Obtenir le rôle de l'utilisateur
        role = get_user_role(ctx)
        
        # Créer l'embed d'aide
        embed = discord.Embed(
            title=f"📚 Menu d'Aide - {ctx.guild.name if ctx.guild else 'DM'}",
            description="Voici les commandes disponibles pour vous :\n\u200b",
            color=get_role_color(role)
        )
        
        # Ajouter les commandes en fonction du rôle
        if role in ['owner', 'admin', 'moderator', 'member']:
            # Commandes de base pour tout le monde
            cmds = [("!aide", "Affiche ce message d'aide")]
            
            # Commandes pour les administrateurs
            if role in ['owner', 'admin']:
                cmds.extend([
                    ("!admin", "Génère vos identifiants pour le panel d'administration"),
                    ("!clear [nombre]", "Supprime des messages"),
                    ("!userinfo [@utilisateur]", "Affiche des infos utilisateur"),
                    ("!serverinfo", "Affiche les infos du serveur")
                ])
            
            # Commandes réservées au propriétaire
            if role == 'owner':
                cmds.extend([
                    ("!reload [extension]", "Recharge une extension du bot"),
                    ("!shutdown", "Éteint le bot")
                ])
            
            # Ajouter les commandes à l'embed
            cmd_text = "\n".join([f"`{cmd}` - {desc}" for cmd, desc in cmds])
            embed.add_field(name="🔹 Commandes disponibles", value=cmd_text, inline=False)
        
            embed.add_field(
                name="⚙️ Options d'administration",
                value="Vous avez accès aux commandes d'administration et de modération.",
                inline=False
            )
        
        # Ajouter une note de sécurité
        embed.add_field(
            name="⚠️ Sécurité",
            value="• Ne partagez jamais vos identifiants\n"
                  "• Activez la double authentification\n"
                  "• Signalez tout comportement suspect",
            inline=False
        )
        
        # Ajouter le footer avec l'avatar de l'utilisateur
        embed.set_footer(
            text=f"Demandé par {ctx.author.display_name} • {ctx.guild.name if ctx.guild else 'MP'}",
            icon_url=ctx.author.avatar.url if hasattr(ctx.author.avatar, 'url') else None
        )
        
        # Envoyer le message d'aide directement dans le salon
        await ctx.send(embed=embed, delete_after=60)  # Le message s'auto-supprime après 60 secondes
            
    except Exception as e:
        print(f"❌ Erreur dans la commande aide: {str(e)}")
        await ctx.send("❌ Une erreur est survenue lors de l'affichage de l'aide.", delete_after=10)

@bot.command(name='admin')
@commands.check(has_permission)
async def admin_cmd(ctx):
    """Génère des identifiants temporaires pour le panel d'administration"""
    try:
        # Supprimer le message de commande
        try:
            await ctx.message.delete()
        except:
            pass
            
        await log_action("Commande admin exécutée", ctx.author, ctx.guild)
        
        # Vérifier si l'utilisateur est dans un serveur
        if not ctx.guild:
            return await ctx.send("❌ Cette commande ne peut pas être utilisée en message privé.", delete_after=10)

        # Vérifier les permissions
        role = get_user_role(ctx)
        if role not in ['owner', 'admin']:
            return await ctx.send("❌ Vous devez être administrateur pour utiliser cette commande.", delete_after=10)

        # Créer un message de chargement
        msg = await ctx.send("⏳ Génération de vos identifiants d'administration...")
        
        # Générer les identifiants
        try:
            credentials = generate_credentials(ctx.author.id, ctx.author.name, role)
        except Exception as e:
            print(f"❌ Erreur lors de la génération des identifiants: {str(e)}")
            return await msg.edit(content="❌ Erreur lors de la génération des identifiants.", delete_after=10)
        
        # Créer un embed pour afficher les identifiants
        from datetime import datetime, timedelta
        expires_at = (datetime.utcnow() + timedelta(minutes=10)).strftime('%H:%M')
        
        embed = discord.Embed(
            title="🔑 Identifiants d'Administration",
            description=f"Voici vos identifiants temporaires (valables 10 minutes jusqu'à {expires_at} UTC) :",
            color=0x2ecc71
        )
        
        # Déterminer l'URL du panel en fonction du rôle
        panel_url = 'http://localhost:3000/admin/dashboard' if role == 'admin' else 'http://localhost:3000/admin/owner'
        
        embed.add_field(
            name="🌐 Accès au panel",
            value=f"[Cliquez ici pour accéder au panel]({panel_url})\n`{panel_url}`",
            inline=False
        )
        
        embed.add_field(
            name="👤 Identifiant",
            value=f"```\n{credentials['username']}\n```",
            inline=False
        )
        
        embed.add_field(
            name="🔒 Mot de passe",
            value=f"```\n{credentials['password']}\n```",
            inline=False
        )
        
        # Ajouter une note de sécurité
        embed.set_footer(
            text="🔒 Ces identifiants sont strictement personnels et confidentiels !",
            icon_url="https://i.imgur.com/your-security-icon.png"
        )
        
        # Essayer d'envoyer en message privé
        try:
            await ctx.author.send(embed=embed)
            await msg.edit(content="✅ Vos identifiants vous ont été envoyés en message privé !", delete_after=10)
        except discord.Forbidden:
            # Si les MP sont désactivés, envoyer dans le salon avec un avertissement
            warning_embed = discord.Embed(
                title="⚠️ Sécurité - Messages privés désactivés",
                description="Activez les messages privés pour plus de sécurité.",
                color=0xffcc00
            )
            await msg.delete()
            await ctx.send(embed=warning_embed)
            await ctx.send(embed=embed)
            
    except Exception as e:
        error_msg = f"❌ Une erreur est survenue: {str(e)}"
        print(f"❌ Erreur dans la commande admin: {str(e)}")
        await log_action("Erreur dans la commande admin", ctx.author, ctx.guild, error=str(e))
        
        # Essayer d'envoyer un message d'erreur
        try:
            await ctx.send("❌ Une erreur est survenue. Veuillez réessayer.", delete_after=15)
        except:
            pass

@bot.command(name='clear')
@commands.has_permissions(manage_messages=True)
async def clear_messages(ctx, amount: int = 5):
    """Supprime un nombre spécifié de messages (par défaut: 5)"""
    try:
        # Vérifier si le bot a la permission de gérer les messages
        if not ctx.channel.permissions_for(ctx.guild.me).manage_messages:
            await ctx.send("❌ Je n'ai pas la permission de supprimer des messages.")
            return
            
        # Limiter à 100 messages à la fois pour éviter les abus
        amount = min(amount, 100)
        
        # Supprimer les messages
        await ctx.channel.purge(limit=amount + 1)  # +1 pour inclure la commande
        
        # Envoyer un message de confirmation (qui sera supprimé après 5 secondes)
        msg = await ctx.send(f"✅ {amount} messages ont été supprimés.", delete_after=5)
        
        await log_action("Messages supprimés", ctx.author, ctx.guild, nombre=amount)
        
    except Exception as e:
        print(f"Erreur dans la commande clear: {str(e)}")
        await ctx.send("❌ Une erreur est survenue lors de la suppression des messages.")

@bot.command(name='reload')
@commands.is_owner()
async def reload_extension(ctx, extension=None):
    """Recharge une extension (propriétaire uniquement)"""
    try:
        if extension:
            await bot.reload_extension(f'cogs.{extension}' if not extension.startswith('cogs.') else extension)
            await ctx.send(f'✅ Extension `{extension}` rechargée avec succès!', delete_after=5)
        else:
            # Recharger toutes les extensions
            for filename in os.listdir('./cogs'):
                if filename.endswith('.py') and not filename.startswith('_'):
                    try:
                        await bot.reload_extension(f'cogs.{filename[:-3]}')
                    except Exception as e:
                        await ctx.send(f'❌ Erreur lors du rechargement de `{filename}`: {str(e)}')
                        return
            await ctx.send('✅ Toutes les extensions ont été rechargées avec succès!', delete_after=5)
            
        await log_action("Extensions rechargées", ctx.author, ctx.guild, extension=extension or 'all')
        
    except Exception as e:
        await ctx.send(f'❌ Erreur lors du rechargement: {str(e)}')
        print(f'Erreur de rechargement: {str(e)}')

@bot.command(name='compte')
@commands.check(has_permission)
async def create_account(ctx, member: discord.Member = None, *, role_type: str = 'member'):
    """
    Crée un compte pour un utilisateur avec un rôle spécifique
    
    Utilisation: !compte @utilisateur [role]
    Rôles disponibles: owner, admin, moderator, member
    """
    # Supprimer le message de commande
    try:
        await ctx.message.delete()
    except:
        pass
        
    try:
        # Vérifier que la commande est utilisée par un admin ou modérateur
        requester_role = get_user_role(ctx)
        
        # Vérifier si l'utilisateur a la permission d'utiliser cette commande
        if requester_role not in ['admin', 'owner']:
            return await ctx.send("❌ Vous n'avez pas la permission d'utiliser cette commande.", delete_after=10)
            
        # Vérifier si un membre est mentionné
        if not member:
            return await ctx.send("❌ Veuillez mentionner un utilisateur. Exemple: `!compte @Utilisateur admin`", delete_after=10)
        
        # Nettoyer et valider le rôle
        role_type = role_type.lower().strip()
        valid_roles = ['owner', 'admin', 'moderator', 'member']
        
        # Vérifier que le rôle demandé est valide
        if role_type not in valid_roles:
            return await ctx.send(
                f"❌ Rôle invalide. Rôles disponibles: {', '.join(valid_roles)}",
                delete_after=15
            )
            
        # Vérifier les permissions
        if role_type == 'owner' and requester_role != 'owner':
            return await ctx.send("❌ Seul le propriétaire peut créer un compte propriétaire.", delete_after=10)
            
        if role_type == 'admin' and requester_role not in ['owner', 'admin']:
            return await ctx.send("❌ Vous n'avez pas la permission de créer un compte administrateur.", delete_after=10)
        
        # Vérifier si l'utilisateur a déjà un compte
        # (à implémenter selon votre logique métier)
        
        # Créer un message de chargement
        msg = await ctx.send(f"⏳ Création du compte {role_type} pour {member.mention}...")
        
        try:
            # Générer les identifiants
            credentials = generate_credentials(member.id, member.display_name, role_type)
            
            # Enregistrer l'utilisateur sur le site web
            success = await register_user_on_website(credentials, member, role_type)
            
            if not success:
                return await msg.edit(content="❌ Échec de la création du compte. Veuillez réessayer.", delete_after=15)
            
            # URL du panel selon le rôle
            panel_urls = {
                'owner': 'http://localhost:3000/admin/owner',
                'admin': 'http://localhost:3000/admin/dashboard',
                'moderator': 'http://localhost:3000/moderator/dashboard',
                'member': 'http://localhost:3000/dashboard'
            }
            
            # Créer l'embed pour l'administrateur
            admin_embed = discord.Embed(
                title=f"✅ Compte {role_type.capitalize()} créé",
                description=f"Un compte a été créé pour {member.mention}",
                color=0x2ecc71
            )
            
            admin_embed.add_field(
                name="🔑 Identifiants",
                value=f"```\n"
                      f"Utilisateur: {credentials['username']}\n"
                      f"Mot de passe: {credentials['password']}\n"
                      f"```",
                inline=False
            )
            
            admin_embed.add_field(
                name="🌐 Accès au panel",
                value=f"[Accéder au panel]({panel_urls.get(role_type, 'http://localhost:3000/login')})\n`{panel_urls.get(role_type, 'http://localhost:3000/login')}`",
                inline=False
            )
            
            admin_embed.set_footer(text="Ces informations sont confidentielles")
            
            # Envoyer un message à l'administrateur
            try:
                await ctx.author.send(embed=admin_embed)
                await msg.edit(content=f"✅ Les identifiants pour {member.mention} ont été envoyés en message privé.", delete_after=15)
            except discord.Forbidden:
                await msg.edit(content="❌ Je ne peux pas vous envoyer de message privé. Activez les messages privés pour recevoir les identifiants.", delete_after=15)
            
            # Créer l'embed pour l'utilisateur
            user_embed = discord.Embed(
                title="🎉 Votre compte a été créé !",
                description=f"Bienvenue sur notre plateforme, {member.mention} !\n"
                          f"Vous avez reçu le rôle **{role_type.capitalize()}**.",
                color=0x3498db
            )
            
            # Créer l'URL du panel
            panel_url = panel_urls.get(role_type, 'http://localhost:3000/login')
            
            user_embed.add_field(
                name="Comment vous connecter",
                value=(
                    f"1. Rendez-vous sur [notre site]({panel_url})\n"
                    f"2. Connectez-vous avec les identifiants qui vous ont été envoyés en message privé\n"
                    f"3. Changez votre mot de passe après la première connexion"
                ),
                inline=False
            )
            
            user_embed.set_footer(text="Si vous n'avez pas reçu vos identifiants, contactez un administrateur.")
            
            # Envoyer un message à l'utilisateur
            try:
                await member.send(embed=user_embed)
            except discord.Forbidden:
                await ctx.send(f"ℹ️ {member.mention}, activez vos messages privés pour recevoir vos identifiants.", delete_after=15)
            
            # Journaliser l'action
            await log_action(
                "Compte créé", 
                ctx.author, 
                ctx.guild,
                target_user=f"{member} (ID: {member.id})",
                role=role_type
            )
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du compte: {str(e)}")
            await msg.edit(content="❌ Une erreur est survenue lors de la création du compte.", delete_after=15)
            
    except Exception as e:
        print(f"❌ Erreur dans la commande compte: {str(e)}")
        if 'msg' in locals():
            await msg.edit(content="❌ Une erreur est survenue. Veuillez réessayer.", delete_after=15)
        else:
            await ctx.send("❌ Une erreur est survenue. Veuillez réessayer.", delete_after=15)

# Commandes d'administration
@bot.command(name='serverinfo')
@commands.check(has_permission)
async def server_info(ctx):
    """Affiche des informations sur le serveur"""
    try:
        guild = ctx.guild
        
        # Créer un embed avec les informations du serveur
        embed = discord.Embed(
            title=f"ℹ️ Informations sur {guild.name}",
            color=discord.Color.blue()
        )
        
        # Informations de base
        embed.add_field(name="👑 Propriétaire", value=guild.owner.mention, inline=True)
        embed.add_field(name="🆔 ID du serveur", value=guild.id, inline=True)
        embed.add_field(name="🌍 Région", value=str(guild.region).title(), inline=True)
        
        # Statistiques des membres
        members = guild.members
        online = len([m for m in members if m.status != discord.Status.offline])
        bots = len([m for m in members if m.bot])
        
        embed.add_field(
            name="👥 Membres", 
            value=f"Total: {guild.member_count}\nEn ligne: {online}\nBots: {bots}",
            inline=True
        )
        
        # Canaux
        channels = len(guild.channels)
        text_channels = len(guild.text_channels)
        voice_channels = len(guild.voice_channels)
        
        embed.add_field(
            name="📚 Canaux",
            value=f"Total: {channels}\nTextuels: {text_channels}\nVocaux: {voice_channels}",
            inline=True
        )
        
        # Rôles
        roles = [role.mention for role in guild.roles[1:]]  # Exclure @everyone
        roles_text = ', '.join(roles) if len(roles) <= 10 else f'{len(roles)} rôles'
        
        embed.add_field(name=f"🎭 Rôles ({len(roles)})", value=roles_text, inline=False)
        
        # Dates importantes
        created_at = guild.created_at.strftime("%d/%m/%Y à %H:%M")
        embed.set_footer(text=f"Serveur créé le {created_at}")
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erreur dans la commande serverinfo: {str(e)}")
        await ctx.send("❌ Une erreur est survenue lors de la récupération des informations du serveur.")

@bot.command(name='userinfo')
@commands.check(has_permission)
async def user_info(ctx, member: discord.Member = None):
    """Affiche des informations sur un utilisateur"""
    try:
        member = member or ctx.author
        
        # Créer un embed avec les informations de l'utilisateur
        embed = discord.Embed(
            title=f"👤 Informations sur {member.display_name}",
            color=member.color
        )
        
        # Avatar
        embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
        
        # Informations de base
        embed.add_field(name="📛 Pseudonyme", value=member.display_name, inline=True)
        embed.add_field(name="#️⃣ Tag", value=member, inline=True)
        embed.add_field(name="🆔 ID", value=member.id, inline=True)
        
        # Statut et activité
        status = str(member.status).title()
        activity = f"{member.activity.type.name.title()} {member.activity.name}" if member.activity else "Aucune"
        
        embed.add_field(name="💡 Statut", value=status, inline=True)
        embed.add_field(name="🎮 Activité", value=activity, inline=True)
        
        # Dates importantes
        created_at = member.created_at.strftime("%d/%m/%Y")
        joined_at = member.joined_at.strftime("%d/%m/%Y") if member.joined_at else "Inconnu"
        
        embed.add_field(name="📅 Compte créé le", value=created_at, inline=True)
        embed.add_field(name="📥 A rejoint le", value=joined_at, inline=True)
        
        # Rôles
        roles = [role.mention for role in member.roles[1:]]  # Exclure @everyone
        roles_text = ', '.join(roles) if roles else "Aucun rôle"
        
        embed.add_field(name=f"🎭 Rôles ({len(roles)})", value=roles_text, inline=False)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erreur dans la commande userinfo: {str(e)}")
        await ctx.send("❌ Une erreur est survenue lors de la récupération des informations de l'utilisateur.")

# Gestion des erreurs de commande
@bot.event
async def on_command_error(ctx, error):
    """Gestion centralisée des erreurs de commande"""
    error_messages = {
        commands.CommandNotFound: "❌ Commande inconnue. Utilisez `!aide` pour voir les commandes disponibles.",
        commands.CheckFailure: "⛔ Vous n'avez pas la permission d'utiliser cette commande.",
        commands.MissingRequiredArgument: lambda e: f"❌ Argument manquant. Utilisation : `!{ctx.command.name} {ctx.command.signature}`",
        commands.BadArgument: lambda e: f"❌ Argument invalide. Utilisation : `!{ctx.command.name} {ctx.command.signature}`",
        commands.MissingPermissions: "⛔ Vous n'avez pas les permissions nécessaires pour cette commande.",
        commands.BotMissingPermissions: "⛔ Je n'ai pas les permissions nécessaires pour exécuter cette commande.",
        commands.CommandOnCooldown: lambda e: f"⏳ Cette commande est en recharge. Réessayez dans {e.retry_after:.1f} secondes.",
        commands.DisabledCommand: "❌ Cette commande est actuellement désactivée.",
        commands.TooManyArguments: "❌ Trop d'arguments fournis. Vérifiez la syntaxe de la commande.",
        commands.UserInputError: "❌ Erreur dans les arguments de la commande.",
        commands.NoPrivateMessage: "❌ Cette commande ne peut pas être utilisée en message privé.",
        commands.PrivateMessageOnly: "❌ Cette commande ne peut être utilisée qu'en message privé.",
        commands.NotOwner: "⛔ Cette commande est réservée au propriétaire du bot.",
    }
    
    # Log l'erreur
    error_msg = str(error)
    command_name = ctx.command.name if ctx.command else "inconnue"
    
    # Envoyer un message d'erreur approprié
    for error_type, message in error_messages.items():
        if isinstance(error, error_type):
            if callable(message):
                await ctx.send(message(error))
            else:
                await ctx.send(message)
            break
    else:
        # Pour les erreurs non gérées spécifiquement
        error_msg = f"Erreur dans la commande {command_name}: {error_msg}"
        print(error_msg)
        await ctx.send("❌ Une erreur inattendue est survenue lors de l'exécution de la commande.")
    
    # Logger l'erreur
    await log_action(
        "Erreur de commande", 
        ctx.author, 
        ctx.guild if ctx.guild else None,
        commande=command_name,
        erreur=error_msg
    )

# Démarrer le bot
@bot.event
async def on_guild_channel_create(channel):
    await log_action("Salon créé", channel.guild.me, channel.guild, 
                    salon=channel.name, type=type(channel).__name__)

@bot.event
async def on_guild_channel_delete(channel):
    await log_action("Salon supprimé", channel.guild.me, channel.guild, 
                    salon=channel.name, type=type(channel).__name__)

@bot.event
async def on_member_join(member):
    await log_action("Membre rejoint", member, member.guild)

@bot.event
async def on_member_remove(member):
    await log_action("Membre parti", member, member.guild)

@bot.event
async def on_member_update(before, after):
    if before.roles != after.roles:
        added = [role for role in after.roles if role not in before.roles]
        removed = [role for role in before.roles if role not in after.roles]
        
        if added:
            await log_action("Rôle ajouté", after, after.guild, 
                           role=added[0].name, role_id=added[0].id)
        if removed:
            await log_action("Rôle retiré", after, after.guild,
                           role=removed[0].name, role_id=removed[0].id)

# Démarrer le bot
bot.run(os.getenv('DISCORD_TOKEN'))
