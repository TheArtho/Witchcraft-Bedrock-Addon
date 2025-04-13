# 🧙‍♂️ Witchcraft - Addon Minecraft Bedrock

**Witchcraft** est un addon Minecraft Bedrock axé sur la magie, et les sorts. Ce projet utilise le scripting API `@minecraft/server` avec un environnement Node.js moderne et du TypeScript.

---

## ⚙️ Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- Minecraft Bedrock Edition (1.21.70+)
- Activer le mode développeur (scripts & expérimental)
- Un éditeur comme VS Code recommandé

---

## 📁 Structure du projet

```
/Witchcraft
├── packs/
│   ├── Behavior/            → Fichiers du behaviour pack (build cible)
│   ├── Resource/            → Fichiers du resource pack (build cible)
├── src/                     → Code TypeScript source
├── scripts/                 → Logiciels de build et copie
├── buildconfig.json         → Nom du mod (ex: Witchcraft)
├── tsconfig.json
└── build.js                 → Script de build
```

---

## 🧪 Développement local

Le projet utilise **TypeScript** pour le scripting.

### 🛠 Compiler + déployer dans Minecraft

```bash
# Installer les dépendances
npm install

# Compiler le TypeScript + copier les fichiers vers les dossiers Minecraft
npm run build
```

### 🧹 Nettoyer + rebuild complet

```bash
npm run clean
npm run build
```

> Le script de build copie les packs dans :
>
> ```
> %LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\
>     LocalState\games\com.mojang\
>         development_behavior_packs\Witchcraft BP
>         development_resource_packs\Witchcraft RP
> ```
