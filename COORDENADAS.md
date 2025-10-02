# Sistema de Coordenadas en Phaser

## Origen del Sistema
- **Origen (0,0)** está en la **esquina superior izquierda** de la pantalla
- **Eje X**: aumenta hacia la **derecha**
- **Eje Y**: aumenta hacia **abajo** (¡importante!)

```
(0,0) -----------> X
  |
  |
  |
  |
  v
  Y
```

## Dimensiones del Juego

### Niveles 1 y 2:
- Ancho: 800 píxeles (X: 0 a 800)
- Alto: 600 píxeles (Y: 0 a 600)

### Nivel 3:
- Ancho: 1200 píxeles (X: 0 a 1200)
- Alto: 800 píxeles (Y: 0 a 800)

## Ejemplos de Coordenadas

### Posiciones Típicas:
```
Esquina superior izquierda:  (0, 0)
Centro superior:             (400, 0)    - Nivel 1-2
Centro de pantalla:          (400, 300)  - Nivel 1-2
Centro inferior:             (400, 600)  - Nivel 1-2
Esquina inferior derecha:    (800, 600)  - Nivel 1-2
```

## Cómo se Posicionan las Plataformas

### Sintaxis:
```javascript
platforms.create(X, Y, 'ground').setScale(ancho, alto).refreshBody();
```

### Ejemplos del Juego:

#### Nivel 1:
```javascript
// Suelo principal
platforms.create(400, 568, 'ground').setScale(1.2, 0.1).refreshBody();
//                ^    ^     ^                    ^     ^
//                |    |     |                    |     alto de la plataforma
//                |    |     |                    ancho de la plataforma  
//                |    |     sprite a usar
//                |    Y: cerca del fondo (568 de 600 total)
//                X: centro horizontal (400 de 800 total)

// Plataforma derecha
platforms.create(600, 400, 'ground').setScale(0.4, 0.1).refreshBody();
//                ^    ^
//                |    Y: posición media-alta
//                X: lado derecho

// Plataforma izquierda superior
platforms.create(50, 250, 'ground').setScale(0.4, 0.1).refreshBody();
//                ^   ^
//                |   Y: posición alta
//                X: lado izquierdo

// Plataforma derecha superior
platforms.create(750, 220, 'ground').setScale(0.4, 0.1).refreshBody();
//                ^    ^
//                |    Y: posición muy alta
//                X: extremo derecho
```

## Visualización del Nivel 1:

```
Y=0   ----------------------------------------
      |                                      |
Y=220 |                            [P4]     |  <- Plataforma 4
      |                                      |
Y=250 |    [P3]                             |  <- Plataforma 3
      |                                      |
      |                                      |
Y=400 |                        [P2]         |  <- Plataforma 2
      |                                      |
      |                                      |
Y=568 |        [====SUELO====]              |  <- Suelo principal
Y=600 ----------------------------------------
     X=0   50  400  600  750              800
```

## Consejos para Posicionar Plataformas:

### 1. **Eje Y (Vertical)**:
- Valores pequeños (0-200): parte superior
- Valores medios (200-400): parte media
- Valores grandes (400-600): parte inferior

### 2. **Eje X (Horizontal)**:
- Valores pequeños (0-200): lado izquierdo
- Valores medios (300-500): centro
- Valores grandes (600-800): lado derecho

### 3. **Escala (setScale)**:
- Primer valor (X): ancho de la plataforma
- Segundo valor (Y): grosor de la plataforma
- Ejemplo: `.setScale(0.5, 0.1)` = plataforma mediana y delgada

## Herramientas para Testing:

Puedes añadir esta función temporal para ver coordenadas:

```javascript
// Agregar al create() para debug
this.input.on('pointerdown', function (pointer) {
    console.log(`Click en: X=${pointer.x}, Y=${pointer.y}`);
});
```

## Posiciones de Ejemplo por Dificultad:

### Fácil (separadas):
```javascript
platforms.create(200, 500, 'ground');  // Izquierda baja
platforms.create(600, 350, ground');   // Derecha media
```

### Difícil (cercanas):
```javascript
platforms.create(300, 400, 'ground').setScale(0.2, 0.1);  // Pequeña
platforms.create(500, 380, 'ground').setScale(0.15, 0.1); // Muy pequeña y cerca
```

## Recordatorio Importante:
- **Y aumenta hacia ABAJO** (diferente a matemáticas tradicionales)
- El **centro** de la plataforma se coloca en las coordenadas especificadas
- **refreshBody()** es necesario después de cambiar la escala para actualizar la física
