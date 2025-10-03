// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 800, // Mantener tamaño original
    height: 600, // Mantener tamaño original
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Aumentada de 800 a 1500 para caída más rápida
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    // Configuraciones para evitar problemas de foco
    disableContextMenu: true,
    pauseOnBlur: false,  // No pausar cuando pierde el foco
    pauseOnFocusLoss: false  // No pausar cuando pierde el foco
};

// *** CONFIGURACIÓN DE TESTING ***
const TESTING_CONFIG = {
    enableLevelSkip: true,     // Cambiar a false para desactivar
    startLevel: 1,             // Usa 4 para iniciar directamente en el nivel final
    showDebugInfo: true        // Mostrar información de debug
};

// Variables globales del juego
let player;
let platforms;
let cursors;
let rings;
let enemies;
let bombs;
let warningBars;
let ringCount = 0;
let currentLevel = TESTING_CONFIG.startLevel; // Usar nivel configurado
let scoreText;
let debugText;

// Diálogo inicial
let dialogIndex = 0;
let dialogText;
let canMove = false;
let dialogBubble;
const initialDialogs = [
    "¡Ay caray… creo que me perdí! 🤔",
    "Me dijeron que debía ir por un pastel… pero no tengo ni idea dónde está.",
    "Bueno, supongo que si junto algunos rings podré comprarlo. ¡Perfecto plan!",
    "Ahí hay unos cuantos… ¡vamos por ellos a toda velocidad!"
];

// Función para precargar recursos
function preload() {
    // Cargar fondo
    this.load.image('fondo', 'assets/fondo.png');
    
    // Cargar sprite de plataforma desde assets
    this.load.image('ground', 'assets/platafroma.png');
    
    // Cargar sprite del personaje desde assets
    this.load.image('player', 'assets/Idle/idle.png');
    
    // Cargar sprites de caminar
    this.load.image('walk1', 'assets/Caminar/corre1.png');
    this.load.image('walk2', 'assets/Caminar/corre2.png');
    this.load.image('walk3', 'assets/Caminar/corre3.png');
    this.load.image('walk4', 'assets/Caminar/corre4.png');
    
    // Cargar sprites de anillos
    this.load.image('ring1', 'assets/anillo/anillo1.png');
    this.load.image('ring2', 'assets/anillo/anillo2.png');
    this.load.image('ring3', 'assets/anillo/anillo3.png');
    this.load.image('ring4', 'assets/anillo/anillo4.png');
    
    // Cargar sprite del enemigo
    this.load.image('crab', 'assets/enemigos/crabo.png');
    
    // Cargar sprite de la bomba
    this.load.image('bomb', 'assets/Enemigos/bomb.png');
    
    // Cargar música de fondo
    this.load.audio('niveles', 'assets/niveles.mp3'); // Cambia aquí el nombre del archivo
    
    // Agregar carga de sonidos
    this.load.audio('anilloSound', 'assets/anillos.mp3');
    this.load.audio('perderAnillos', 'assets/perderanillos.mp3');
}

