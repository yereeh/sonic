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
        this.load.image('sonic-super-side', 'assets/supercostado.png');
        this.load.image('sonic-super-front-side', 'assets/supercostadofrente.png');
        this.load.image('salto1', 'assets/salto1.png');
        this.load.image('salto2', 'assets/salto2.png');
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
        
        // Reproducir risa de Eggman con volumen máximo
        this.sound.play('risaEggman', { volume: 2 });
        
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
        this.player.setScale(0.15); // Mantener escala consistente
        
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
        this.player.setScale(0.2);
        
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

        // Agregar timer para risa aleatoria de Eggman
        this.eggmanLaughTimer = this.time.addEvent({
            delay: 4000, // Reducido de 8000 a 4000 (cada 4 segundos intentar risa)
            callback: this.tryEggmanLaugh,
            callbackScope: this,
            loop: true
        });

        // Crear animaciones
        this.anims.create({
            key: 'float',
            frames: [
                { key: 'idle1' },
                { key: 'idle2' }
            ],
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'flying',
            frames: [
                { key: 'volar1' },
                { key: 'volar2' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Elimina esta animación duplicada si ya existe
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

        // Lista completa de ataques de Eggman
        this.eggmanAttacks = [
            this.startGasterBlasterAttack,
            this.startCircularGasterBlasterAttack,
            this.startLaserAttack,
            this.startHorizontalLaserAttack,
            this.startSmallBombsAttack,
            this.startSectionedBombAttack,
            this.startSafeZoneBombardment,
            this.startDashAttack,
            this.startFloweyBombAttack
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
    }

    // Crear los 3 anillos iniciales en fila vertical, moviéndose solo a la izquierda
    createInitialRings() {
        // No limpiar el grupo, deja que los anillos viejos desaparezcan solos

        const yBase = Phaser.Math.Between(120, 420);
        const spacing = 60;

        if (this._ringsRespawning) return;
        this._ringsRespawning = false;
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
                    if (ringsLeft === 0 && !this._ringsRespawning) {
                        this._ringsRespawning = true;
                        this.time.delayedCall(100, () => {
                            this._ringsRespawning = false;
                            this.createInitialRings();
                        });
                    }
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
        if (this.player.invulnerable || this.isRestarting) return;

        if (this.playerRings > 0) {
            this.sound.play('perderAnillos', { volume: 1.0 });
            const lost = Math.floor(this.playerRings / 2) || 1;
            this.spawnFlyingRings(lost);
            this.playerRings = 0;
            this.updateRingsText();
        } else {
            this.isRestarting = true;
            
            // Crear la transición blanca
            const whiteScreen = this.add.rectangle(400, 300, 800, 600, 0xffffff);
            whiteScreen.setDepth(999);
            whiteScreen.setAlpha(0);
            
            // Animación de fade in
            this.tweens.add({
                targets: whiteScreen,
                alpha: 1,
                duration: 600,
                onComplete: () => {
                    // Limpiar todo durante la transición
                    this.cleanupBeforeRestart();
                    
                    // Reiniciar la batalla
                    this.restartBattle();
                    
                    // Fade out
                    this.tweens.add({
                        targets: whiteScreen,
                        alpha: 0,
                        duration: 600,
                        onComplete: () => {
                            whiteScreen.destroy();
                            this.isRestarting = false;
                        }
                    });
                }
            });
        }
    }

    cleanupBeforeRestart() {
        // Detener todos los timers
        if (this.attackTimer) this.attackTimer.remove();
        if (this.ringsSpawnTimer) this.ringsSpawnTimer.remove();
        if (this.eggmanLaughTimer) this.eggmanLaughTimer.remove();
        if (this.continuousAttackTimer) this.continuousAttackTimer.remove();

        // Limpiar grupos de objetos
        if (this.ringsGroup) this.ringsGroup.clear(true, true);
        if (this.bombsGroup) this.bombsGroup.clear(true, true);
        if (this.smallBombsGroup) this.smallBombsGroup.clear(true, true);

        // Detener todos los tweens
        this.tweens.killAll();

        // Limpiar todas las colisiones
        this.physics.world.colliders.destroy();
        
        // Detener toda la física
        this.physics.pause();
    }

    restartBattle() {
        // Reanudar la física
        this.physics.resume();

        // Reposicionar jugador y robot
        this.player.setPosition(200, 300);
        this.player.setVelocity(0, 0);
        this.player.setTexture('idle1');
        this.player.setScale(0.2);
        this.player.setFlipX(false);
        
        this.robot.setPosition(600, 300);
        this.robot.setVelocity(0, 0);
        
        // Reiniciar vida de Eggman si es necesario
        if (!this.robot.health || this.robot.health <= 0) {
            this.robot.health = 10000;
        }
        this.eggmanHealthText.setText(`Eggman: ${this.robot.health}`);
        
        // Reiniciar contadores
        this.playerRings = 3;
        this.updateRingsText();
        
        // Reiniciar estados
        this.attackInProgress = false;
        this.laserActive = false;
        this.isBall = false;
        this.canMove = true;
        
        // Reiniciar timers principales
        this.attackTimer = this.time.addEvent({
            delay: 2000,
            callback: this.tryRandomEggmanAttack,
            callbackScope: this,
            loop: true
        });

        this.ringsSpawnTimer = this.time.addEvent({
            delay: 4000,
            callback: () => {
                this.createInitialRings();
            },
            callbackScope: this,
            loop: true
        });

        this.eggmanLaughTimer = this.time.addEvent({
            delay: 4000,
            callback: this.tryEggmanLaugh,
            callbackScope: this,
            loop: true
        });
        
        // Reiniciar movimiento de robot
        this.startRobotFlyTween();
        
        // Crear anillos iniciales
        this.createInitialRings();
    }

    update() {
        // Verificación principal de seguridad
        if (!this.player?.active || !this.scene.isActive()) {
            return;
        }

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
            } else {
                this.player.anims.play('float', true);
                this.player.setScale(0.2); // Tamaño normal mientras flota
            }
        }

        // Ataque de Sonic con X
        if (this.keyX && this.keyX.isDown && this.canMove && this.robot && this.robot.active) {
            if (!this.continuousAttackTimer) {
                this.sonicAttack(); // Primer ataque inmediato
                this.continuousAttackTimer = this.time.addEvent({
                    delay: 500, // Dispara cada 0.5 segndos
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
            this.damageEggman(28);
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
            this.robot.setTint(0x888888);
            this.robot.setVelocity(0, 0);
            this.robot.body.enable = false;
            this.eggmanHealthText.setText('¡Eggman derrotado!');
            
            // Limpiar todos los timers y efectos activos
            if (this.ringsSpawnTimer) this.ringsSpawnTimer.remove();
            if (this.attackTimer) this.attackTimer.remove();
            if (this.ringsGroup) this.ringsGroup.clear(true, true);
            
            // Iniciar secuencia de explosiones
            this.startExplosionSequence();
        }
    }

    startExplosionSequence() {
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
            .setDepth(999)
            .setAlpha(0);

        const textStyle = {
    fontFamily: 'Times New Roman, serif', // Fuente formal
    fontSize: '20px',                     // Más grande
    fill: '#000000',                      // Letras negras
    stroke: '#ffffff',                    // Borde blanco
    strokeThickness: 6,                   // Borde más grueso
    align: 'center',
    wordWrap: { width: 700 }
};

        const dialogDelay = 5000;      // Añadido aquí la declaración

        // Primera parte de la secuencia
        const initialDialogs = [
            "¡Uff! Ese Eggman… siempre armando líos, ¡y esta vez por un pastel!",
            "Pero tranquilo, ya lo recuperé a toda velocidad. Aunque… creo que no es para mí.",
            "Hey, ahí estás. Alguien me dijo que hoy es un día muy especial… tu cumpleaños."
        ];

        // Los diálogos finales después de la transformación
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

                // Posición del texto arriba de Sonic
                const dialogText = this.add.text(400, 0, '', textStyle)
                    .setOrigin(0.5)
                    .setAlpha(0);

                // Sonic en la parte media-baja de la pantalla
                const sonic = this.add.sprite(400, 400, 'sonic-super-side')
                    .setScale(0.2);

                // Actualizar posición del texto relativa a Sonic
                const updateTextPosition = () => {
                    dialogText.y = sonic.y - 100; // 100 píxeles arriba de Sonic
                };

                // Animación de levitación constante
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
                                            sonic.setScale(0.3); // Aumentar tamaño
                                            
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
                    duration: 1200,
                    ease: 'Linear',
                    onComplete: () => showInitialDialogs()
                });
            }
        });
    }

    // Ataque tipo Flowey: círculo de bombitas rodeando a Sonic con un hueco para escapar
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
            if (Math.abs(Phaser.Math.Angle.Wrap(angle - escapeAngle)) < escapeWidth) continue;
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
                            this.physics.add.overlap(this.player, bomb, this.onSmallBombHit, null, this);

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
}

// Registrar la escena solo una vez

game.scene.add('FinalLevel', FinalLevel);