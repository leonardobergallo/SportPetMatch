# GUÍA DE PUBLICACIÓN — Google Play Store

## Indio Comunidad Pet Friendly

---

## 1. Abrir el proyecto

El proyecto está en `frontend/`. No necesitás abrir Android Studio directamente, todo se maneja con EAS Build.

---

## 2. Instalar la app en un teléfono (APK de prueba)

```bash
cd frontend
eas build --platform android --profile preview
```

EAS genera un APK. Al terminar, te da un link para descargarlo. Instalalo en cualquier Android.

---

## 3. Generar el AAB release (para Play Store)

```bash
cd frontend

# Asegurate de que .env tenga:
# EXPO_PUBLIC_API_URL=https://indio.com.ar/api

eas build --platform android --profile production
```

El AAB se genera en servidores de EAS. Al terminar, descargalo desde el link que te da Expo.

---

## 4. Firmar la app (keystore)

EAS maneja la firma automáticamente. La primera vez que hacés build de producción, EAS genera un keystore y lo almacena en su servidor.

**IMPORTANTE:** Si querés manejar el keystore vos mismo, necesitás generarlo:
```bash
keytool -genkey -v -keystore indio-release-key.jks -alias indio -keyalg RSA -keysize 2048 -validity 10000
```

**Guardá el archivo `.jks` y la contraseña en un lugar seguro, fuera del repositorio.** Sin este archivo, no podrás actualizar la app en el futuro.

---

## 5. Google Play Console

### 5.1 Crear cuenta
1. Ir a https://play.google.com/console
2. Pagar USD 25 (único pago)
3. Completar perfil de desarrollador

### 5.2 Crear la app
1. Botón **"Crear app"**
2. Nombre: **Indio Comunidad Pet Friendly**
3. Idioma: Español (Argentina)
4. App gratuita

### 5.3 Subir el AAB
1. Play Console → **Prueba interna** (o Producción)
2. Subir el archivo `.aab`
3. Esperar que se procese

### 5.4 Completar ficha
Usá los textos de `DATOS_GOOGLE_PLAY_INDIO.md`.

### 5.5 Política de privacidad
URL: `https://indio.com.ar/privacidad.html`

### 5.6 Clasificación de contenido
Completar el cuestionario. La app califica como **"Todos"**.

### 5.7 Público objetivo
Marcar 13+ años.

---

## 6. Prueba cerrada (requisito para cuentas nuevas)

Google exige **12 testers durante 14 días consecutivos** antes de publicar en producción.

1. Crear prueba cerrada en Play Console
2. Agregar emails de testers
3. Compartir el link de participación
4. Los testers instalan y usan la app
5. Esperar 14 días

---

## 7. Subir actualizaciones

```bash
# Aumentar versión en app.json:
# "version": "1.0.1"
# "versionCode": 2

# Build nuevo AAB
eas build --platform android --profile production

# Subir a Play Console
eas submit --platform android --profile production
```

### Aumentar versionCode y versionName

En `app.json`:
```json
"android": {
  "versionCode": 2,
},
"version": "1.0.1"
```

---

## 8. Actualizar la web (cambios que afectan al AAB)

1. Hacé los cambios en el código
2. `npm run --prefix frontend build` (si cambió algo de la web)
3. `git add . && git commit -m "..." && git push marketsantafe main`
4. Build nuevo: `eas build --platform android --profile production`
5. Subir: `eas submit --platform android --profile production`

---

## 9. Comandos rápidos

```bash
# APK de prueba
eas build --platform android --profile preview

# AAB para Play Store
eas build --platform android --profile production

# Subir a Play Store
eas submit --platform android --profile production

# Ver builds activos
eas build:list
```