// Función para crear objetos del juego
function create() { 
    // Crear fondo primero (para que esté detrás de todo)
    this.add.image(400, 300, 'fondo').setOrigin(0.5, 0.5);
    
    // Crear jugador primero - Modificado para aparecer ya en el suelo
    player = this.physics.add.sprite(100, 526, 'player'); // Y cambiado a 560 (más cerca del suelo)
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(0.15);
    player.body.setSize(player.width * 0.6, player.height * 0.8, true);
    // Ya no desactivamos la gravedad inicialmente
    
    // Crear animaciones
    this.anims.create({
        key: 'walk',
        frames: [
            { key: 'walk1' },
            { key: 'walk2' },
            { key: 'walk3' },
            { key: 'walk4' }
        ],
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'ringRotate',
        frames: [
            { key: 'ring1' },
            { key: 'ring2' },
            { key: 'ring3' },
            { key: 'ring4' }
        ],
        frameRate: 8,
        repeat: -1
    });
    
    // Configurar controles
    cursors = this.input.keyboard.createCursorKeys();
    
    // *** CONTROLES ADICIONALES PARA TESTING ***
    if (TESTING_CONFIG.enableLevelSkip) {
        // Teclas numéricas para cambiar de nivel
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); // Reset nivel

        // --- AGREGAR TECLA 4 PARA IR DIRECTO AL NIVEL FINAL ---
        this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    }
    
    // Texto de puntuación
    scoreText = this.add.text(16, 16, `Anillos: 0/4 - Nivel: ${currentLevel}`, {
        fontSize: '32px',
        fill: '#000'
    });
    
    // *** TEXTO DE DEBUG PARA TESTING ***
    if (TESTING_CONFIG.showDebugInfo) {
        // Mostrar coordenadas al hacer click
        this.input.on('pointerdown', function (pointer) {
            console.log(`Click en coordenadas: X=${Math.round(pointer.x)}, Y=${Math.round(pointer.y)}`);
        });
        
        
    }
    
    // Evitar que el juego se pause al perder el foco
    this.game.events.on('blur', () => {
        this.scene.resume();
    });
    
    this.game.events.on('focus', () => {
        this.scene.resume();
    });
    
    // Música de fondo en loop (solo si no está ya sonando)
    if (!this.bgMusic) {
        this.bgMusic = this.sound.add('niveles', { loop: true, volume: 0.7 }); // Usa 'niveles'
        this.bgMusic.play();
    }

    // Modificar la inicialización del diálogo
    dialogBubble = this.add.graphics();
    dialogText = this.add.text(player.x, player.y - 100, '', {
        fontSize: '18px',
        fill: '#000',
        padding: { x: 10, y: 5 },
        wordWrap: { width: 200 }
    });
    dialogText.setOrigin(0.5);
    
    // Remover el listener del ENTER ya que los diálogos avanzarán automáticamente
    canMove = false;

    // Esperar un poco menos antes de los diálogos ya que cae más rápido
    this.time.delayedCall(500, () => {
        startAutoDialogs.call(this);
    });

    createLevel.call(this, currentLevel);
}

// Nueva función para manejar diálogos automáticos
function startAutoDialogs() {
    let currentDialog = 0;
    
    const showNextDialog = () => {
        if (currentDialog < initialDialogs.length) {
            showDialog(initialDialogs[currentDialog]);
            currentDialog++;
            
            // Programar el siguiente diálogo (aumentado de 2000 a 2500)
            this.time.delayedCall(2500, () => {
                if (currentDialog < initialDialogs.length) {
                    showNextDialog();
                } else {
                    // Último diálogo terminado
                    dialogBubble.clear();
                    dialogText.setText('');
                    canMove = true;
                }
            });
        }
    };
    
    showNextDialog();
}

