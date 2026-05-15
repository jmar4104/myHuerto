# Huerto 

aplicación de jardinería para puerto rico (zona 12b)

hice esto porque las apps que encontré no funcionan bien en el trópico. tiene 47 plantas nativas americanas y guarda todo de forma local sin necesitar servidor.

## qué hace

- rastrea 23 vegetales y 24 flores (todas nativas de las américas)
- te avisa cuándo regar con unos indicadores visuales en forma de disco
- calendario automático de tareas de riego
- funciona en el celular, todo se guarda en el navegador
- español/inglés
- modo nocturno
- notificaciones de riego
- clima de puerto rico en tiempo real
- alertas de rotación de cultivos

## cómo usarla

descarga los 3 archivos (index.html, huerto-app.css, huerto-app.js) a la misma carpeta y abre el index.html en tu navegador.

### instalación en el celular

**iphone:** abre en safari → compartir → "añadir a pantalla de inicio"

**android:** abre en chrome → menú (tres puntos) → "añadir a pantalla de inicio"

listo, ahora tienes un ícono de app en tu pantalla.

## las plantas

### vegetales (23)
tomate, papa, batata, maíz, frijol, calabaza, pumpkin, pimiento, chile, aguacate, yuca, quinoa, amaranto, tomatillo, jícama, chayote, nopal, aguaturma, frijol tepary, haba lima, maní, papaya, parcha

### flores (24)
girasol, rosa, maravilla, hibisco, zinnia, cosmos, dalia, black-eyed susan, coneflower, lupino, columbine, bee balm, amapola de california, pasionaria, campanilla, petunia, capuchina, verbena, salvia, aster, blanket flower, coral bells, trumpet vine, cardinal flower

toda la información está incluida - tiempos de siembra, rangos de temperatura, nivel de dificultad, etc.

## cómo guarda los datos

usa localStorage del navegador. todo se guarda automáticamente cuando:
- plantas algo
- riegas una planta
- guardas favoritos
- cambias la configuración

**importante:** no uses modo incógnito porque perderás todos los datos al cerrar la pestaña.

## las pantallas

**mi huerto** - muestra todas tus plantas, estado del riego, indicadores visuales

**mi jardín** - vista de cuadrícula de tu jardín real, toca las celdas para añadir plantas

**calendario** - genera automáticamente las tareas de riego para la semana

**vegetales** - explora las 47 plantas disponibles, toca la estrella para guardar favoritas

## funciones nuevas

### notificaciones de riego 
activa las notificaciones y la app te avisará cuando tus plantas necesiten agua. revisa cada hora y te manda una alerta directamente al navegador.

### clima de puerto rico 
conecta con la API del clima para mostrar las condiciones actuales en san juan. útil para saber si va a llover y ajustar el riego. necesitas tu propia API key gratuita de openweathermap.

### rotación de cultivos 🔄
la app rastrea qué plantas has sembrado en cada celda y te avisa si estás poniendo la misma familia en el mismo sitio (por ejemplo, tomate después de pimiento - ambos son solanáceas). esto ayuda a mantener el suelo saludable.

## sobre zona 12b

puerto rico tiene clima tropical, sin heladas, puedes sembrar todo el año pero hay retos:
- el calor intenso (muchas plantas necesitan sombra en el mediodía)
- humedad alta que favorece hongos
- pero la ventaja es que cultivas durante todo el año

## si algo no funciona

**pantalla en blanco:** verifica que los 3 archivos estén en la misma carpeta

**plantas desaparecieron:** probablemente usaste modo incógnito o borraste los datos del navegador

**las notificaciones no llegan:** asegúrate de haber dado permiso en el navegador

**el clima no carga:** necesitas añadir tu API key de openweathermap en el código

## estructura de archivos

```
tu-carpeta/
  index.html       - la interfaz
  huerto-app.css   - los estilos
  huerto-app.js    - toda la lógica
```

sin base de datos, sin servidor, sin dependencias npm. solo html, css y javascript.

## lo técnico

- los íconos son svg inline, emojis, o de lucide icons
- los indicadores circulares usan canvas
- localStorage para persistencia de datos
- funciona completamente offline (excepto clima y notificaciones)
- aproximadamente 70kb en total
- usa la API de notificaciones del navegador
- conecta con openweathermap para datos del clima
- sistema de rotación basado en familias de plantas

hice el marcador de favoritos como una estrella (★) que se pone verde al guardar. antes usaba emojis pero la estrella se ve más limpia.

## consejos para zona 12b

tomates, pimientos y cosas tropicales van muy bien aquí. la lechuga necesita sombra parcial. cualquier planta que prefiera clima frío va a sufrir un poco.

la app incluye recomendaciones de sombra - busca el indicador de horas en los detalles de cada planta.

## configuración del clima

para usar la función del clima:

1. crea cuenta gratis en https://openweathermap.org
2. copia tu API key
3. abre huerto-app.js
4. busca `const API_KEY='demo'`
5. reemplázala con tu key: `const API_KEY='tu_key_aqui'`

## licencia

gratis y de código abierto. la hice para mi jardín pero la comparto por si le sirve a alguien más.

si añades plantas o corriges errores está bien que compartas los cambios, pero no es obligatorio.

## notas de desarrollo

- empecé esto porque siempre se me olvidaba cuándo había regado
- el calendario probablemente es más de lo necesario pero funciona
- tenía planeadas más funciones pero preferí mantenerlo simple
- tal vez añada guías de cultivo más detalladas en el futuro
- ahora puedes sembrar varias plantas del mismo tipo (ejemplo: 5 tomates) y colocarlas una por una en el jardín

## cosas que quiero añadir

- **notificaciones push** para recordatorios de riego  implementado
- **integración con api del clima de PR** para ajustar el riego según la lluvia  implementado
- **recomendaciones de rotación de cultivos** para no sembrar lo mismo en el mismo sitio  implementado
- ajustar automáticamente el calendario de riego basado en la lluvia prevista
- notificaciones más inteligentes (una sola vez al día)
- más familias de plantas para el sistema de rotación
- gráficas del historial de riego

si quieres ayudar con alguna de estas funciones o proponer otras nuevas, adelante.

feliz jardinería 

---

**nota:** si no estás en puerto rico igual puedes usar la app, pero las recomendaciones de plantas y clima están optimizadas para zona 12b.



