# 🎬 Subtitle Forge

Genera archivos `.srt` desde cualquier video usando **IA 100% local, gratis y sin subir tu video a la nube**.

Detecta automáticamente el idioma del video, lo transcribe con Whisper y traduce el resultado al idioma que elijas (inglés o español).

![Demo](https://img.shields.io/badge/status-active-success)

## ✨ Features

- 🎥 **Acepta cualquier video**: MP4, MKV, MOV, AVI, etc. (hasta 2 GB)
- 🌐 **Detección automática de idioma** con Whisper
- 🧠 **Transcripción local** (Whisper.cpp) — sin API keys, sin pagar, sin internet
- 🌍 **Traducción EN → ES** con modelo Opus-MT local
- 📊 **Progreso en tiempo real** con timeline de las etapas
- 👀 **Vista previa** de los subtítulos antes de descargar
- 🔒 **Privacidad total**: tu video nunca sale de tu PC

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS 3 |
| Backend | Node.js 20 + Express |
| Transcripción | [whisper.cpp](https://github.com/ggerganov/whisper.cpp) (C++) |
| Traducción | [Transformers.js](https://huggingface.co/docs/transformers.js) + Opus-MT |
| Audio | FFmpeg (del sistema) |

## 📋 Requisitos previos

Antes de instalar el proyecto, necesitas tener:

- **Node.js** >= 18 (recomendado 20)
- **FFmpeg** instalado en el sistema
- **Git**
- **CMake** y **build tools** (para compilar whisper.cpp)

### Instalación por SO

**Ubuntu / Debian / Linux Mint:**
```bash
sudo apt update
sudo apt install -y build-essential cmake git ffmpeg
```

**Arch / Manjaro:**
```bash
sudo pacman -S --needed base-devel cmake git ffmpeg
```

**macOS (Homebrew):**
```bash
brew install cmake ffmpeg git
```

**Windows:** usa WSL2 + Ubuntu, o instala MSYS2 + CMake + FFmpeg manualmente.

## 🚀 Instalación

### 1. Clonar el repo

```bash
git clone https://github.com/jhongonzalezs/subtitle-forge.git
cd subtitle-forge
```

### 2. Compilar whisper.cpp

```bash
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make
```

Descarga un modelo (el `base` es un buen balance entre velocidad y precisión):

```bash
bash ./models/download-ggml-model.sh base
```

Vuelve a la raíz:

```bash
cd ..
```

### 3. Configurar el backend

```bash
cd server
npm install
cp .env.example .env
```

Edita `server/.env` si tu estructura es distinta:

```env
PORT=5000
WHISPER_BIN=../whisper.cpp/build/bin/whisper-cli
WHISPER_MODEL=../whisper.cpp/models/ggml-base.bin
```

### 4. Configurar el frontend

```bash
cd ../client
npm install
```

## 🎮 Uso

Necesitas **2 terminales** abiertas al mismo tiempo.

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

1. Arrastra un video a la zona de upload
2. Elige el idioma de salida (Original / Inglés / Español)
3. Clic en **Generar subtítulos**
4. Espera (verás el progreso en tiempo real)
5. Descarga tu archivo `.srt`

## 📁 Estructura

```
subtitle-forge/
├── client/              # Frontend React + Vite
│   └── src/
│       ├── components/  # Header, UploadZone, PreviewPanel, Timeline...
│       └── lib/api.js   # Cliente HTTP
├── server/              # Backend Node + Express
│   └── src/
│       ├── routes/      # Endpoints
│       ├── services/    # ffmpeg, whisper, translator
│       └── utils/       # SRT, jobs
└── whisper.cpp/         # (no incluido — se clona aparte)
```

## ⚙️ Cómo funciona

```
Video → FFmpeg extrae audio → Whisper transcribe + traduce a inglés → Opus-MT traduce a español (opcional) → SRT
```

Todo ocurre **localmente** en tu máquina. No hay llamadas a APIs externas.

## 🐛 Troubleshooting

**`whisper.cpp` no compila:**
- Verifica que tengas `cmake` y `build-essential` instalados
- En Manjaro: `sudo pacman -S base-devel cmake`

**El backend dice "Binario de whisper no encontrado":**
- Asegúrate de que la ruta en `.env` apunte al binario real
- Verifica con: `ls ../whisper.cpp/build/bin/whisper-cli`

**La traducción tarda mucho la primera vez:**
- Es normal. La primera ejecución descarga el modelo Opus-MT (~80 MB) y queda cacheado.

**El video es demasiado grande:**
- Límite actual: 2 GB. Puedes ajustarlo en `server/src/routes/transcribe.js`.

## 📄 Licencia

MIT — úsalo, modifícalo y compártelo libremente.

## 🙏 Créditos

- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) — Georgi Gerganov
- [Transformers.js](https://github.com/huggingface/transformers.js) — Hugging Face
- [Opus-MT](https://huggingface.co/Helsinki-NLP) — Helsinki-NLP