// Función para crear un nivel específico
function createLevel(level) {
    // Limpiar elementos existentes
    if (platforms) platforms.clear(true, true);
    if (rings) rings.clear(true, true);
    if (enemies) enemies.clear(true, true);
    if (bombs) bombs.clear(true, true);
    if (warningBars) warningBars.clear(true, true);
    
    ringCount = 0;
    
    // Crear grupo de plataformas
    platforms = this.physics.add.staticGroup();
    rings = this.physics.add.group();
    enemies = this.physics.add.group();
    bombs = this.physics.add.group();
    warningBars = this.add.group();
    
    if (level === 1) {
        createLevel1();
    } else if (level === 2) {
        createLevel2();
    } else if (level === 3) {
        createLevel3();
    }
    
    // Configurar colisiones
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(rings, platforms);
    this.physics.add.overlap(player, rings, collectRing, null, this);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(player, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, bombs, hitBomb, null, this);
    
    // Timer para bombas
    if (this.bombTimer) this.bombTimer.remove();
    this.bombTimer = this.time.addEvent({
        delay: level === 1 ? 1500 : (level === 2 ? 1000 : 700), // Aún más rápido en nivel 3
        callback: createWarning,
        callbackScope: this,
        loop: true
    });
    
    // Ajustar el tamaño del jugador según el nivel
    if (level === 1) {
        player.setScale(0.15);
    } else if (level === 2) {
        player.setScale(0.1);
    } else if (level === 3) {
        player.setScale(0.08); // Aún más pequeño en nivel 3
    }
    player.body.setSize(player.width * 0.6, player.height * 0.8, true);
    
    // Ajustar el tamaño del mundo según el nivel
    if (level === 3) {
        this.physics.world.setBounds(0, 0, 1200, 800); // Mundo más grande solo para nivel 3
        this.cameras.main.setBounds(0, 0, 1200, 800);
        this.cameras.main.startFollow(player, true, 0.08, 0.08); // Cámara sigue al jugador con suavizado
        this.cameras.main.setDeadzone(100, 50); // Zona muerta para movimiento más suave
    } else {
        this.physics.world.setBounds(0, 0, 800, 600); // Tamaño normal para niveles 1 y 2
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.stopFollow();
        this.cameras.main.setScroll(0, 0); // Resetear scroll de cámara
    }
}

// Crear nivel 1 (original)
function createLevel1() {
    // Crear plataformas nivel 1
    platforms.create(400, 583, 'ground').setScale(1.2, 0.1).refreshBody();
    platforms.create(600, 400, 'ground').setScale(0.4, 0.1).refreshBody();
    platforms.create(50, 250, 'ground').setScale(0.4, 0.1).refreshBody();
    platforms.create(750, 220, 'ground').setScale(0.4, 0.1).refreshBody();
    
    // Crear anillos nivel 1
    let ring1 = rings.create(400, 520, 'ring1');
    let ring2 = rings.create(600, 350, 'ring1');
    let ring3 = rings.create(50, 200, 'ring1');
    let ring4 = rings.create(750, 170, 'ring1');
    
    rings.children.entries.forEach(ring => {
        ring.setScale(0.08);
        ring.anims.play('ringRotate');
    });
    
    // Crear enemigos nivel 1
    let enemy1 = enemies.create(300, 520, 'crab');
    enemy1.platformLimits = { left: 100, right: 700 };
    
    let enemy2 = enemies.create(580, 350, 'crab');
    enemy2.platformLimits = { left: 480, right: 720 };
    
    let enemy3 = enemies.create(30, 200, 'crab');
    enemy3.platformLimits = { left: -70, right: 170 };
    
    let enemy4 = enemies.create(730, 170, 'crab');
    enemy4.platformLimits = { left: 630, right: 870 };
    
    enemies.children.entries.forEach(enemy => {
        enemy.setScale(0.1);
        enemy.setBounce(0.1);
        enemy.setCollideWorldBounds(false);
        enemy.setVelocityX(50);
        enemy.direction = 1;
        enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.6, true);
    });
}

