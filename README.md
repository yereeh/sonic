# Juego de Sonic - Funciones de Testing

## Configuración de Testing

En el archivo `src/script.js`, puedes modificar la configuración de testing:

```javascript
const TESTING_CONFIG = {
    enableLevelSkip: true,     // Activar/desactivar controles de testing
    startLevel: 1,             // Nivel inicial (1, 2, o 3)
    showDebugInfo: true        // Mostrar información de debug en consola
};
```

## Controles de Testing

Cuando `enableLevelSkip` está activado:

- **Tecla 1**: Ir al Nivel 1
- **Tecla 2**: Ir al Nivel 2  
- **Tecla 3**: Ir al Nivel 3
- **Tecla R**: Resetear el nivel actual

## Controles del Juego

- **Flechas Izquierda/Derecha**: Mover a Sonic
- **Flecha Arriba**: Saltar
- **Objetivo**: Recoger los 4 anillos de cada nivel

## Configuración Rápida para Testing

### Para testear Nivel 1:
```javascript
const TESTING_CONFIG = {
    enableLevelSkip: true,
    startLevel: 1,
    showDebugInfo: true
};
```

### Para testear Nivel 2:
```javascript
const TESTING_CONFIG = {
    enableLevelSkip: true,
    startLevel: 2,
    showDebugInfo: true
};
```

### Para testear Nivel 3:
```javascript
const TESTING_CONFIG = {
    enableLevelSkip: true,
    startLevel: 3,
    showDebugInfo: true
};
```

### Para modo normal (sin testing):
```javascript
const TESTING_CONFIG = {
    enableLevelSkip: false,
    startLevel: 1,
    showDebugInfo: false
};
```

## Información de Debug

Con `showDebugInfo: true`, verás en la consola del navegador:
- Cuando recoges anillos
- Cuando te golpean enemigos o bombas
- Cuando cambias de nivel
- Cuando reseteas un nivel

## Cómo usar

1. Abre el archivo `src/script.js`
2. Modifica `TESTING_CONFIG` según lo que quieras testear
3. Guarda el archivo y recarga el juego
4. Usa las teclas numéricas para navegar entre niveles
