# Script pour corriger le fichier bot.py
with open('bot.py', 'r', encoding='utf-8') as file:
    lines = file.readlines()

# Supprimer les lignes liées à l'importation de cgi
new_lines = []
skip = False
for line in lines:
    if 'import cgi' in line or 'sys.modules' in line:
        skip = True
    elif 'if sys.version_info' in line:
        skip = True
    elif skip and line.strip() == '':  # Sauter la ligne vide après le bloc
        skip = False
    elif not skip:
        new_lines.append(line)

# Écrire le nouveau contenu dans le fichier
with open('bot.py', 'w', encoding='utf-8') as file:
    file.writelines(new_lines)