// Crear nivel 2 (más complicado)
function createLevel2() {
    // Más plataformas y más pequeñas
    platforms.create(400, 583, 'ground').setScale(1.0, 0.08).refreshBody(); // Suelo más pequeño
    platforms.create(150, 450, 'ground').setScale(0.2, 0.08).refreshBody(); // Plataforma baja izq más pequeña
    platforms.create(650, 450, 'ground').setScale(0.2, 0.08).refreshBody(); // Plataforma baja der más pequeña
    platforms.create(100, 320, 'ground').setScale(0.15, 0.08).refreshBody(); // Plataforma media izq más pequeña
    platforms.create(400, 350, 'ground').setScale(0.2, 0.08).refreshBody(); // Plataforma media centro más pequeña
    platforms.create(700, 320, 'ground').setScale(0.15, 0.08).refreshBody(); // Plataforma media der más pequeña
    platforms.create(250, 200, 'ground').setScale(0.15, 0.08).refreshBody(); // Plataforma alta izq más pequeña
    platforms.create(550, 200, 'ground').setScale(0.15, 0.08).refreshBody(); // Plataforma alta der más pequeña
    platforms.create(400, 120, 'ground').setScale(0.12, 0.08).refreshBody(); // Plataforma muy alta más pequeña
    
    // Anillos en posiciones más difíciles
    let ring1 = rings.create(150, 400, 'ring1');
    let ring2 = rings.create(400, 300, 'ring1');
    let ring3 = rings.create(250, 150, 'ring1');
    let ring4 = rings.create(400, 70, 'ring1'); // Anillo muy alto
    
    rings.children.entries.forEach(ring => {
        ring.setScale(0.08);
        ring.anims.play('ringRotate');
    });
    
    // Más enemigos y más rápidos
    let enemy1 = enemies.create(200, 520, 'crab');
    enemy1.platformLimits = { left: 50, right: 750 };
    
    let enemy2 = enemies.create(150, 400, 'crab');
    enemy2.platformLimits = { left: 90, right: 210 };
    
    let enemy3 = enemies.create(650, 400, 'crab');
    enemy3.platformLimits = { left: 590, right: 710 };
    
    let enemy4 = enemies.create(400, 300, 'crab');
    enemy4.platformLimits = { left: 340, right: 460 };
    
    let enemy5 = enemies.create(100, 270, 'crab');
    enemy5.platformLimits = { left: 65, right: 135 };
    
    let enemy6 = enemies.create(700, 270, 'crab');
    enemy6.platformLimits = { left: 665, right: 735 };
    
    enemies.children.entries.forEach(enemy => {
        enemy.setScale(0.07); // Más pequeños en nivel 2 (antes era 0.1)
        enemy.setBounce(0.1);
        enemy.setCollideWorldBounds(false);
        enemy.setVelocityX(75); // Más rápidos en nivel 2
        enemy.direction = 1;
        enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.6, true);
    });
}

// Crear nivel 3 (extremadamente difícil)
function createLevel3() {
    // Plataformas muy pequeñas y dispersas
    platforms.create(316, 785, 'ground').setScale(1, 0.08).refreshBody();
    platforms.create(800, 785, 'ground').setScale(1, 0.08).refreshBody(); // Suelo más pequeño
    platforms.create(100, 650, 'ground').setScale(0.12, 0.06).refreshBody(); // Plataforma muy pequeña
    platforms.create(300, 550, 'ground').setScale(0.1, 0.06).refreshBody(); 
    platforms.create(500, 450, 'ground').setScale(0.12, 0.06).refreshBody();
    platforms.create(800, 600, 'ground').setScale(0.1, 0.06).refreshBody();
    platforms.create(1000, 500, 'ground').setScale(0.12, 0.06).refreshBody();
    platforms.create(200, 350, 'ground').setScale(0.1, 0.06).refreshBody();
    platforms.create(600, 300, 'ground').setScale(0.12, 0.06).refreshBody();
    platforms.create(900, 250, 'ground').setScale(0.1, 0.06).refreshBody();
    platforms.create(400, 200, 'ground').setScale(0.08, 0.06).refreshBody();
    platforms.create(700, 150, 'ground').setScale(0.1, 0.06).refreshBody();
    platforms.create(600, 80, 'ground').setScale(0.08, 0.06).refreshBody(); // Plataforma muy alta
    
    // Anillos en posiciones extremadamente difíciles
    let ring1 = rings.create(100, 600, 'ring1');
    let ring2 = rings.create(600, 250, 'ring1');
    let ring3 = rings.create(900, 200, 'ring1');
    let ring4 = rings.create(600, 30, 'ring1'); // Anillo súper alto
    
    rings.children.entries.forEach(ring => {
        ring.setScale(0.06); // Anillos más pequeños
        ring.anims.play('ringRotate');
    });
    
    // Muchos más enemigos y súper rápidos
    let enemy1 = enemies.create(400, 720, 'crab');
    enemy1.platformLimits = { left: 100, right: 1100 };
    
    let enemy2 = enemies.create(100, 600, 'crab');
    enemy2.platformLimits = { left: 60, right: 140 };
    
    let enemy3 = enemies.create(300, 500, 'crab');
    enemy3.platformLimits = { left: 270, right: 330 };
    
    let enemy4 = enemies.create(500, 400, 'crab');
    enemy4.platformLimits = { left: 470, right: 530 };
    
    let enemy5 = enemies.create(800, 550, 'crab');
    enemy5.platformLimits = { left: 770, right: 830 };
    
    let enemy6 = enemies.create(1000, 450, 'crab');
    enemy6.platformLimits = { left: 970, right: 1030 };
    
    let enemy7 = enemies.create(200, 300, 'crab');
    enemy7.platformLimits = { left: 170, right: 230 };
    
    let enemy8 = enemies.create(600, 250, 'crab');
    enemy8.platformLimits = { left: 570, right: 630 };
    
    enemies.children.entries.forEach(enemy => {
        enemy.setScale(0.05); // Súper pequeños en nivel 3
        enemy.setBounce(0.1);
        enemy.setCollideWorldBounds(false);
        enemy.setVelocityX(100); // Súper rápidos en nivel 3
        enemy.direction = 1;
        enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.6, true);
    });
}

