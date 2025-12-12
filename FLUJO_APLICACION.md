# 🐾 SportPetMatch - Flujo de Aplicación y Casos de Uso

## 📱 Descripción General

**SportPetMatch** es una aplicación móvil que conecta personas que practican deportes con sus mascotas. Permite encontrar compañeros de entrenamiento, crear eventos deportivos, y hacer match con otros usuarios que comparten intereses similares.

---

## 🔄 Flujo Principal de la Aplicación

### 1. **Registro y Autenticación**

#### Flujo de Registro:
1. Usuario abre la app → Pantalla de **Login**
2. Toca "Registrarse" → Pantalla de **Registro**
3. Completa formulario:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Teléfono (opcional)
4. Presiona "Registrarse"
5. Sistema crea cuenta y redirige a **Onboarding**

#### Flujo de Login:
1. Usuario ingresa email y contraseña
2. Sistema valida credenciales
3. Si es correcto → Redirige a **Pantalla Principal**
4. Si no completó onboarding → Redirige a **Onboarding**

---

### 2. **Onboarding (Configuración Inicial)**

El usuario debe completar 3 pasos:

#### Paso 1: Tipo de Usuario
- **Solo**: Practica deporte sin mascota
- **Con Mascota**: Practica deporte CON su mascota
- **Ambos**: Hace ambas cosas

#### Paso 2: Deportes Favoritos
- Selecciona al menos un deporte de:
  - Correr, Caminar, Ciclismo, Senderismo
  - Yoga, Natación, Tenis, Fútbol
  - Volleyball, Patinaje

#### Paso 3: Tipo de Mascota (si aplica)
- Perro
- Gato
- Ambos

**Resultado**: Usuario completado y listo para usar la app

---

### 3. **Pantalla Principal (Dashboard/Inicio)**

El usuario ve:
- **Feed de actividades**: Eventos recientes, matches nuevos
- **Estadísticas rápidas**: Eventos, matches, mascotas
- **Acceso rápido** a:
  - Crear evento
  - Ver matches
  - Ver mapa

**Menú de usuario** (avatar en header):
- Mi Perfil
- Configuración
- Cerrar Sesión

---

### 4. **Gestión de Perfil**

#### Ver Perfil:
- Información personal
- Avatar
- Estadísticas (eventos, matches, mascotas)
- Acceso a editar perfil y configuración

#### Editar Perfil:
- Actualizar nombre, teléfono, biografía
- Cambiar avatar (sube imagen)
- Ajustar nivel deportivo (1-5)
- Seleccionar intereses deportivos
- Guardar cambios

---

### 5. **Gestión de Mascotas**

#### Agregar Mascota:
1. Usuario va a **Pantalla Mascotas**
2. Toca "Agregar Mascota"
3. Completa formulario:
   - Nombre, tipo (Perro/Gato/Otro), raza
   - Edad, peso, altura, color, género
   - Nivel de actividad (1-5)
   - Personalidad (juguetón, tranquilo, etc.)
   - Intereses (correr, nadar, etc.)
   - Fotos (múltiples)
   - Información de salud
4. Guarda → Mascota agregada

#### Ver/Editar Mascota:
- Ver detalles completos
- Editar información
- Agregar más fotos
- Eliminar mascota

---

### 6. **Sistema de Matching (Tinder-style)**

#### Flujo de Matching:
1. Usuario va a **Pantalla Matching**
2. Ve tarjetas de usuarios potenciales con:
   - Foto de perfil
   - Nombre y edad
   - Deportes favoritos
   - Mascotas (si tiene)
   - Ubicación aproximada

3. **Acciones**:
   - **Swipe Derecha / Like** (❤️):
     - Crea un match potencial
     - Si el otro usuario también dio like → **¡Es un Match!**
     - Ambos pueden chatear
   
   - **Swipe Izquierda / Pass** (❌):
     - No interesa este usuario
     - Pasa al siguiente

4. **Cuando hay Match**:
   - Aparece alerta: "¡Es un Match!"
   - Opción de ir al chat inmediatamente
   - El match aparece en **Pantalla Matches**

---

### 7. **Chat y Conversaciones**

#### Ver Matches:
- Lista de todos los matches
- Último mensaje enviado
- Indicador de mensajes no leídos
- Búsqueda de conversaciones

#### Abrir Chat:
1. Toca un match de la lista
2. Abre **Pantalla Chat**
3. Ve historial de mensajes
4. Puede enviar mensajes de texto
5. Ver información del match (long press)

#### Detalle del Match:
- Información del otro usuario
- Mascotas del otro usuario
- Opción de eliminar match

---

### 8. **Eventos Deportivos**

