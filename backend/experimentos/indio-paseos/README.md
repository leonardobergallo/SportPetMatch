# Indio Paseadores y GPS · Laboratorio local

Desde la raíz del repositorio, con las dependencias de `backend` instaladas:

```powershell
node backend/experimentos/indio-paseos/servidor.mjs
```

Abrí `http://127.0.0.1:8784`. Elegí **Dueño**, buscá por zona y solicitá un paseo con fecha futura. Cambiá a **Paseador**, aceptá la solicitud, activá el seguimiento y usá **Simular punto** un par de veces, con al menos un segundo de diferencia. Como dueño, abrí **Ver recorrido**. Volvé al paseador para finalizar y consultá el resumen. Para probar el collar, vinculá una mascota con radio de 100 m y simulá dos movimientos.

## Arquitectura y privacidad

- El laboratorio usa Express y una interfaz web independiente. Escucha sólo en loopback, no utiliza la base de Indio y borra sus datos al reiniciar. Las cuentas ficticias se seleccionan en la interfaz y reciben un token efímero. El selector de identidades es exclusivo de la demo.
- El servidor verifica los participantes y el estado del paseo en cada petición. El dueño puede leer mientras el seguimiento esté activo y sólo el paseador asignado puede enviar puntos. La sesión se cierra al finalizar o a las cuatro horas. Los puntos se eliminan al cierre. Los resúmenes se conservan hasta 24 horas después del cierre o, para reservas sin paseo iniciado, del horario reservado. La limpieza corre cada minuto.
- El collar virtual vive en la pestaña y tiene su propia posición y zona segura. Leaflet carga calles de OpenStreetMap únicamente para los puntos ficticios y el centro agregado de Santa Fe. Los puntos capturados por el teléfono se muestran en un plano local sin teselas. El punto del teléfono es la posición del paseador, no una lectura del perro.
- El rol Administrador consulta métricas de los registros ficticios y puede suspender/reactivar cuentas, cambiar verificaciones y moderar el evento ficticio. La auditoría conserva los últimos cambios en memoria. El mapa recibe sólo totales por zona y el centro ilustrativo de Santa Fe. Las rutas de seguimiento mantienen el control por participante.
- Dueño puede filtrar por zona, precio, disponibilidad, texto del tipo de paseo y verificación. Los paseos se pueden filtrar por mascota. El panel del paseador muestra agenda, solicitudes y servicios finalizados. Los gráficos del administrador cuentan registros del período seleccionado.

## Compatibilidad

El botón **Usar GPS del celular** requiere iniciar el servidor con `INDIO_DEMO_GPS_REAL=1`, permiso explícito y un contexto seguro (HTTPS o loopback). Se puede pausar desde el panel. La demo sólo envía posiciones mientras la página esté visible. El modo GPS real limita cada seguimiento a 30 minutos. Chrome, Safari, una PWA y la app Android actual basada en WebView deben probarse en equipos físicos. Con pantalla bloqueada, la app en segundo plano o ahorro de batería puede haber interrupciones.

Para una URL HTTPS temporal, iniciar también `preview-protegida.mjs` con el mismo `INDIO_DEMO_PORT` y configurar `INDIO_PREVIEW_ACCESS_FILE` en un directorio privado fuera del repositorio. El túnel requiere Cloudflared. La URL es para personas invitadas a la prueba: todos sus visitantes autorizados pueden cambiar de rol ficticio. Usar una instancia dedicada cuando se pruebe la ubicación real.

## Siguiente etapa

Para integrar Paseadores en Indio, reemplazar los roles de demo por la autenticación existente, vincular perfiles y mascotas por ID y persistir reservas y sesiones en tablas aditivas. Antes de habilitar seguimiento en segundo plano, evaluar permisos nativos, el servicio de ubicación y los avisos visibles al usuario.

Para el collar real, incorporar un adaptador independiente de proveedor que autentique reportes de un dispositivo 4G por API, normalice coordenadas, hora y precisión, y deduplique entregas antes de evaluar geocercas. Validar la propiedad del dispositivo y de la mascota antes de mostrar datos. El simulador no requiere hardware ni usa las posiciones del paseador.

## Verificación realizada

Chromium a 390 y 1280 px con backend local y datos ficticios. Se comprobó solicitud, aceptación, inicio, dos puntos simulados, distancia, consulta del dueño, finalización y alerta de salida de la zona segura. También se verificó la carga de calles y el zoom. La API devolvió 401 sin sesión, 404 a un visitante o administrador ajeno al paseo, 403 al dueño intentando escribir ubicación y 409 al consultar o escribir después del cierre. La pantalla móvil no presentó desborde horizontal. La ubicación del teléfono y la regresión de la app principal quedan pendientes de pruebas en dispositivo.

La revisión integral también verificó filtros sin resultados, período sin actividad, rechazo, cancelación, bloqueo de duplicados, suspensión y reactivación, auditoría, moderación ficticia y rechazo de acciones administrativas para otros roles. En Chromium se probó GPS emulado y el estado de ubicación desactualizada.