// Función que se ejecuta en cada frame
function update() {
    // --- Solución para evitar que update() se ejecute tras cambiar de escena ---
    // Si el nivel final está activo, no ejecutar más lógica aquí
    if (this.scene.isActive('FinalLevel')) {
        return;
    }

    // Validar que el jugador y su cuerpo están inicializados
    if (!player || !player.body) {
        console.warn('Player object is not initialized.');
        return;
    }

    // *** CONTROLES DE TESTING ***
    if (TESTING_CONFIG.enableLevelSkip) {
        // Cambiar a nivel 1
        if (Phaser.Input.Keyboard.JustDown(this.key1) && currentLevel !== 1) {
            currentLevel = 1;
            this.goToLevel(1);
        }
        // Cambiar a nivel 2
        if (Phaser.Input.Keyboard.JustDown(this.key2) && currentLevel !== 2) {
            currentLevel = 2;
            this.goToLevel(2);
        }
        // Cambiar a nivel 3
        if (Phaser.Input.Keyboard.JustDown(this.key3) && currentLevel !== 3) {
            currentLevel = 3;
            this.goToLevel(3);
        }
        // Reset nivel actual
        if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            this.resetCurrentLevel();
        }

        // Ir directo al nivel final con la tecla 4
        if (this.key4 && Phaser.Input.Keyboard.JustDown(this.key4)) {
            scoreText.setText('Cargando el último nivel...');
            loadFinalLevelScript.call(this);
        }
    }
    
    // Controles del jugador
    if (canMove) {
        if (cursors.left.isDown) {
            player.setVelocityX(-250);
            player.anims.play('walk', true);
            player.setFlipX(true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(250);
            player.anims.play('walk', true);
            player.setFlipX(false);
        } else {
            player.setVelocityX(0);
            player.anims.stop();
            player.setTexture('player');
        }
        
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-550);
        }
    } else {
        player.setVelocityX(0);
        player.setVelocityY(0);
    }

    // Actualizar posición del diálogo si está visible
    if (dialogText && dialogText.text !== '') {
        showDialog(dialogText.text);
    }

    // Lógica de movimiento de enemigos
    if (enemies && enemies.children) {
        enemies.children.entries.forEach(enemy => {
            if (!enemy || !enemy.body) return; // Verificar que el enemigo y su cuerpo existen

            // Mantener velocidad constante según dirección actual
            if (enemy.direction === 1) {
                enemy.setVelocityX(currentLevel === 1 ? 50 : 75);
            } else {
                enemy.setVelocityX(currentLevel === 1 ? -50 : -75);
            }
            
            // Verificar límites de plataforma y cambiar dirección
            if (enemy.x <= enemy.platformLimits.left && enemy.direction === -1) {
                enemy.direction = 1;
                enemy.setFlipX(false);
            } else if (enemy.x >= enemy.platformLimits.right && enemy.direction === 1) {
                enemy.direction = -1;
                enemy.setFlipX(true);
            }
        });
    }
    
    // Eliminar bombas que salen de la pantalla
    if (bombs && bombs.children) {
        const worldWidth = currentLevel === 3 ? 1200 : 800;
        const worldHeight = currentLevel === 3 ? 800 : 600;
        
        bombs.children.entries.forEach(bomb => {
            if (bomb.y > worldHeight + 50 || bomb.x < -50 || bomb.x > worldWidth + 50) {
                bomb.destroy();
            }
        });
    }
}