#### Crear Evento:
1. Usuario va a **Pantalla Eventos**
2. Toca "Crear Evento"
3. Completa formulario:
   - Título y descripción
   - Tipo de evento (Running, Ciclismo, etc.)
   - Fecha y hora de inicio
   - Fecha y hora de fin (opcional)
   - Ubicación (latitud, longitud)
   - Ciudad y país
   - Nivel requerido (1-5)
   - Permite mascotas (sí/no)
   - Máximo de participantes
4. Guarda → Evento creado

#### Ver Eventos:
- Lista de eventos disponibles
- Filtros por tipo, fecha, ubicación
- Ver detalles completos
- Unirse a evento

#### Detalle de Evento:
- Información completa
- Participantes
- Mapa con ubicación
- Opción de unirse/salir

---

### 9. **Mapa de Usuarios y Eventos**

#### Ver Mapa:
- Mapa interactivo con marcadores:
  - 🔵 **Azul**: Tu ubicación
  - 🟢 **Verde**: Otros usuarios cercanos
  - 🔴 **Rojo**: Eventos deportivos

#### Interacciones:
- Toca marcador de usuario → Ver perfil
- Toca marcador de evento → Ver detalle del evento
- Abrir en Google Maps (web/móvil)

---

### 10. **Configuración**

#### Ajustes Disponibles:
- **Notificaciones**:
  - Activar/desactivar notificaciones generales
  - Notificaciones de matches
  - Notificaciones de eventos

- **Privacidad**:
  - Política de privacidad
  - Términos y condiciones

- **Ayuda**:
  - Centro de ayuda
  - Acerca de la app

- **Cerrar Sesión**:
  - Confirmación requerida
  - Limpia datos de sesión

---

## 👥 Casos de Uso - Usuarios Ejemplo

### **Usuario 1: María - Corredora con Perro**

**Perfil:**
- 28 años, Santa Fe Capital
- Deportes: Running, Caminar
- Nivel: Intermedio (3/5)
- Mascota: Golden Retriever "Max", 3 años

**Flujo de uso:**
1. **Registro**: Se registra con email y contraseña
2. **Onboarding**: Selecciona "Con Mascota", intereses "Running" y "Caminar", tipo de mascota "Perro"
3. **Agrega a Max**: Sube fotos, completa información (peso, nivel de actividad, personalidad)
4. **Busca matches**: Usa la pantalla de matching para encontrar personas con perros que también corran
5. **Hace match con Juan**: Ambos se gustan, empiezan a chatear
6. **Crea evento**: Organiza "Running matutino en el parque" para el sábado a las 8am, permite mascotas
7. **Otros usuarios se unen**: 5 personas con sus perros se unen al evento
8. **Asisten al evento**: Se encuentran en el parque, corren juntos con sus mascotas

**Valor de la app para María:**
- Encuentra compañeros de running con perros
- Organiza eventos deportivos
- Conecta con personas con intereses similares

---

### **Usuario 2: Carlos - Ciclista Solitario**

**Perfil:**
- 35 años, Rosario
- Deportes: Ciclismo, Senderismo
- Nivel: Avanzado (5/5)
- Sin mascota

**Flujo de uso:**
1. **Registro**: Se registra rápidamente
2. **Onboarding**: Selecciona "Solo", intereses "Ciclismo" y "Senderismo"
3. **Explora eventos**: Ve eventos de ciclismo en su zona
4. **Se une a evento**: Se une a "Ruta ciclística por la costa" el domingo
5. **Conoce a otros ciclistas**: En el evento conoce a otros 3 ciclistas
6. **Hace matches**: Hace match con otros ciclistas para futuros paseos
7. **Crea grupo**: Organiza salidas regulares de ciclismo

**Valor de la app para Carlos:**
- Encuentra eventos de ciclismo
- Conecta con otros ciclistas
- Organiza salidas grupales

---

### **Usuario 3: Ana - Dueña de Múltiples Mascotas**

**Perfil:**
- 32 años, Córdoba
- Deportes: Yoga, Caminar, Senderismo
- Nivel: Principiante-Intermedio (2/5)
- Mascotas: 2 perros (Labrador y Beagle) y 1 gato

**Flujo de uso:**
1. **Registro y onboarding**: Selecciona "Con Mascota", múltiples deportes, tipo "Perro"
2. **Agrega sus 3 mascotas**: Completa perfiles detallados de cada una
3. **Busca eventos pet-friendly**: Filtra eventos que permitan mascotas
4. **Hace match con otros dueños**: Conecta con personas que también tienen perros
5. **Organiza playdate**: Crea evento "Playdate en el parque" para que las mascotas jueguen
6. **Chatea con matches**: Coordina encuentros para que sus perros socialicen

**Valor de la app para Ana:**
- Encuentra eventos donde puede llevar a sus mascotas
- Conecta con otros dueños de mascotas
- Socializa sus mascotas mientras hace ejercicio

---

### **Usuario 4: Diego - Entrenador Personal**

