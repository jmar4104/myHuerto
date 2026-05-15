# Huerto 🌱

app de jardinería para puerto rico (zona 12b)

hice esto porque las apps normales no funcionan bien en el trópico. tiene 47 plantas nativas americanas y guarda todo local.

## qué hace

- lleva cuenta de 23 vegetales y 24 flores
- te dice cuándo regar con unos discos que hice
- calendario de tareas
- funciona en el celular, guarda todo en el browser
- español/inglés
- modo oscuro

## cómo usar

descarga los 3 archivos (index.html, huerto-app.css, huerto-app.js) a la misma carpeta y abre index.html

### en el cel

**iphone:** safari → compartir → "añadir a pantalla de inicio"

**android:** chrome → menú → "añadir a pantalla de inicio"

ya está, ahora tienes un ícono de app

## las plantas

### vegetales (23)
tomate, papa, batata, maíz, frijol, calabaza, pumpkin, pimiento, chile, aguacate, yuca, quinoa, amaranto, tomatillo, jícama, chayote, nopal, aguaturma, tepary bean, haba lima, maní, papaya, parcha

### flores (24)
girasol, rosa, maravilla, hibisco, zinnia, cosmos, dalia, black-eyed susan, coneflower, lupino, columbine, bee balm, amapola, pasionaria, campanilla, petunia, capuchina, verbena, salvia, aster, blanket flower, coral bells, trumpet vine, cardinal flower

la info está toda ahí - cuándo sembrar, temperaturas, dificultad, etc

## cómo guarda

usa localStorage del browser. se guarda automáticamente cuando:
- plantas algo
- riegas
- guardas favoritos
- cambias settings

**importante:** no uses modo incógnito o se borra todo cuando cierras la pestaña

## las pantallas

**mi huerto** - todas tus plantas, estado del agua, los discos

**mi jardín** - cuadrícula de tu patio real, toca las celdas para añadir plantas

**calendario** - genera las tareas de riego automáticamente

**vegetales** - todas las 47 plantas, toca la estrella para guardar

## sobre zona 12b

eso es puerto rico. clima tropical, sin heladas, siembras todo el año pero:
- hace mucho calor (las plantas necesitan sombra al mediodía a veces)
- humedad alta = hongos
- pero puedes cultivar todo el año

## si algo falla

**pantalla en blanco:** asegúrate que los 3 archivos estén juntos

**plantas desaparecieron:** probablemente usaste modo incógnito o borraste datos del browser

**estrellas no aparecen:** ya lo arreglé, descarga el archivo js nuevo

## estructura

```
carpeta/
  index.html       
  huerto-app.css   
  huerto-app.js    
```

no hay database, no hay server, no hay npm. solo html/css/js

## lo técnico

- los íconos son svg inline o emojis
- los discos usan canvas
- localStorage para guardar
- funciona offline
- como 60kb total
- usa lucide icons para la navegación

la estrella de favorito (★) se pone verde cuando guardas algo. antes usaba emoji bookmarks pero la estrella se ve mejor.

## tips zona 12b

tomates y pimientos van bien aquí. lechuga necesita sombra. cosas de clima frío son complicadas.

la app tiene recomendaciones de sombra - mira las horas en los detalles de cada planta.

## licencia

gratis, úsala como quieras. la hice para mí pero la comparto por si ayuda.

si le añades cosas o arreglas bugs está bien compartir pero no es obligatorio.

## notas

- empecé esto porque se me olvidaba cuándo regaba
- el calendario tal vez es mucho pero bueno
- tenía planeadas más funciones pero lo mantuve simple
- puede que añada más guías después
- nueva: ahora puedes sembrar varias de la misma planta (ejemplo: 5 tomates) y las colocas una por una

feliz jardinería 🌿

pd: si no estás en PR igual sirve pero las recomendaciones son para zona 12b



