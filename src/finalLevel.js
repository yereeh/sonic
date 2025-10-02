class FinalLevel extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalLevel' });
        this.canMove = false; // Variable para controlar si Sonic puede moverse
        this.robotAppeared = false;
        this.isRestarting = false; // <--- Añadido
        this.maxProjectiles = 3; // Número máximo de proyectiles permitidos
        this.projectilesGroup = null; // Grupo para controlar proyectiles
    }

    preload() {
        // Cargar recursos existentes
        this.load.image('fondo', 'assets/fondo.png');
        this.load.image('ground', 'assets/plataforma.png');
        
        // Nuevo sprite idle de sonicpastel
        this.load.image('sonic-idle', 'assets/sonicpastel.png');
        this.load.image('sonic-run1', 'assets/Caminar/corre1.png');
        this.load.image('sonic-run2', 'assets/Caminar/corre2.png');
        this.load.image('sonic-run3', 'assets/Caminar/corre3.png');
        this.load.image('sonic-run4', 'assets/Caminar/corre4.png');
        this.load.image('robot', 'assets/Enemigos/botegg.png');
        this.load.image('sonic-normal', 'assets/Idle/idle.png'); // Cargar sprite normal de Sonic

        // Cargar sprites de transformación
        for(let i = 1; i <= 8; i++) {
            this.load.image(`transform${i}`, `assets/Transformacion/fase${i}.png`);
        }
        // Cargar sprite de vuelo
        this.load.image('sonic-fly', 'assets/idlevolar/volar1.png');
        this.load.image('fondocielo', 'assets/fondocielo.png');

        // Cargar nuevos sprites para el vuelo
        this.load.image('idle1', 'assets/idlevolar/idle1.png');
        this.load.image('idle2', 'assets/idlevolar/idle2.png');
        this.load.image('volar1', 'assets/idlevolar/volar1.png');
        this.load.image('volar2', 'assets/idlevolar/volar2.png');
        this.load.image('bolita', 'assets/idlevolar/bolita.png');
        this.load.image('bomb', 'assets/Enemigos/bomb.png');
        this.load.audio('laser', 'assets/laserp.mp3');  // Corregido nombre del archivo

        // Cargar sprites de anillos y su animación
        this.load.image('ring1', 'assets/anillo/anillo1.png');
        this.load.image('ring2', 'assets/anillo/anillo2.png');
        this.load.image('ring3', 'assets/anillo/anillo3.png');
        this.load.image('ring4', 'assets/anillo/anillo4.png');
        this.load.image('ataque', 'assets/ataque.png'); // <--- Añadir carga del sprite de ataque

        // Cargar sonidos
        this.load.audio('anilloSound', 'assets/anillos.mp3');
        this.load.audio('perderAnillos', 'assets/perderanillos.mp3');
        this.load.audio('risaEggman', 'assets/risaegman.mp3');
        this.load.audio('greenHill', 'assets/niveles.mp3');
        this.load.audio('themeEggman', 'assets/themeegman.mp3');
        this.load.audio('ataqueSound', 'assets/ataque.wav');
        
        this.load.audio('musicafinal', 'assets/musicafinal.mp3');
        this.load.image('explosion1', 'assets/explosion1.png');
        this.load.audio('explosion', 'assets/explosion.mp3');
        this.load.image('sonic-frente-super', 'assets/sonicfrentepastelsuuper.png');
        this.load.image('sonic-frente', 'assets/sonicfrentepastel.png');
        this.load.audio('musicaend', 'assets/musicaend.mp3');
        this.load.audio('creditos', 'assets/creditos.mp3');
        this.load.image('sonic-super-side', 'assets/supercostado.png');
        this.load.image('sonic-super-front-side', 'assets/supercostadofrente.png');
        this.load.image('salto1', 'assets/salto1.png');
        this.load.image('salto2', 'assets/salto2.png');
        this.load.audio('proyectiles', 'assets/proyectiles.mp3');
        this.load.audio('alerta', 'assets/alerta.wav');
    }

    create() {
        // Iniciar música de Green Hill
        this.currentMusic = this.sound.add('greenHill', { loop: true });
        this.currentMusic.play();
        
        this.isRestarting = false; // <--- Limpiar bandera al crear la escena
        // Variables del juego
        this.player = null;
        this.platforms = null;
        this.cursors = null;

        // Crear fondo
        this.add.image(400, 300, 'fondo');

        // Crear plataformas
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 583, 'ground').setScale(1.2, 0.1).refreshBody();
       

        // Crear Sonic inmóvil inicialmente (cambiando posición)
        this.player = this.physics.add.sprite(400, 530, 'sonic-idle'); // Centrado en pantalla
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.15); // Más pequeño (antes era 0.2)
        this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7, true); // Hitbox más pequeña
        this.player.body.setAllowGravity(false); // Desactivar gravedad inicialmente

        // Crear robot (inicialmente invisible)
        this.robot = this.physics.add.sprite(600, -200, 'robot');
        this.robot.setScale(0.8);
        this.robot.setVisible(false);
        this.robot.body.setAllowGravity(false);
        this.robot.body.enable = false; // Desactivar física completamente desde el inicio
    
        // Animaciones de Sonic
        this.anims.create({
            key: 'sonic-run',
            frames: [
                { key: 'sonic-run1' },
                { key: 'sonic-run2' },
                { key: 'sonic-run3' },
                { key: 'sonic-run4' }
            ],
            frameRate: 10,
            repeat: -1
        });

        // Colisiones
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.robot, this.platforms); // Añadir colisión del robot

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Añadir texto de introducción
        this.introText = this.add.text(400, 200, '¡Por fin Sonic consiguió el pastel!', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Nueva secuencia de eventos
        this.time.delayedCall(2000, () => {
            this.showRobot();
        }, [], this);

        // Añadir tecla ENTER para saltar intro
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.lastDirection = { x: 1, y: 0 }; // Por defecto a la derecha
    }

    showRobot() {
        // Cambiar música a tema de Eggman
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = this.sound.add('themeEggman', { loop: true });
            this.currentMusic.play();
        }

        // Reproducir risa de Eggman (asegúrate de que el volumen no sea muy bajo)
        this.sound.play('risaEggman', { volume: 1.5 });

        // Hacer aparecer al robot
        this.robot.setVisible(true);
        this.introText.setText('¡Dr. Eggman apareció!');
        
        this.tweens.add({
            targets: this.robot,
            y: 350,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                // Activar física solo para el choque
                this.robot.body.enable = true;
                this.robot.body.setAllowGravity(true);
                this.time.delayedCall(800, () => {
                    // Desactivar física antes de volar
                    this.robot.body.enable = false;
                    this.robot.body.setAllowGravity(false);
                    this.robotStealsPastel();
                });
            }
        });
    }

    robotStealsPastel() {
        this.introText.setText('¡Oh no! ¡Se está robando el pastel!');
        
        // Asegurar que no hay física en absoluto
        this.robot.body.enable = false;
        this.robot.body.setAllowGravity(false);
        
        // Cambiar Sonic a su forma normal (sin pastel)
        this.player.setTexture('sonic-normal');
        this.player.setScale(0.13); // Mantener escala consistente
        
        this.tweens.add({
            targets: this.robot,
            y: -200,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => {
                this.robot.destroy();
                this.startTransformation();
            }
        });
    }

    startTransformation() {
        this.player.setCollideWorldBounds(false);
        this.introText.setText('¡Sonic se está transformando!');
        
        let frame = 1;
        this.transformTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                this.player.setTexture(`transform${frame}`);
                this.player.setScale(0.18); // Añade esta línea para hacer los sprites más grandes
                frame++;
                if (frame > 8) {
                    this.transformTimer.remove();
                    this.introText.setText('¡A por Eggman! ¡Recuperemos el pastel!');
                    this.time.delayedCall(300, () => {
                        this.sonicFliesUp();
                    });
                }
            },
            repeat: 7
        });
    }

    sonicFliesUp() {
        this.player.setTexture('sonic-fly');
        this.player.setAngle(-90);
        this.player.setScale(0.18);
        
        this.tweens.add({
            targets: this.player,
            y: -200,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => {
                this.createWhiteTransition();
            }
        });
    }

    createWhiteTransition() {
        this.player.setDepth(1);
        this.platforms.setDepth(1);
        // Destruir el texto inmediatamente antes del destello
        if (this.introText) {
            this.introText.destroy();
            this.introText = null;
        }

        const whiteScreen = this.add.rectangle(400, 300, 800, 600, 0xffffff);
        whiteScreen.setDepth(999);
        whiteScreen.setAlpha(0);
        whiteScreen.setOrigin(0.5, 0.5);
        
        this.tweens.add({
            targets: whiteScreen,
            alpha: 1,
            duration: 600,
            onComplete: () => {
                this.platforms.clear(true, true);

                const skyBg = this.add.image(400, 300, 'fondocielo');
                skyBg.setScale(3.5);
                skyBg.setDepth(0);

                // Crear el nuevo Sonic y Eggman aquí
                this.player = this.physics.add.sprite(200, 300, 'idle1');
                this.player.setScale(0.2);
                this.player.setCollideWorldBounds(true);
                this.player.body.setAllowGravity(false);
                this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 400, 600));

                this.robot = this.physics.add.sprite(600, 300, 'robot');
                this.robot.setScale(0.8);
                this.robot.body.setAllowGravity(false);
                this.robot.health = 100;

                // Iniciar animación de vuelo del robot
                this.startRobotFlyTween();

                // Animación de vuelo: baja un poco y sube, repitiendo
                const originalY = this.robot.y;
                this.tweens.add({
                    targets: this.robot,
                    y: originalY + 30,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                this.tweens.add({
                    targets: whiteScreen,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => {
                        whiteScreen.destroy();
                        this.finishSetup();
                    }
                });
            }
        });
    }

    // Nueva función para terminar la configuración
    finishSetup() {
        if (this.introText) this.introText.destroy();
        
        // Detener theme de Eggman
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }

        // Agregar timer para risa aleatoria de Eggman durante la batalla
        if (this.eggmanLaughTimer) this.eggmanLaughTimer.remove();
        this.eggmanLaughTimer = this.time.addEvent({
            delay: 8000, // Cada 8 segundos intenta reír
            callback: this.tryEggmanLaugh,
            callbackScope: this,
            loop: true
        });

        // Crear animaciones SOLO si no existen
        if (!this.anims.exists('float')) {
            this.anims.create({
                key: 'float',
                frames: [
                    { key: 'idle1' },
                    { key: 'idle2' }
                ],
                frameRate: 4,
                repeat: -1
            });
            // Asegurar hitbox correcta para float
            if (this.player) {
                this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
            }
        }

        if (!this.anims.exists('flying')) {
            this.anims.create({
                key: 'flying',
                frames: [
                    { key: 'volar1' },
                    { key: 'volar2' }
                ],
                frameRate: 8,
                repeat: -1
            });
            // Asegurar hitbox correcta para flying
            if (this.player) {
                this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
            }
        }

        if (!this.anims.exists('ringRotate')) {
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
        }

        this.bombsGroup = this.physics.add.group();
        this.smallBombsGroup = this.physics.add.group({
            collideWorldBounds: false,
            allowGravity: false,
            runChildUpdate: false
        });

        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X); // <--- Tecla X
        this.isBall = false;
        this.canMove = true;
        this.attackInProgress = false;

        // Lista completa de ataques de Eggman (sin el antiguo de bombas pequeñas)
        this.eggmanAttacks = [
            this.startSectionedBombAttack,
            this.startGasterBlasterAttack,
            this.startLaserAttack,
            this.startCircularGasterBlasterAttack,
            this.startHorizontalLaserAttack,
            this.startDashAttack,
            this.startSafeZoneBombardment,
            this.startFloweyBombAttack,
            this.newSmallBombsAttack  // El nuevo ataque de bombas pequeñas
        ];

        this.attackTimer = this.time.addEvent({
            delay: 2000,  // Reducido a 2 segundos entre ataques
            callback: this.tryRandomEggmanAttack,
            callbackScope: this,
            loop: true
        });

        // Vida de Eggman
        this.robot.health = 10000;

        // Texto de vida de Eggman
        if (this.eggmanHealthText) this.eggmanHealthText.destroy();
        this.eggmanHealthText = this.add.text(600, 16, `Eggman: ${this.robot.health}`, {
            fontSize: '28px',
            fill: '#f44',
            stroke: '#000',
            strokeThickness: 4
        }).setScrollFactor(0);

        // Inicializar contadores de anillos
        this.playerRings = 3;
        this.ringsGroup = this.physics.add.group();
        this.createInitialRings();

        // Mostrar texto de anillos
        if (this.ringsText) this.ringsText.destroy();
        this.ringsText = this.add.text(16, 16, `Anillos: ${this.playerRings}`, {
            fontSize: '28px',
            fill: '#ff0',
            stroke: '#000',
            strokeThickness: 4
        }).setScrollFactor(0);

        // Colisión para recoger anillos
        this.physics.add.overlap(this.player, this.ringsGroup, this.collectRing, null, this);

        // --- NUEVO: Temporizador para spawnear anillos cada 4 segundos ---
        if (this.ringsSpawnTimer) this.ringsSpawnTimer.remove();
        this.ringsSpawnTimer = this.time.addEvent({
            delay: 4000,
            callback: () => {
                this.createInitialRings();
            },
            callbackScope: this,
            loop: true
        });

        // Iniciar música de batalla si no está sonando
        if (!this.battleMusic) {
            this.battleMusic = this.sound.add('musicafinal', { loop: true, volume: 0.7 });
            this.battleMusic.play();
        }

        // Mostrar indicadores de controles
        this.showControlIndicators();
    }

    showControlIndicators() {
    const indicatorStyle = {
        fontSize: '24px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 10, y: 5 }
    };

    // Indicador para tecla X (atacar)
    this.xIndicator = this.add.text(16, 100, 'X - Atacar', indicatorStyle)
        .setScrollFactor(0)
        .setDepth(1000);

    // Indicador para tecla C (modo bolita)
    this.cIndicator = this.add.text(16, 140, 'C - Modo Bolita', indicatorStyle)
        .setScrollFactor(0)
        .setDepth(1000);

    // Indicador para flechas (movimiento)
    this.moveIndicator = this.add.text(16, 180, '← ↑ ↓ → - Mover', indicatorStyle)
        .setScrollFactor(0)
        .setDepth(1000);

    // ⚠️ Mensaje de advertencia
    this.warningIndicator = this.add.text(16, 220, '⚠ Si Sonic es atacado sin rings, muere', {
        fontSize: '22px',
        fill: '#ff5555',
        stroke: '#000000',
        strokeThickness: 4,
        backgroundColor: 'rgba(50, 0, 0, 0.7)',
        padding: { x: 10, y: 5 }
    })
    .setScrollFactor(0)
    .setDepth(1000);

    // Hacer que parpadeen inicialmente para llamar la atención
    [this.xIndicator, this.cIndicator, this.moveIndicator, this.warningIndicator].forEach(indicator => {
        this.tweens.add({
            targets: indicator,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: 4,
            ease: 'Sine.easeInOut'
        });
    });

    // Desaparecer después de 8 segundos
    this.time.delayedCall(8000, () => {
        [this.xIndicator, this.cIndicator, this.moveIndicator, this.warningIndicator].forEach(indicator => {
            if (indicator && indicator.active) {
                this.tweens.add({
                    targets: indicator,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => {
                        indicator.destroy();
                    }
                });
            }
        });
    });
}

    // Crear los 3 anillos iniciales en fila vertical, moviéndose solo a la izquierda
    createInitialRings() {
        // Solo crear una fila si no hay ninguna fila activa
        const filaActiva = this.ringsGroup.getChildren().some(ring => ring.getData('fila'));
        if (filaActiva) return;

        const yBase = Phaser.Math.Between(120, 420);
        const spacing = 60;
        let ringsLeft = 3;

        for (let i = 0; i < 3; i++) {
            const y = yBase + (i - 1) * spacing;
            const ring = this.ringsGroup.create(800, y, 'ring1');
            ring.setScale(0.08);
            ring.body.setAllowGravity(false);
            ring.setVelocityX(-60);
            ring.setVelocityY(0);
            ring.setData('isFlying', false);
            ring.setData('fila', true); // Marcar como anillo de fila
            ring.anims.play('ringRotate');

            // Detectar cuando el anillo sale por la izquierda
            ring.update = () => {
                if (ring.active && ring.getData('fila') && ring.x < -20) {
                    ring.destroy();
                    ringsLeft--;
                    // Ya no se respawnea aquí, solo el temporizador genera nuevas filas
                }
            };
        }
    }

    // Recoger anillo
    collectRing(player, ring) {
        // Solo recoger si no es invulnerable (para los anillos soltados por daño)
        if (ring.getData('invulnerable')) return;
        this.sound.play('anilloSound', { volume: 1.0 });  // Agregar sonido
        this.playerRings++; // Siempre aumenta el contador al recoger cualquier anillo
        ring.destroy();
        this.updateRingsText();
    }

    // Actualizar texto de anillos
    updateRingsText() {
        if (this.ringsText) {
            this.ringsText.setText(`Anillos: ${this.playerRings}`);
        }
    }

    // Lógica de daño al jugador (llamar esto en todos los ataques)
    onPlayerHit() {
        if (!this.player || !this.player.body) return;
        if (this.player.invulnerable || this.isRestarting) return;

        if (this.playerRings > 0) {
            this.sound.play('perderAnillos', { volume: 1.0 });

            // --- Suelta de anillos al estilo clásico ---
            let ringsToDrop = Math.min(this.playerRings, 20); // Máximo 20 anillos
            this.playerRings -= ringsToDrop;
            this.updateRingsText();

            // Ángulos distribuidos en círculo
            for (let i = 0; i < ringsToDrop; i++) {
                const angle = Phaser.Math.DegToRad((360 / ringsToDrop) * i + Phaser.Math.Between(-10, 10));
                const speed = Phaser.Math.Between(220, 320);
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed - 80;

                const ring = this.ringsGroup.create(this.player.x, this.player.y, 'ring1');
                ring.setScale(0.09);
                ring.body.setAllowGravity(true);
                ring.body.setBounce(0.7);
                ring.body.setCollideWorldBounds(true);
                ring.body.onWorldBounds = true;
                ring.setVelocity(vx, vy);
                ring.setData('invulnerable', true);
                ring.setData('fila', false); // No es anillo de fila
                ring.anims.play('ringRotate');

                // Hacer que reboten un rato y luego desaparezcan
                this.time.delayedCall(800, () => {
                    ring.setData('invulnerable', false);
                });
                this.time.delayedCall(2500, () => {
                    if (ring && ring.active) ring.destroy();
                });
            }

            // Activar invulnerabilidad temporal
            this.player.invulnerable = true;
            let blinkTimes = 0;
            const blinkInterval = this.time.addEvent({
                delay: 100,
                repeat: 11,
                callback: () => {
                    this.player.visible = !this.player.visible;
                    blinkTimes++;
                    if (blinkTimes > 11) {
                        this.player.visible = true;
                        this.player.invulnerable = false;
                        blinkInterval.remove();
                    }
                }
            });
        } else {
            this.isRestarting = true;

            // --- Limpiar todos los ataques y proyectiles activos ---
            if (this.attackTimer) this.attackTimer.remove();
            if (this.ringsSpawnTimer) this.ringsSpawnTimer.remove();
            if (this.eggmanLaughTimer) this.eggmanLaughTimer.remove();
            if (this.ringsGroup) this.ringsGroup.clear(true, true);
            if (this.bombsGroup) this.bombsGroup.clear(true, true);
            if (this.smallBombsGroup) this.smallBombsGroup.clear(true, true);
            if (this.projectilesGroup) this.projectilesGroup.clear(true, true);

            // Limpiar cualquier otro ataque visual (láseres, etc)
            this.children.list.forEach(obj => {
                // Destruir gráficos de líneas y rectángulos (láseres, advertencias, etc)
                if (
                    obj.texture?.key === undefined &&
                    (
                        obj.fillColor === 0xffffff ||
                        obj.fillColor === 0xff0000 ||
                        obj.lineColor === 0xff0000 ||
                        obj.lineColor === 0xffffff
                    )
                ) {
                    obj.destroy();
                }
                // Destruir gráficos tipo Phaser.GameObjects.Graphics (usados por Gaster Blaster)
                if (obj instanceof Phaser.GameObjects.Graphics) {
                    obj.destroy();
                }
            });

            // --- Limpiar timers de Gaster Blaster (si hay alguno activo) ---
            if (this._gasterBlasterTimers) {
                this._gasterBlasterTimers.forEach(timer => timer.remove());
                this._gasterBlasterTimers = [];
            }

            if (this.battleMusic) {
                this.battleMusic.stop();
                this.battleMusic = null;
            }

            // Reiniciar automáticamente después de 1 segundo
            this.time.delayedCall(1000, () => {
                // Reiniciar música
                this.battleMusic = this.sound.add('musicafinal', { loop: true, volume: 0.7 });
                this.battleMusic.play();

                // Reiniciar posiciones y estados
                this.player.setPosition(200, 300);
                this.player.setTexture('sonic-normal');
                this.player.setScale(0.2);
                this.player.setVelocity(0, 0);
                this.player.body.setAllowGravity(false);
                this.player.invulnerable = false;
                this.player.visible = true;
                this.player.body.enable = true;
                this.player.body.checkCollision.none = false;
                this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
                this.playerRings = 3;

                this.robot.setPosition(600, 300);
                this.robot.health = 10000;
                this.robot.clearTint();
                this.robot.setAlpha(1);
                this.robot.body.enable = true;

                this.isRestarting = false;
                this.canMove = true;
                this.attackInProgress = false;
                this.laserActive = false;

                // --- Limpiar cualquier ataque visual remanente ---
                this.children.list.forEach(obj => {
                    if (
                        obj.texture?.key === undefined &&
                        (obj.fillColor === 0xffffff || obj.fillColor === 0xff0000)
                    ) {
                        obj.destroy();
                    }
                });

                this.finishSetup();
                this.player.anims.play('float', true);
            });
        }
    }

    tryRandomEggmanAttack() {
        if (!this.attackInProgress) {
            console.log('-------------------');
            console.log('Intentando nuevo ataque aleatorio');
            this.randomEggmanAttack();
        } else {
            console.log('Ataque anterior aún en progreso');
        }
    }

    randomEggmanAttack() {
        // Filtrar ataques válidos
        const validAttacks = this.eggmanAttacks.filter(attack => typeof attack === 'function');
        if (validAttacks.length === 0) {
            console.warn('No hay ataques válidos en la lista de Eggman.');
            return;
        }

        // Seleccionar un ataque aleatorio y ejecutarlo
        const attack = Phaser.Utils.Array.GetRandom(validAttacks);
        attack.call(this);
    }

    // Ataque de bombas (sprite más pequeño)
    startBombAttack() {
        // No lanzar más bombas si ya hay bombas activas
        if (this.bombsGroup.countActive(true) > 0 || this.attackInProgress) return;
        console.log('Iniciando ataque: Bombas');
        this.attackInProgress = true;

        // Sonido de alerta SOLO si no está ya sonando
        if (!this._alertaSound) {
            this._alertaSound = this.sound.add('alerta', { loop: true, volume: 1 });
            this._alertaSound.play();
        }

        let warnings = 0;
        // Crear 3 indicadores de advertencia en posiciones aleatorias
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(50, 350); // Solo en la mitad izquierda

            // Indicador tipo barra roja vertical (como en los niveles anteriores)
            const warningBar = this.add.rectangle(x, 300, 20, 600, 0xff0000, 0.6);

            this.tweens.add({
                targets: warningBar,
                alpha: 0.2,
                duration: 200,
                yoyo: true,
                repeat: 4,
                onComplete: () => {
                    warningBar.destroy();
                    // Parar alerta y sonar proyectiles solo en el primer warning que termina
                    if (this._alertaSound && this._alertaSound.isPlaying) {
                        this._alertaSound.stop();
                        this._alertaSound.destroy();
                        this._alertaSound = null;
                    }
                    // Sonar proyectiles cuando caen las bombas
                    this.sound.play('proyectiles', { volume: 1 });
                    this.dropBomb(x);
                    warnings++;
                    if (warnings === 3) {
                        // Esperar a que todas las bombas caigan y desaparezcan
                        this.time.delayedCall(3500, () => {
                            this.attackInProgress = false;
                        });
                    }
                }
            });
        }
    }

    dropBomb(x) {
        const bomb = this.bombsGroup.create(x, -50, 'bomb');
        bomb.setScale(0.18); // Más pequeño aún
        bomb.body.setGravityY(300);

        // Colisión con el jugador
        this.physics.add.overlap(bomb, this.player, this.onBombHit, null, this);

        // Destruir la bomba cuando sale de la pantalla
        bomb.outOfBoundsKill = true;
        bomb.checkWorldBounds = true;

        this.time.delayedCall(3000, () => {
            if (bomb && bomb.active) {
                bomb.destroy();
            }
        });
    }

    onBombHit(bomb, player) {
        bomb.destroy();
        this.onPlayerHit(); // Agregar el daño al jugador
    }

    // Nuevo ataque: bombas pequeñas desde la derecha
    startSmallBombsAttack() {
        // No lanzar si ya hay bombas pequeñas activas
        if (this.smallBombsGroup.countActive(true) > 0 || this.attackInProgress) return;
        console.log('Iniciando ataque: Bombas pequeñas');
        this.attackInProgress = true;

        // Sonido de alerta SOLO si no está ya sonando
        if (!this._alertaSound) {
            this._alertaSound = this.sound.add('alerta', { loop: true, volume: 1 });
            this._alertaSound.play();
        }

        const totalBombs = 16;
        const yStep = 440 / (totalBombs - 1);
        let firstBomb = true;
        for (let i = 0; i < totalBombs; i++) {
            const y = 80 + i * yStep + Phaser.Math.Between(-8, 8); // Espaciado vertical
            const x = Phaser.Math.Between(700, 900); // Dispersión en X
            this.time.delayedCall(i * 120, () => {
                // Parar alerta y sonar proyectiles solo en la primera bomba lanzada
                if (firstBomb && this._alertaSound && this._alertaSound.isPlaying) {
                    this._alertaSound.stop();
                    this._alertaSound.destroy();
                    this._alertaSound = null;
                    this.sound.play('proyectiles', { volume: 1 });
                    firstBomb = false;
                }
                this.launchSmallBomb(x, y);
                if (i === totalBombs - 1) {
                    // Esperar a que todas las bombas salgan de pantalla
                    this.time.delayedCall(9500, () => {
                        this.attackInProgress = false;
                    });
                }
            });
        }
    }

    launchSmallBomb(x, y) {
        const smallBomb = this.smallBombsGroup.create(x, y, 'bomb');
        smallBomb.setScale(0.09);
        smallBomb.body.setAllowGravity(false);
        smallBomb.setVelocityX(-90);

        // Desactivar colisión entre bombas pequeñas entre sí, pero NO con el jugador
        smallBomb.body.checkCollision.none = false;
        smallBomb.body.checkCollision.up = false;
        smallBomb.body.checkCollision.down = false;
        smallBomb.body.checkCollision.left = false;
        smallBomb.body.checkCollision.right = false;

        // Solo colisión con el jugador (usar overlap solo una vez por bomba)
        if (!smallBomb.hasOverlap) {
            this.physics.add.overlap(this.player, smallBomb, this.onSmallBombHit, null, this);
            smallBomb.hasOverlap = true;
        }

        // Destruir cuando sale de pantalla por la izquierda
        this.time.delayedCall(9000, () => {
            if (smallBomb && smallBomb.active) smallBomb.destroy();
        });
    }

    onSmallBombHit(bomb, player) {
        bomb.disableBody(true, true); // Desactivar y destruir la bomba
        this.onPlayerHit(); // Aplicar daño a Sonic

        // Restablecer el movimiento de Sonic
        this.canMove = true;
        if (this.player && this.player.body) {
            this.player.body.enable = true; // Asegurar que el cuerpo de Sonic está habilitado
            this.player.setVelocity(0, 0); // Detener cualquier movimiento residual
        }

        console.log('¡Golpeado por bomba pequeña!');
    }

    // Nuevo ataque: rayos que caen desde arriba consecutivamente de izquierda a derecha
    startLaserAttack() {
        if (this.laserActive || this.attackInProgress) return;
        console.log('Iniciando ataque: Láser vertical');
        this.laserActive = true;
        this.attackInProgress = true;

        // Sonido de alerta SOLO si no está ya sonando
        if (!this._alertaSound) {
            this._alertaSound = this.sound.add('alerta', { loop: true, volume: 1 });
            this._alertaSound.play();
        }

        const totalRays = 8;
        const xStart = 60;
        const xEnd = 380;
        const xStep = (xEnd - xStart) / (totalRays - 1);
        let raysCompleted = 0;
        const laserWidth = 32; // Más ancho
        const safeRayIndex = totalRays - 1; // El último rayo es el espacio seguro

        for (let i = 0; i < totalRays; i++) {
            // Saltar el último rayo para dejar espacio seguro a Sonic
            if (i === safeRayIndex) continue;
            const x = xStart + i * xStep;

            this.time.delayedCall(i * 220, () => {
                // Indicador largo (barra roja vertical)
                const warningBar = this.add.rectangle(x, 300, laserWidth + 2, 600, 0xff0000, 0.6);
                this.tweens.add({
                    targets: warningBar,
                    alpha: 0.2,
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        warningBar.destroy();
                        // Parar alerta y sonar láser SOLO en el primer warning que termina
                        if (this._alertaSound && this._alertaSound.isPlaying) {
                            this._alertaSound.stop();
                            this._alertaSound.destroy();
                            this._alertaSound = null;
                        }
                        this.sound.play('laser', { seek: 1 });
                        const laser = this.add.rectangle(x, 300, laserWidth, 600, 0xffffff, 0.85);
                        this.physics.add.existing(laser, true);
                        this.tweens.add({
                            targets: laser,
                            alpha: 1,
                            duration: 80,
                            onComplete: () => {
                                // Usa arrow function para mantener el contexto correcto
                                this.physics.add.overlap(this.player, laser, () => {
                                    if (!this.player.invulnerable && !this.isRestarting) {
                                        this.onPlayerHit();
                                    }
                                    laser.body.enable = false;
                                    laser.setAlpha(0.3);
                                }, null, this);
                                // Fade out después de un tiempo
                                this.time.delayedCall(320, () => {
                                    this.tweens.add({
                                        targets: laser,
                                        alpha: 0,
                                        duration: 120,
                                        onComplete: () => {
                                            if (laser.body) laser.body.enable = false;
                                            laser.destroy();
                                            raysCompleted++;
                                            // Cuando todos los rayos hayan terminado, desbloquear ataques
                                            if (raysCompleted === totalRays - 1) { // -1 porque uno es espacio seguro
                                                this.laserActive = false;
                                                this.attackInProgress = false;
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            });
        }
    }

    // Nuevo ataque: Gaster Blaster (ahora rayos largos, cubren el mapa y son medio transparentes)
    startGasterBlasterAttack() {
        if (this.laserActive || this.attackInProgress) return;
        console.log('Iniciando ataque: Gaster Blaster');
        this.laserActive = true;
        this.attackInProgress = true;

        if (!this._gasterBlasterTimers) this._gasterBlasterTimers = [];
        const timers = [];
        const graphicsList = [];

        const totalRays = 12;
        const delayBetween = 1500;
        let raysFired = 0;

        const fireRay = () => {
            if (!this.player || !this.player.active) return;

            // Sonido de alerta para cada rayo
            if (this._alertaSound && this._alertaSound.isPlaying) {
                this._alertaSound.stop();
                this._alertaSound.destroy();
                this._alertaSound = null;
            }
            this._alertaSound = this.sound.add('alerta', { loop: true, volume: 1 });
            this._alertaSound.play();

            // Apuntar desde un borde hacia Sonic
            const dir = Phaser.Math.Between(0, 3);
            let x1, y1;
            const targetX = this.player.x;
            const targetY = this.player.y;
            switch (dir) {
                case 0: x1 = -200; y1 = Phaser.Math.Between(60, 540); break;
                case 1: x1 = 1000; y1 = Phaser.Math.Between(60, 540); break;
                case 2: x1 = Phaser.Math.Between(60, 740); y1 = -200; break;
                case 3: x1 = Phaser.Math.Between(60, 740); y1 = 800; break;
            }
            const angle = Phaser.Math.Angle.Between(x1, y1, targetX, targetY);
            const x2 = x1 + Math.cos(angle) * 1400;
            const y2 = y1 + Math.sin(angle) * 1400;

            // Crear una sola línea para la advertencia
            const warn = this.add.graphics();
            graphicsList.push(warn);
            warn.lineStyle(16, 0xff0000, 0.8);
            warn.beginPath();
            warn.moveTo(x1, y1);
            warn.lineTo(x2, y2);
            warn.strokePath();

            // Parpadeo optimizado
            let blinks = 0;
            const blinkInterval = this.time.addEvent({
                delay: 120,
                callback: () => {
                    warn.visible = !warn.visible;
                    blinks++;
                    if (blinks >= 10) {
                        blinkInterval.remove();
                        warn.destroy();
                        // Parar alerta y sonar láser para cada rayo
                        if (this._alertaSound && this._alertaSound.isPlaying) {
                            this._alertaSound.stop();
                            this._alertaSound.destroy();
                            this._alertaSound = null;
                        }
                        this.sound.play('laser', { seek: 1 });

                        // Crear una sola línea para el láser (rayo blanco)
                        const laser = this.add.graphics();
                        graphicsList.push(laser);
                        laser.lineStyle(38, 0xffffff, 0.45);
                        laser.beginPath();
                        laser.moveTo(x1, y1);
                        laser.lineTo(x2, y2);
                        laser.strokePath();

                        // --- Colisión matemática directa con el rayo blanco ---
                        let hit = false;
                        const checkHit = () => {
                            if (hit || !this.player.active) return;
                            // Vector del rayo
                            const dx = x2 - x1;
                            const dy = y2 - y1;
                            const len = Math.sqrt(dx * dx + dy * dy);
                            // Vector del jugador respecto al inicio del rayo
                            const px = this.player.x - x1;
                            const py = this.player.y - y1;
                            // Proyección escalar
                            const t = (px * dx + py * dy) / (len * len);
                            if (t >= 0 && t <= 1) {
                                // Punto más cercano en la línea
                                const closestX = x1 + t * dx;
                                const closestY = y1 + t * dy;
                                // Distancia al jugador
                                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, closestX, closestY);
                                if (dist < 38) {
                                    hit = true;
                                    laser.alpha = 0.15;
                                    // Solo hacer daño si no es invulnerable ni reiniciando
                                    if (!this.player.invulnerable && !this.isRestarting) {
                                        this.onPlayerHit();
                                    }
                                }
                            }
                        };

                        // Comprobar colisión varias veces durante la vida del láser
                        const hitCheckTimer = this.time.addEvent({
                            delay: 30,
                            repeat: 12,
                            callback: checkHit,
                            callbackScope: this
                        });
                        timers.push(hitCheckTimer);

                        // Limpiar todo de una vez
                        const destroyTimer = this.time.delayedCall(420, () => {
                            laser.destroy();
                            hitCheckTimer.remove();
                        });
                        timers.push(destroyTimer);
                    }
                },
                loop: true
            });
            timers.push(blinkInterval);

            raysFired++;
            if (raysFired < totalRays) {
                const t = this.time.delayedCall(delayBetween, fireRay);
                timers.push(t);
            } else {
                const t = this.time.delayedCall(900, () => {
                    this.laserActive = false;
                    this.attackInProgress = false;
                });
                timers.push(t);
            }
        };

        fireRay();

        this._gasterBlasterTimers = timers;
        this._gasterBlasterGraphics = graphicsList;
    }

    // Nuevo ataque: Gaster Blaster circular (rayos en 360° desde el centro de la zona de Sonic)
    startCircularGasterBlasterAttack() {
        if (this.laserActive || this.attackInProgress) return;
        console.log('Iniciando ataque: Gaster Blaster Circular');
        this.laserActive = true;
        this.attackInProgress = true;

        // --- Cambios: más rayos, más lento y más anchos ---
        const centerX = 200, centerY = 300;
        const totalRays = 18; // más rayos
        const rayLength = 1200;
        const delayBetween = 160  // Reducido de 180 a 160 para hacerlo más rápido
        let raysFired = 0;

        // Para limpiar todos los objetos creados por el ataque
        const lines = [];

        // Ángulos de 0 a 2*PI (360°)
        const angles = [];
        for (let i = 0; i < totalRays; i++) {
            const angle = (2 * Math.PI * i) / totalRays;
            angles.push(angle);
        }

        const fireRay = (angle) => {
            const x1 = centerX, y1 = centerY;
            const x2 = x1 + Math.cos(angle) * rayLength;
            const y2 = y1 + Math.sin(angle) * rayLength;

            // Parpadeo de advertencia (línea roja, usando simple Line GameObject)
            const warn = this.add.line(0, 0, x1, y1, x2, y2, 0xff0000)
                .setOrigin(0, 0)
                .setLineWidth(12) // más ancho el warning
                .setAlpha(0.7);
            lines.push(warn);

            // Parpadeo: alterna visibilidad varias veces antes de disparar
            let blinkCount = 0;
            const maxBlinks = 2;
            const blinkInterval = 60;
            const blinkTimer = this.time.addEvent({
                delay: blinkInterval,
                repeat: maxBlinks * 2 - 1,
                callback: () => {
                    warn.visible = !warn.visible;
                    blinkCount++;
                }
            });

            // Espera antes de disparar
            this.time.delayedCall(maxBlinks * blinkInterval * 2 + 60, () => {
                warn.destroy();
                // Parar alerta y sonar láser solo en el primer rayo
                if (this._alertaSound && this._alertaSound.isPlaying) {
                    this._alertaSound.stop();
                    this._alertaSound.destroy();
                    this._alertaSound = null;
                }
                this.sound.play('laser', { seek: 1 });

                // Línea blanca como láser (sin hitbox visual, solo lógica)
                const laser = this.add.line(0, 0, x1, y1, x2, y2, 0xffffff)
                    .setOrigin(0, 0)
                    .setLineWidth(32) // más ancho el láser
                    .setAlpha(0.35);
                lines.push(laser);

                // Hitbox lógica: solo comprobar si el jugador está cerca de la línea
                // (no se usa física, solo comprobación matemática)
                let hit = false;
                const checkHit = () => {
                    if (hit) return;
                    // Vector de la línea
                    const dx = x2 - x1;
                    const dy = y2 - x1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    // Vector del jugador respecto al inicio de la línea
                    const px = this.player.x - x1;
                    const py = this.player.y - y1;
                    // Proyección escalar
                    const t = (px * dx + py * dy) / (len * len);
                    if (t >= 0 && t <= 1) {
                        // Punto más cercano en la línea
                        const closestX = x1 + t * dx;
                        const closestY = y1 + t * dy;
                        // Distancia al jugador
                        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, closestX, closestY);
                        if (dist < 48) { // aumentar tolerancia por el ancho
                            hit = true;
                            laser.destroy();
                            this.onPlayerHit();
                        }
                    }
                };

                // Comprobar colisión varias veces durante la vida del láser
                const hitCheckTimer = this.time.addEvent({
                    delay: 30,
                    repeat: 5,
                    callback: checkHit,
                    callbackScope: this
                });

                // Destruir tras 180ms
                this.time.delayedCall(180, () => {
                    if (laser && laser.active !== false) laser.destroy();
                });
            });
        };

        // Dispara los rayos desde el centro de Sonic, en 360°
        for (let i = 0; i < totalRays; i++) {
            const angle = angles[i];
            this.time.delayedCall(i * delayBetween, () => {
                fireRay(angle);
                raysFired++;
                if (raysFired === totalRays) {
                    this.time.delayedCall(400, () => {
                        lines.forEach(l => { if (l && l.destroy) l.destroy(); });
                        this.laserActive = false;
                        this.attackInProgress = false;
                    });
                }
            });
        }
    }

    // Nuevo ataque: Láser horizontal rápido
    startHorizontalLaserAttack() {
        if (this.laserActive || this.attackInProgress) return;
        console.log('Iniciando ataque: Láser horizontal');
        this.laserActive = true;
        this.attackInProgress = true;

        const totalRays = 12;
        const yStart = 60;
        const yEnd = 540;
        const yStep = (yEnd - yStart) / (totalRays - 1);
        let raysCompleted = 0;
        const laserWidth = 800;
        const laserHeight = 20;

        for (let i = 0; i < totalRays; i++) {
            const y = yStart + i * yStep;

            this.time.delayedCall(i * 180, () => {
                // Indicador de advertencia
                const warningBar = this.add.rectangle(400, y, laserWidth, laserHeight, 0xff0000, 0.6);
                this.tweens.add({
                    targets: warningBar,
                    alpha: 0.2,
                    duration: 150,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        warningBar.destroy();
                        
                        // Reproducir sonido de láser
                        this.sound.play('laser', { seek: 1 });
                        
                        // Crear el rayo
                        const laser = this.add.rectangle(400, y, laserWidth, laserHeight, 0xffffff, 0.85);
                        this.physics.add.existing(laser, true);

                        // Colisión con el jugador
                        this.physics.add.overlap(this.player, laser, () => {
                            this.onPlayerHit();
                        }, null, this);

                        // Fade out y destrucción
                        this.tweens.add({
                            targets: laser,
                            alpha: 0,
                            duration: 200,
                            onComplete: () => {
                                laser.destroy();
                                raysCompleted++;
                                if (raysCompleted === totalRays) {
                                    this.laserActive = false;
                                    this.attackInProgress = false;
                                }
                            }
                        });
                    }
                });
            });
        }
    }

    // Nuevo ataque: Bombardeo en secciones con zona segura
    startSectionedBombAttack() {
        if (this.bombsGroup.countActive(true) > 0 || this.attackInProgress) return;
        console.log('Iniciando ataque: Bombas por secciones');
        this.attackInProgress = true;

        // Sonido de alerta SOLO si no está ya sonando
        if (!this._alertaSound) {
            this._alertaSound = this.sound.add('alerta', { loop: true, volume: 1 });
            this._alertaSound.play();
        }

        // Dividir la pantalla en 3 secciones
        const sectionHeight = 600 / 3;
        // Elegir aleatoriamente cuál será la sección segura (0, 1, o 2)
        const safeSection = Phaser.Math.Between(0, 2);
        
        // Crear advertencia visual para la zona segura
        const safeY = sectionHeight * safeSection + sectionHeight / 2;
        const safeZone = this.add.rectangle(400, safeY, 800, sectionHeight, 0x00ff00, 0.2);
        
        // Hacer parpadear la zona segura
        this.tweens.add({
            targets: safeZone,
            alpha: 0,
            duration: 300,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                safeZone.destroy();
                // Parar alerta antes de lanzar bombas
                if (this._alertaSound && this._alertaSound.isPlaying) {
                    this._alertaSound.stop();
                    this._alertaSound.destroy();
                    this._alertaSound = null;
                }
                // Sonar proyectiles cuando caen las bombas
                this.sound.play('proyectiles', { volume: 1 });
                // Lanzar bombas en las secciones no seguras
                for (let section = 0; section < 3; section++) {
                    if (section !== safeSection) {
                        const sectionY = section * sectionHeight + sectionHeight / 2;
                        const bombCount = 15; // Cantidad de bombas por sección
                        
                        for (let i = 0; i < bombCount; i++) {
                            this.time.delayedCall(i * 100, () => {
                                const bomb = this.smallBombsGroup.create(800, 
                                    sectionY + Phaser.Math.Between(-sectionHeight/3, sectionHeight/3), 
                                    'bomb');
                                bomb.setScale(0.09);
                                bomb.body.setAllowGravity(false);
                                bomb.setVelocityX(-400); // Más rápido que las bombas normales
                                
                                // Colisión con el jugador
                                this.physics.add.overlap(this.player, bomb, () => {
                                    bomb.destroy(); // Destruir la bomba al colisionar
                                    this.onPlayerHit(); // Aplicar daño al jugador
                                });

                                // Destruir cuando salga de la pantalla
                                this.time.delayedCall(3000, () => {
                                    if (bomb && bomb.active) bomb.destroy();
                                });
                            });
                        }
                    }
                }
                
                // Terminar el ataque después de que todas las bombas hayan pasado
                this.time.delayedCall(5000, () => {
                    this.attackInProgress = false;
                });
            }
        });
    }

    // Optimizar el ataque de Zona Segura con Bombardeo
    startSafeZoneBombardment() {
        if (this.laserActive || this.attackInProgress) return;
        console.log('Iniciando ataque: Bombardeo con zona segura');
        this.laserActive = true;
        this.attackInProgress = true;

        // Sonido de alerta SOLO si no está ya sonando
        if (!this._alertaSound) {
            this._alertaSound = this.sound.add('alerta', { loop: true, volume: 1 });
            this._alertaSound.play();
        }

        // Dividir la mitad izquierda en una cuadrícula 2x2
        const sections = [
            { x: 0, y: 0, width: 200, height: 300 },
            { x: 200, y: 0, width: 200, height: 300 },
            { x: 0, y: 300, width: 200, height: 300 },
            { x: 200, y: 300, width: 200, height: 300 }
        ];

        // Elegir aleatoriamente una sección segura
        const safeIndex = Phaser.Math.Between(0, 3);
        const safeSection = sections[safeIndex];

        // Crear una sola zona segura visual y todas las warnings de una vez
        const visuals = [];
        const hitboxes = [];

        // Zona segura (verde)
        const safeZone = this.add.rectangle(
            safeSection.x + safeSection.width/2,
            safeSection.y + safeSection.height/2,
            safeSection.width,
            safeSection.height,
            0x00ff00,
            0.2
        );
        visuals.push(safeZone);

        // Crear warnings para todas las secciones peligrosas de una vez
        sections.forEach((section, index) => {
            if (index !== safeIndex) {
                const warning = this.add.rectangle(
                    section.x + section.width/2,
                    section.y + section.height/2,
                    section.width,
                    section.height,
                    0xff0000,
                    0.3
                );
                visuals.push(warning);
            }
        });

        this.tweens.add({
            targets: visuals,
            alpha: 0,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // Limpiar visuales (asegura que todos los warnings desaparecen)
                visuals.forEach(v => v.destroy());
                // Parar alerta antes de crear lasers
                if (this._alertaSound && this._alertaSound.isPlaying) {
                    this._alertaSound.stop();
                    this._alertaSound.destroy();
                    this._alertaSound = null;
                }
                // Crear hitboxes y lasers para zonas peligrosas
                sections.forEach((section, index) => {
                    if (index !== safeIndex) {
                        const centerX = section.x + section.width/2;
                        const centerY = section.y + section.height/2;

                        this.sound.play('laser', { seek: 1 });

                        // Un solo laser por sección
                        const laser = this.add.rectangle(
                            centerX,
                            centerY,
                            section.width,
                            section.height,
                            0xffffff,
                            0.5
                        );

                        // Un solo hitbox por sección
                        const hitbox = this.physics.add.existing(
                            this.add.rectangle(
                                centerX,
                                centerY,
                                section.width,
                                section.height
                            ), true
                        );
                        hitboxes.push(hitbox);

                        // Una sola colisión por sección
                        this.physics.add.overlap(this.player, hitbox, () => {
                            if (hitbox.active) {
                                this.onPlayerHit();
                                hitbox.active = false;
                            }
                        });

                        // Fade out más simple
                        this.tweens.add({
                            targets: laser,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => laser.destroy()
                        });
                    }
                });

                // Limpiar hitboxes después del ataque
                this.time.delayedCall(1000, () => {
                    hitboxes.forEach(h => h.destroy());
                    this.laserActive = false;
                    this.attackInProgress = false;
                });
            }
        });
    }

    update() {
        // Verificación principal de seguridad
        if (!this.player?.active || !this.scene.isActive()) {
            return;
        }

        // Controlar el cambio de música en los créditos
        this.checkCreditsMusic();

        // Saltar la introducción si se presiona ENTER
        if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey) && !this.canMove) {
            // Primero crear el nuevo fondo y elementos
            const skyBg = this.add.image(400, 300, 'fondocielo');
            skyBg.setScale(3.5);
            skyBg.setDepth(0);

            // Crear el nuevo Sonic y Eggman
            this.player = this.physics.add.sprite(200, 300, 'idle1');
            this.player.setScale(0.2);
            this.player.setCollideWorldBounds(true);
            this.player.body.setAllowGravity(false);
            this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 400, 600));

            this.robot = this.physics.add.sprite(600, 300, 'robot');
            this.robot.setScale(0.8);
            this.robot.body.setAllowGravity(false);
            this.robot.health = 100;

            // Ahora sí, limpiar los elementos viejos
            this.tweens.killAll();
            this.time.removeAllEvents();
            
            if (this.introText) this.introText.destroy();
            if (this.platforms) this.platforms.clear(true, true);
            if (this.transformTimer) this.transformTimer.remove();

            // Iniciar animación de vuelo del robot después de limpiar tweens
            this.startRobotFlyTween();

            // Finalmente, configurar el gameplay
            this.finishSetup();
        }

        // Asegúrate de que player y body existen antes de manipularlos
        if (!this.player || !this.player.body || !this.player.active || !this.canMove) {
        return;
    }

        let isMoving = false;
        let moveX = 0, moveY = 0;

        // Movimiento libre en todas direcciones
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
            this.player.setFlipX(true);
            isMoving = true;
            moveX = -1;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
            this.player.setFlipX(false);
            isMoving = true;
            moveX = 1;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-300);
            isMoving = true;
            moveY = -1;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(300);
            isMoving = true;
            moveY = 1;
        } else {
            this.player.setVelocityY(0);
        }

        // Guardar última dirección de movimiento si se está moviendo
        if (moveX !== 0 || moveY !== 0) {
            // Normalizar el vector
            const len = Math.sqrt(moveX * moveX + moveY * moveY);
            this.lastDirection = { x: moveX / len, y: moveY / len };
        }

        // Modo bolita mientras se mantiene presionada C
        if (this.keyC.isDown && !this.isBall) {
            this.isBall = true;
            this.player.setTexture('bolita');
            this.player.setScale(0.08); // Más pequeño para pasar por huecos
            this.player.body.setSize(this.player.width * 0.18, this.player.height * 0.18);
            this.player.anims.stop();
        } else if (!this.keyC.isDown && this.isBall) {
            this.isBall = false;
            this.player.setTexture('idle1');
            this.player.setScale(0.2);
            this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
        }

        // Animaciones según estado y ajuste de escala
        if (!this.isBall) {
            if (isMoving) {
                this.player.anims.play('flying', true);
                this.player.setScale(0.17); // Más pequeño mientras se mueve
                // Actualizar hitbox al cambiar animación
                this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
            } else {
                this.player.anims.play('float', true);
                this.player.setScale(0.2); // Tamaño normal mientras flota
                // Actualizar hitbox al cambiar animación
                this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
            }
            // Asegurar que las colisiones estén habilitadas
            this.player.body.enable = true;
            this.player.body.checkCollision.none = false;
        }

        // Ataque de Sonic con X (solo si no está en modo bolita)
        if (this.keyX && this.keyX.isDown && this.canMove && this.robot && this.robot.active && !this.isBall) {
            if (!this.continuousAttackTimer) {
                this.sonicAttack(); // Primer ataque inmediato
                this.continuousAttackTimer = this.time.addEvent({
                    delay: 200, // Dispara cada 0.5 segundos
                    callback: this.sonicAttack,
                    callbackScope: this,
                    loop: true
                });
            }
        } else if (this.continuousAttackTimer) {
            this.continuousAttackTimer.remove();
            this.continuousAttackTimer = null;
        }

        // Verificación segura para los anillos
        if (this.ringsGroup?.children) {
            this.ringsGroup.children.iterate(ring => {
                if (ring?.active && ring.update) {
                    ring.update();
                }
            });
        }
    }

    // Añade esta función al final de la clase (antes del cierre de la clase)
    startRobotFlyTween() {
        if (!this.robot) return;
        // Elimina tweens previos solo de este robot
        this.tweens.killTweensOf(this.robot);
        const originalY = this.robot.y;
        this.tweens.add({
            targets: this.robot,
            y: originalY + 30,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Ataque de Sonic hacia Eggman (siempre a la derecha)
    sonicAttack() {
        if (!this.robot || !this.robot.active || this.attackCooldown) return;
        
        this.attackCooldown = true;
        this.time.delayedCall(100, () => { this.attackCooldown = false; });
        
        this.sound.play('ataqueSound', { volume: 0.8 });
        
        // Crear un proyectil con el sprite de ataque
        const projectile = this.physics.add.sprite(this.player.x, this.player.y, 'ataque');
        projectile.setScale(0.13);
        projectile.body.setAllowGravity(false);
        
        const speed = 900;
        projectile.setVelocity(speed, 0);
        
        // Una sola colisión por proyectil
        const collider = this.physics.add.overlap(projectile, this.robot, () => {
            collider.destroy();
            projectile.destroy();
            this.damageEggman(40);
        }, null, this);
        
        // Autodestrucción simplificada
        projectile.checkWorldBounds = true;
        projectile.outOfBoundsKill = true;
    }

    // Daño a Eggman
    damageEggman(amount) {
        if (!this.robot || !this.robot.active || this.robot.isFlashing) {
            console.log('No se puede dañar a Eggman (invulnerable o en parpadeo)');
            return;
        }
        console.log(`Daño a Eggman: ${amount}, Vida actual: ${this.robot.health}`);
        
        const previousHealth = this.robot.health;
        this.robot.health -= amount;
        
        // Protección contra múltiples efectos de daño simultáneos
        this.robot.isFlashing = true;
        
        // Verificar si acaba de cruzar el umbral de la mitad de vida (5000)
        if (previousHealth > 5000 && this.robot.health <= 5000) {
            // Hacer que Eggman ría cuando se enoja
            if (!this._currentLaugh || !this._currentLaugh.isPlaying) {
                this._currentLaugh = this.sound.add('risaEggman', { volume: 1.5 });
                this._currentLaugh.play();
            }
            
            this.eggmanHealthText.setText('¡¡EGGMAN ESTÁ FURIOSO!!');
            
            // Un solo efecto de parpadeo
            this.robot.setTint(0xff0000);
            this.tweens.add({
                targets: this.robot,
                alpha: 0.2,
                yoyo: true,
                duration: 100,
                repeat: 2,
                onComplete: () => {
                    this.robot.clearTint();
                    this.robot.alpha = 1;
                    this.robot.isFlashing = false;
                    
                    // Reducir el delay entre ataques
                    if (this.attackTimer) {
                        this.attackTimer.delay = 1000;
                    }
                    this.eggmanHealthText.setText(`Eggman: ${Math.max(0, Math.floor(this.robot.health))}`);
                }
            });
        } else {
            // Efecto de daño normal simplificado
            this.eggmanHealthText.setText(`Eggman: ${Math.max(0, Math.floor(this.robot.health))}`);
            
            this.tweens.add({
                targets: this.robot,
                alpha: 0.3,
                yoyo: true,
                duration: 80,
                repeat: 1,
                onComplete: () => {
                    this.robot.alpha = 1;
                    this.robot.isFlashing = false;
                }
            });
        }

        // Si Eggman es derrotado
        if (this.robot.health <= 0) {
            this.robot.health = 0;
            if (this.robot && this.robot.active) {
                this.robot.setTint(0x888888);
                this.robot.setVelocity(0, 0);
                if (this.robot.body) this.robot.body.enable = false;
            }
            if (this.eggmanHealthText) {
                this.eggmanHealthText.setText('¡Eggman derrotado!');
            }
            
            // Hacer a Sonic invulnerable y desactivar disparos
            if (this.player && this.player.active) {
                this.player.invulnerable = true;
                if (this.player.body) this.player.body.enable = false;
            }
            this.canMove = false;
            
            // Detener TODOS los ataques activos y limpiar todo
            // Primero limpiar timers
            if (this.continuousAttackTimer) this.continuousAttackTimer.remove();
            if (this.ringsSpawnTimer) this.ringsSpawnTimer.remove();
            if (this.attackTimer) this.attackTimer.remove();
            
            // Luego limpiar grupos con verificación de seguridad
            ['ringsGroup', 'bombsGroup', 'smallBombsGroup'].forEach(groupName => {
                if (this[groupName]) {
                    this[groupName].children.each(child => {
                        if (child && child.active) child.destroy();
                    });
                    this[groupName].clear(true);
                }
            });

            // Detener estado de ataques
            this.attackInProgress = false;
            this.laserActive = false;

            // Limpiar efectos visuales con verificación de seguridad
            this.children.list.forEach(obj => {
                if (obj && obj.active && (
                    obj instanceof Phaser.GameObjects.Graphics ||
                    (obj.texture?.key === undefined && 
                    (obj.fillColor === 0xffffff || obj.fillColor === 0xff0000 ||
                     obj.lineColor === 0xff0000 || obj.lineColor === 0xffffff))
                )) {
                    obj.destroy();
                }
            });

            // Limpiar timers de Gaster Blaster con verificación
            if (this._gasterBlasterTimers) {
                this._gasterBlasterTimers.forEach(timer => {
                    if (timer && timer.remove) timer.remove();
                });
                this._gasterBlasterTimers = [];
            }

            // Iniciar secuencia de explosiones
            this.startExplosionSequence();
        }
    }

    startExplosionSequence() {
        // Detener la risa y el timer
        if (this._currentLaugh && this._currentLaugh.isPlaying) {
            this._currentLaugh.stop();
        }
        if (this.eggmanLaughTimer) {
            this.eggmanLaughTimer.remove();
        }

        const explosionPoints = [
            { x: -30, y: -30 }, { x: 30, y: -30 },
            { x: 0, y: 0 }, { x: -20, y: 20 },
            { x: 20, y: 20 }, { x: -10, y: -20 },
            { x: 10, y: 30 }, { x: -30, y: 0 }
        ];
        
        let explosionCount = 0;
        const totalExplosions = 16; // Más explosiones para 4 segundos
        
        const explodeInterval = this.time.addEvent({
            delay: 250, // 4 segundos / 16 = 250ms entre explosiones
            callback: () => {
                // Posición aleatoria relativa al robot
                const point = Phaser.Utils.Array.GetRandom(explosionPoints);
                const explosion = this.add.sprite(
                    this.robot.x + point.x,
                    this.robot.y + point.y,
                    'explosion1'
                ).setScale(0.15);
                
                // Reproducir sonido de explosión
                this.sound.play('explosion', { volume: 0.3 });
                
                // Animación de la explosión
                this.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    scale: 0.25,
                    duration: 300,
                    onComplete: () => explosion.destroy()
                });
                
                explosionCount++;
                if (explosionCount >= totalExplosions) {
                    explodeInterval.remove();
                    // Dar un pequeño delay antes de la transición
                    this.time.delayedCall(200, () => {
                        // Desactivar la física y controles primero
                        this.canMove = false;
                        if (this.player && this.player.body) this.player.setVelocity(0, 0);
                        if (this.robot && this.robot.body) this.robot.setVelocity(0, 0);
                        
                        // Luego iniciar la transición
                        this.transitionToEnding();
                    });
                }
            },
            repeat: totalExplosions - 1
        });
    }

    transitionToEnding() {
        const whiteScreen = this.add.rectangle(400, 300, 800, 600, 0xffffff)
            .setDepth(888)
            .setAlpha(0);

        const textStyle = {
            fontFamily: 'Times New Roman, serif',
            fontSize: '25px',
            fill: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 700 }
        };

        const dialogDelay = 5000;

        const initialDialogs = [
            "¡Uff! Ese Eggman… siempre armando líos, ¡y esta vez por un pastel!",
            "Pero tranquilo, ya lo recuperé a toda velocidad. Aunque… creo que no es para mí.",
            "Hey, ahí estás. Alguien me dijo que hoy es un día muy especial… tu cumpleaños."
        ];

        const finalDialogs = [
            "Así que esto es para ti. Me encargaron que te diga que esperan que tengas un cumpleaños increíble, ¡y yo también lo deseo con todas mis fuerzas!",
            "Parece que esa persona que me lo pidió te quiere un montón… casi tanto como yo quiero correr a toda velocidad.",
            "¡Feliz cumpleaños, Abigail! Y recuerda: ¡sigue siendo tan increíble como eres!"
        ];

        this.tweens.add({
            targets: whiteScreen,
            alpha: 1,
            duration: 1200,
            onUpdate: () => {
                if (this.robot) this.robot.setAlpha(1 - whiteScreen.alpha);
                if (this.player) this.player.setAlpha(1 - whiteScreen.alpha);
                if (this.eggmanHealthText) this.eggmanHealthText.setAlpha(1 - whiteScreen.alpha);
                if (this.ringsText) this.ringsText.setAlpha(1 - whiteScreen.alpha);
            },
            onComplete: () => {
                this.sound.stopAll();
                this.physics.pause();
                this.children.removeAll(true);
                this.physics.world.colliders.destroy();
                
                const bg = this.add.image(400, 300, 'fondo');
                const platform = this.add.image(400, 583, 'ground').setScale(1.2, 0.1);
                this.sound.add('musicaend', { loop: true, volume: 0.7 }).play();

                const dialogText = this.add.text(400, 0, '', textStyle)
                    .setOrigin(0.5)
                    .setAlpha(0);

                const sonic = this.add.sprite(400, 400, 'sonic-super-side')
                    .setScale(0.2);

                const updateTextPosition = () => {
                    dialogText.y = sonic.y - 100;
                };

                this.tweens.add({
                    targets: sonic,
                    y: '+=15',
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    onUpdate: updateTextPosition
                });

                let dialogIndex = 0;
                const showInitialDialogs = () => {
                    if (dialogIndex < initialDialogs.length) {
                        if (dialogIndex === 2) {
                            sonic.setTexture('sonic-super-front-side');
                        }
                        dialogText.setText(initialDialogs[dialogIndex]);
                        this.tweens.add({
                            targets: dialogText,
                            alpha: 1,
                            duration: 1000,
                            onComplete: () => {
                                this.time.delayedCall(dialogDelay, () => {
                                    this.tweens.add({
                                        targets: dialogText,
                                        alpha: 0,
                                        duration: 1000,
                                        onComplete: () => {
                                            dialogIndex++;
                                            showInitialDialogs();
                                        }
                                    });
                                });
                            }
                        });
                    } else {
                        sonic.setTexture('sonic-frente-super');
                        this.time.delayedCall(2000, () => {
                            this.tweens.killTweensOf(sonic);
                            sonic.setTexture('sonic-frente');
                            this.tweens.add({
                                targets: sonic,
                                y: 520,
                                duration: 1500,
                                ease: 'Bounce.Out',

                                onUpdate: updateTextPosition,
                                                               onComplete: () => {
                                    let finalIndex = 0;
                                    const showFinalDialog = () => {
                                        if (finalIndex < finalDialogs.length) {
                                            dialogText.setText(finalDialogs[finalIndex]);
                                            this.tweens.add({
                                                targets: dialogText,
                                                alpha: 1,
                                                duration: 1000,
                                                onComplete: () => {
                                                    this.time.delayedCall(dialogDelay, () => {
                                                        this.tweens.add({
                                                            targets: dialogText,
                                                            alpha: 0,
                                                            duration: 1000,
                                                            onComplete: () => {
                                                                finalIndex++;
                                                                showFinalDialog();
                                                            }
                                                        });
                                                    });

                                                                                               }
                                            });
                                        } else {
                                            // Secuencia de salto y ruptura de cuarta pared
                                            sonic.setTexture('salto1');
                                            sonic.setScale(0.3);
                                            this.tweens.add({
                                                targets: sonic,
                                                y: 300,
                                                scaleX: 0.5,
                                                scaleY: 0.5,
                                                duration: 1000,
                                                ease: 'Power2',
                                                onComplete: () => {
                                                    sonic.setTexture('salto2');
                                                    this.tweens.add({
                                                        targets: sonic,
                                                        scaleX: 1.2,
                                                        scaleY: 1.2,
                                                        y: 300,
                                                        x: 400,
                                                        duration: 800,
                                                        ease: 'Power1',
                                                        onComplete: () => {
                                                            // Mantener por 4 segundos antes del fade to black
                                                            this.time.delayedCall(4000, () => {
                                                                const blackScreen = this.add.rectangle(400, 300, 800, 600, 0x000000)
                                                                    .setDepth(999)
                                                                    .setAlpha(0);
                                                                
                                                                // Fade a negro
                                                                this.tweens.add({
                                                                    targets: [sonic, bg, platform, dialogText],
                                                                    alpha: 0,
                                                                    duration: 2000,
                                                                    ease: 'Power2'
                                                                });

                                                                this.tweens.add({
                                                                    targets: blackScreen,
                                                                    alpha: 1,
                                                                    duration: 2000,
                                                                    ease: 'Power2',
                                                                    onComplete: () => {
                                                                        this.showCredits();
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    };
                                    showFinalDialog();
                                }
                            });
                        });
                    }
                };

                this.tweens.add({
                    targets: whiteScreen,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => showInitialDialogs()
                });
            }
        });
    }

    checkCreditsMusic() {
        const currentEndMusic = this.sound.get('musicaend');
        if (currentEndMusic && currentEndMusic.seek >= 50 && !this._creditsMusica) {
            this._creditsMusica = true; // Flag para evitar múltiples cambios
            currentEndMusic.stop();
            const creditosMusic = this.sound.add('creditos', { volume: 0.8 }); // Ajustar volumen aquí
            creditosMusic.play({
                seek: 50  // Empezar desde el segundo 50
            });
        }
    }

    showCredits() {
    const creditsStyle = {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        align: 'center',
        padding: { x: 20, y: 20 }
    };

    const credits = [
        "Hecho por Jheral :V",
        "",
        "Espero te haya gustado",
        "",
        "Me esforcé demasiado :,v",
        "",
        "Pásala bonito y...",
        "",
        "¡Feliz Cumpleaños!"
    ];

    let currentCredit = 0;

    const showNextCredit = () => {
        if (currentCredit >= credits.length) {
            // Créditos terminados
            return;
        }

        const creditText = this.add.text(400, 300, credits[currentCredit], creditsStyle)
            .setOrigin(0.5)
            .setDepth(9999)
            .setAlpha(0);

        this.tweens.add({
            targets: creditText,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: creditText,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            creditText.destroy();
                            currentCredit++;
                            showNextCredit();
                        }
                    });
                });
            }
        });
    };

    showNextCredit();
}



    startFloweyBombAttack() {
        if (this.attackInProgress) return;
        this.attackInProgress = true;
        console.log('Iniciando ataque: Flowey Bomb Circle');

        const totalBombs = 16;
        const radius = 140;
        const centerX = this.player.x;
        const centerY = this.player.y;

        // Ángulo del hueco de escape (aleatorio)
        const escapeAngle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 359));
        const escapeWidth = Math.PI / 8; // tamaño del hueco (~22.5 grados)

        // Calcular ángulos de aparición (saltando el hueco)
        const bombAngles = [];
        for (let i = 0; i < totalBombs; i++) {
           
            const angle = (i / totalBombs) * Math.PI * 2;
            if ( Math.abs(Phaser.Math.Angle.Wrap(angle - escapeAngle)) < escapeWidth) continue;

            bombAngles.push(angle);
        }

        const bombs = [];
               // Aparecen uno por uno rápidamente
        bombAngles.forEach((angle, idx) => {
            this.time.delayedCall(idx * 70, () => {
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const bomb = this.smallBombsGroup.create(x, y, 'bomb');
                bomb.setScale(0.09);
                bomb.body.setAllowGravity(false);
                bomb.body.setVelocity(0, 0);
                bomb.setData('floweyBomb', true);
                bomb.body.enable = false; // No colisionan aún
               
                bombs.push({ bomb, angle, x, y });

                // Cuando la última bomba aparece, esperar 0.2s y lanzar todas
                if (idx === bombAngles.length - 1) {
                    this.time.delayedCall(200, () => {
                        bombs.forEach(({ bomb, x, y }) => {
                            bomb.body.enable = true;
                            // Calcular velocidad hacia el centro (Sonic)
                            const dx = centerX - x;
                            const dy = centerY - y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const speed = 110;
                            bomb.setVelocity(dx / dist * speed, dy / dist * speed);

                            // Colisión con el jugador
                            this.physics.add.overlap(this.player, bomb, () => {
                                bomb.destroy(); // Destruir la bomba al colisionar
                                this.onPlayerHit(); // Aplicar daño al jugador
                            });

                            // Destruir después de 2.5 segundos
                            this.time.delayedCall(2500, () => {
                                if (bomb && bomb.active) bomb.destroy();
                            });
                        });
                        // Terminar el ataque después de que las bombas desaparezcan
                        this.time.delayedCall(2700, () => {
                            this.attackInProgress = false;
                        });
                    });
                }
            });
        });
    }

    newSmallBombsAttack() {
        if (this.attackInProgress) return; // Evitar ataques simultáneos
        console.log('Iniciando nuevo ataque: Oleada de bombas pequeñas');
        this.attackInProgress = true;

        const totalBombs = 16; // Número total de bombas
        const bombSpeed = 200; // Velocidad de las bombas

        // Sonar proyectiles justo antes de lanzar la primera bomba
        this.sound.play('proyectiles', { volume: 1 });

        for (let i = 0; i < totalBombs; i++) {
            this.time.delayedCall(i * 150, () => {
                const x = -50; // Aparecen desde fuera de la pantalla (izquierda)
                const y = Phaser.Math.Between(100, 500); // Posición Y aleatoria

                const bomb = this.physics.add.sprite(x, y, 'bomb');
                bomb.setScale(0.09);
                bomb.body.setAllowGravity(false);
                bomb.setVelocityX(bombSpeed); // Mover hacia la derecha

                // Colisión con el jugador
                this.physics.add.overlap(this.player, bomb, () => {
                    bomb.destroy(); // Destruir la bomba al colisionar
                    this.onPlayerHit(); // Aplicar daño al jugador
                });

                // Destruir la bomba si sale de la pantalla
                bomb.checkWorldBounds = true;
                bomb.outOfBoundsKill = true;

                // Destruir automáticamente después de 5 segundos
                this.time.delayedCall(5000, () => {
                    if (bomb.active) bomb.destroy();
                });
            });
        }

        // Finalizar el ataque después de que todas las bombas hayan sido lanzadas
        this.time.delayedCall(totalBombs * 150 + 1000, () => {
            this.attackInProgress = false;
        });
    }
}

// Registrar la escena solo una vez

game.scene.add('FinalLevel', FinalLevel);