// *** NUEVAS FUNCIONES PARA TESTING ***
function goToLevel(level) {
    currentLevel = level;
    
    // Posiciones iniciales según el nivel
    const startPositions = {
        1: { x: 100, y: 450 },
        2: { x: 100, y: 520 },
        3: { x: 100, y: 600 }
    };
    
    const startPos = startPositions[level];
    player.setPosition(startPos.x, startPos.y);
    player.setVelocity(0, 0);
    
    createLevel.call(this, level);
    scoreText.setText(`Anillos: 0/4 - Nivel: ${level}`);
    
    if (TESTING_CONFIG.showDebugInfo) {
        console.log(`Cambiado a nivel ${level}`);
    }
}

function resetCurrentLevel() {
    ringCount = 0;
    
    const startPositions = {
        1: { x: 100, y: 450 },
        2: { x: 100, y: 520 },
        3: { x: 100, y: 600 }
    };
    
    const startPos = startPositions[currentLevel];
    player.setPosition(startPos.x, startPos.y);
    player.setVelocity(0, 0);
    
    createLevel.call(this, currentLevel);
    scoreText.setText(`Anillos: 0/4 - Nivel: ${currentLevel}`);
    
    if (TESTING_CONFIG.showDebugInfo) {
        console.log(`Nivel ${currentLevel} reseteado`);
    }
}

// Función para recoger anillos (modificada)
function collectRing(player, ring) {
    ring.disableBody(true, true);
    ringCount++;
    
    // Reproducir sonido de anillo
    this.sound.play('anilloSound', { volume: 1.0 });
    
    scoreText.setText(`Anillos: ${ringCount}/4 - Nivel: ${currentLevel}`);

    if (TESTING_CONFIG.showDebugInfo) {
        console.log(`Anillo recogido! Total: ${ringCount}/4`);
    }

    if (ringCount === 4) {
        if (currentLevel === 1) {
            currentLevel = 2;
            scoreText.setText('¡Nivel 2! Más difícil...');
            this.time.delayedCall(500, () => {
                player.setPosition(100, 520);
                player.setVelocity(0, 0);
                createLevel.call(this, currentLevel);
                scoreText.setText(`Anillos: 0/4 - Nivel: ${currentLevel}`);
            });
        } else if (currentLevel === 2) {
            currentLevel = 3;
            scoreText.setText('¡Nivel 3! ¡EXTREMO!');
            this.time.delayedCall(500, () => {
                player.setPosition(100, 600);
                player.setVelocity(0, 0);
                createLevel.call(this, currentLevel);
                scoreText.setText(`Anillos: 0/4 - Nivel: ${currentLevel}`);
            });
        } else if (currentLevel === 3) {
            scoreText.setText('¡INCREÍBLE! ¡Preparando nivel final!');
            this.time.delayedCall(1000, () => {
                loadFinalLevelScript.call(this);
            });
        }
    }
}