**Perfil:**
- 30 años, Buenos Aires
- Deportes: Crossfit, Running, Ciclismo
- Nivel: Avanzado (5/5)
- Sin mascota (pero le gustan)

**Flujo de uso:**
1. **Registro**: Se registra como usuario avanzado
2. **Onboarding**: Selecciona "Ambos" (practica solo y con mascota), todos los deportes
3. **Crea eventos regulares**: Organiza entrenamientos grupales semanales
4. **Atrae participantes**: Muchos usuarios se unen a sus eventos
5. **Hace match con clientes potenciales**: Conecta con personas interesadas en entrenar
6. **Ofrece servicios**: Usa el chat para ofrecer entrenamiento personalizado

**Valor de la app para Diego:**
- Promociona sus servicios
- Encuentra clientes
- Organiza eventos deportivos

---

### **Usuario 5: Laura - Principiante con Gato**

**Perfil:**
- 25 años, Mendoza
- Deportes: Yoga, Caminar
- Nivel: Principiante (1/5)
- Mascota: Gato "Luna", 2 años

**Flujo de uso:**
1. **Registro**: Nueva en el mundo del fitness
2. **Onboarding**: Selecciona "Con Mascota", intereses suaves (Yoga, Caminar)
3. **Busca eventos para principiantes**: Filtra por nivel principiante
4. **Hace match con mentores**: Conecta con usuarios más experimentados
5. **Recibe consejos**: Aprende sobre ejercicio con mascotas a través del chat
6. **Progresa gradualmente**: Aumenta su nivel de actividad con el tiempo

**Valor de la app para Laura:**
- Encuentra eventos apropiados para su nivel
- Conecta con personas que la pueden guiar
- Aprende sobre ejercicio con mascotas

---

## 🎯 Cómo Explicar la App

### **Elevator Pitch (30 segundos):**
"SportPetMatch es como Tinder, pero para personas que practican deportes con sus mascotas. Te permite encontrar compañeros de entrenamiento, crear eventos deportivos, y hacer match con personas que comparten tus intereses. ¿Te gusta correr con tu perro? ¡Encuentra a alguien que también lo haga!"

### **Explicación Detallada (2 minutos):**
"SportPetMatch es una aplicación móvil que conecta personas que practican deportes, especialmente aquellas que lo hacen con sus mascotas.

**Funcionalidades principales:**

1. **Sistema de Matching**: Similar a Tinder, puedes hacer swipe en usuarios potenciales. Si ambos se gustan, es un match y pueden chatear.

2. **Gestión de Mascotas**: Puedes crear perfiles detallados de tus mascotas con fotos, información de salud, personalidad, y nivel de actividad.

3. **Eventos Deportivos**: Puedes crear o unirte a eventos deportivos en tu zona. Los eventos pueden ser pet-friendly o no.

4. **Mapa Interactivo**: Ve usuarios y eventos cercanos en un mapa. Perfecto para encontrar actividades en tu zona.

5. **Chat**: Una vez que haces match, puedes chatear con la otra persona para coordinar encuentros o eventos.

**Casos de uso:**
- Encuentras a alguien que también corre con su perro
- Organizas un evento de ciclismo grupal
- Buscas eventos pet-friendly cerca de ti
- Conectas con personas con intereses deportivos similares

La app es perfecta para personas activas que quieren socializar mientras hacen ejercicio, especialmente si tienen mascotas."

---

## 📊 Métricas de Éxito

### **Para el Usuario:**
- Número de matches exitosos
- Eventos creados y asistidos
- Conversaciones activas
- Mascotas registradas

### **Para la App:**
- Usuarios activos mensuales
- Matches creados
- Eventos organizados
- Mensajes enviados
- Retención de usuarios

---

## 🔮 Funcionalidades Futuras (Opcionales)

1. **Sistema Premium**: Funciones avanzadas para usuarios premium
2. **Notificaciones Push**: Alertas de matches y eventos
3. **Integración con Redes Sociales**: Compartir eventos
4. **Sistema de Calificaciones**: Calificar eventos y usuarios
5. **Desafíos y Logros**: Gamificación de la app
6. **Integración con Wearables**: Sincronizar datos de actividad

---

## 📝 Resumen Ejecutivo

**SportPetMatch** es una plataforma social que combina:
- **Dating/Matching** (como Tinder)
- **Gestión de Mascotas** (como una red social para mascotas)
- **Eventos Deportivos** (como Meetup para deportes)
- **Geolocalización** (como Foursquare para eventos)

**Público objetivo:**
- Personas activas que practican deportes
- Dueños de mascotas que quieren ejercitar con ellas
- Organizadores de eventos deportivos
- Personas que buscan comunidad deportiva

**Problema que resuelve:**
- Dificultad para encontrar compañeros de entrenamiento
- Falta de eventos pet-friendly
- Necesidad de socializar mientras se hace ejercicio
- Deseo de que las mascotas también socialicen

