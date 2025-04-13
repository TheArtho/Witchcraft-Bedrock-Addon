# 🧙‍♂️ Witchcraft - Minecraft Bedrock Addon

**Witchcraft** is a Minecraft Bedrock addon focused on magic and spellcasting. This project uses the `@minecraft/server` scripting API with a modern Node.js and TypeScript development environment.

---

## ⚙️ Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- Minecraft Bedrock Edition (1.21.70+)
- Enable experimental gameplay & scripting in Minecraft
- A code editor like VS Code is recommended

---

## 📁 Project Structure

```
/Witchcraft
├── packs/
│   ├── Behavior/            → Output Behavior Pack files
│   ├── Resource/            → Output Resource Pack files
├── src/                     → TypeScript source code
├── scripts/                 → Build and sync utilities
├── buildconfig.json         → Contains the mod name (e.g., Witchcraft)
├── tsconfig.json
└── build.js                 → Build script
```

---

## 🧪 Local Development

The project is written in **TypeScript** using the Minecraft Scripting API.

### 🛠 Compile & Deploy to Minecraft

```bash
# Install dependencies
npm install

# Compile TypeScript and copy output packs to the Minecraft dev folders
npm run build
```

### 🧹 Clean and full rebuild

```bash
npm run clean
npm run build
```

> The build script copies the packs into:
>
> ```
> %LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\
>     LocalState\games\com.mojang\
>         development_behavior_packs\Witchcraft BP
>         development_resource_packs\Witchcraft RP
> ```