// Función para cargar el script del nivel final
function loadFinalLevelScript() {
    scoreText.setText('¡Preparando nivel final!');
    
    // Detener la música de fondo al pasar al nivel final
    if (this.bgMusic && this.bgMusic.isPlaying) {
        this.bgMusic.stop();
    }

    // Verificar si el script ya está cargado para evitar duplicados
    if (document.querySelector('script[src="src/finalLevel.js"]')) {
        startFinalLevel(this, player);
        return;
    }

    // Cargar el script del nivel final
    const script = document.createElement('script');
    script.src = 'src/finalLevel.js';
    script.onload = () => {
        this.scene.start('FinalLevel');
    };
    script.onerror = () => {
        console.error('Error al cargar el nivel final');
        scoreText.setText('Error al cargar el nivel final');
    };
    document.body.appendChild(script);
}

// Función de debug mejorada (ahora con teletransportación)
function hitEnemy(player, enemy) {
    if (TESTING_CONFIG.showDebugInfo) {
        console.log(`Golpeado por enemigo en nivel ${currentLevel}`);
    }
    
    // Reproducir sonido de perder
    this.sound.play('perderAnillos', { volume: 1.0 });
    
    // Teletransportar al jugador a la posición de inicio del nivel
    if (currentLevel === 1) {
        player.setPosition(100, 450);
    } else if (currentLevel === 2) {
        player.setPosition(100, 520);
    } else if (currentLevel === 3) {
        player.setPosition(100, 600);
    }
    player.setVelocity(0, 0);
}

function hitBomb(player, bomb) {
    if (TESTING_CONFIG.showDebugInfo) {
        console.log(`Golpeado por bomba en nivel ${currentLevel}`);
    }
    
    // Reproducir sonido de perder
    this.sound.play('perderAnillos', { volume: 1.0 });
    
    bomb.destroy();
    // Teletransportar al jugador a la posición de inicio del nivel
    if (currentLevel === 1) {
        player.setPosition(100, 450);
    } else if (currentLevel === 2) {
        player.setPosition(100, 520);
    } else if (currentLevel === 3) {
        player.setPosition(100, 600);
    }
    player.setVelocity(0, 0);
}

// Función para crear advertencia antes de la bomba
function createWarning() {
    const maxX = currentLevel === 3 ? 1150 : 750; // Ajustar rango según el nivel
    const x = Phaser.Math.Between(50, maxX);
    
    const worldHeight = currentLevel === 3 ? 800 : 600;
    const warningBar = this.add.rectangle(x, worldHeight / 2, 20, worldHeight, 0xff0000, 0.6);
    warningBars.add(warningBar);
    
    // Hacer que la barra parpadee
    this.tweens.add({
        targets: warningBar,
        alpha: 0.2,
        duration: 200,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
            // Después del parpadeo, crear la bomba y eliminar la barra
            createBombAt(x);
            warningBar.destroy();
        }
    });
}

// Función para crear bomba en posición específica
function createBombAt(x) {
    const bomb = bombs.create(x, -50, 'bomb');
    bomb.setScale(0.1);
    bomb.setVelocityY(150);
    bomb.body.setSize(bomb.width * 0.5, bomb.height * 0.5, true);
}

// Inicializar el juego
const game = new Phaser.Game(config);

function showDialog(text) {
    if (!dialogText || !dialogBubble || !player) return;
    
    dialogText.setText(text);
    dialogBubble.clear();
    
    const padding = 10;
    const width = dialogText.width + padding * 2;
    const height = dialogText.height + padding * 2;
    const x = player.x - width/2;
    const y = player.y - height - 60;
    
    dialogBubble.lineStyle(2, 0x000000, 1);
    dialogBubble.fillStyle(0xffffff, 1);
    
    dialogBubble.fillRoundedRect(x, y, width, height, 10);
    dialogBubble.strokeRoundedRect(x, y, width, height, 10);
    
    dialogBubble.beginPath();
    dialogBubble.moveTo(player.x - 10, y + height);
    dialogBubble.lineTo(player.x, y + height + 15);
    dialogBubble.lineTo(player.x + 10, y + height);
    dialogBubble.closePath();
    dialogBubble.fillPath();
    dialogBubble.strokePath();
    
    dialogText.setPosition(player.x, y + height/2);
}




