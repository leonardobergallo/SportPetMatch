# 🚀 Iniciar el Backend - Guía Rápida

## ⚡ Comando Rápido

```bash
cd backend
npm run dev
```

---

## ✅ Verificación

Después de ejecutar el comando, deberías ver:

```
🚀 Servidor SportPetMatch iniciado exitosamente!
📍 Servidor corriendo en: http://localhost:3000
📊 API disponible en: http://localhost:3000/api
❤️  Salud del servidor: http://localhost:3000/api/salud
```

---

## 🔍 Verificar que Funciona

Abre tu navegador en:
```
http://localhost:3000/api/salud
```

Deberías ver un JSON con información del servidor.

---

## ⚠️ Si hay Errores

### Error: "Puerto 3000 en uso"

```bash
cd backend
node scripts/liberar-puerto.js
```

Luego intenta de nuevo:
```bash
npm run dev
```

### Error: "Cannot find module"

```bash
cd backend
npm install
npm run dev
```

---

## 📝 Nota Importante

**El backend debe estar corriendo ANTES de abrir la app móvil.**

Mantén esta terminal abierta mientras uses la app.


