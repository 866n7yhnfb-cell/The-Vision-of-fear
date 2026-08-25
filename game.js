// ============================================================
// THE VISION OF FEAR
// DEMO 0.3
// ============================================================

let scene;
let camera;
let renderer;

let flashlight;
let ambientLight;

let player = {
    x: 0,
    y: 1.6,
    z: 5,
    rotationY: 0,
    rotationX: 0
};

let keys = {};
let moveX = 0;
let moveY = 0;

let lastTouchX = 0;
let lastTouchY = 0;

let hasKey = false;
let radioUsed = false;
let horrorStarted = false;

let keyObject;
let radioObject;
let exitDoor;
let doctor;

let lights = [];

let clock = new THREE.Clock();

let audioContext = null;


// ============================================================
// START
// ============================================================

const startButton =
    document.getElementById("startButton");

if (startButton) {

    startButton.addEventListener(
        "click",
        startGame
    );

}


function startGame() {

    const menu =
        document.getElementById("menu");

    const game =
        document.getElementById("game");

    if (menu)
        menu.style.display = "none";

    if (game)
        game.style.display = "block";


    createAudio();
    createGame();

    setTimeout(() => {

        showMessage(
            "02:17 AM\nБОЛЬНИЦА ЗАКРЫТА."
        );

    }, 500);
}


// ============================================================
// AUDIO
// ============================================================

function createAudio() {

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    } catch (e) {

        console.log("Audio unavailable");

    }

}


function sound(
    frequency,
    duration,
    volume = 0.04
) {

    if (!audioContext)
        return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.frequency.value =
        frequency;

    oscillator.type =
        "sine";

    gain.gain.value =
        volume;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.stop(
        audioContext.currentTime + duration
    );

}


// ============================================================
// GAME
// ============================================================

function createGame() {

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(0x020304);

    scene.fog =
        new THREE.Fog(
            0x020304,
            2,
            32
        );


    // CAMERA

    camera =
        new THREE.PerspectiveCamera(
            70,
            window.innerWidth /
            window.innerHeight,
            0.05,
            100
        );

    camera.position.set(
        player.x,
        player.y,
        player.z
    );


    // RENDERER

    renderer =
        new THREE.WebGLRenderer({
            antialias: false
        });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            1.5
        )
    );


    const game =
        document.getElementById("game");

    if (game)
        game.appendChild(renderer.domElement);


    // LIGHT

    ambientLight =
        new THREE.AmbientLight(
            0x777b88,
            0.22
        );

    scene.add(
        ambientLight
    );


    // FLOOR

    createFloor();


    // WALLS

    createWalls();


    // CEILING

    createCeiling();


    // LIGHTS

    createLight(0, 3);
    createLight(0, -5);
    createLight(0, -13);
    createLight(0, -21);


    // EXIT

    exitDoor =
        createExitDoor(
            0,
            -27
        );


    // RADIO

    radioObject =
        createRadio(
            -3.6,
            1.0,
            -7
        );


    // KEY
    // ВАЖНО:
    // теперь ключ находится близко
    // и его невозможно не заметить

    keyObject =
        createKey(
            2.5,
            0.55,
            1
        );


    // SIGNS

    createWallText(
        "ПРИЁМНОЕ ОТДЕЛЕНИЕ",
        -4.75,
        1.9,
        -1
    );


    createWallText(
        "ЭТАЖ 01",
        4.75,
        1.9,
        -10
    );


    createWallText(
        "7 ЭТАЖ",
        0,
        2.6,
        -26.5
    );


    // DOCTOR

    doctor =
        createDoctor(
            0,
            -18
        );

    doctor.visible =
        false;


    // FLASHLIGHT

    flashlight =
        new THREE.SpotLight(
            0xffffff,
            4,
            20,
            Math.PI / 6,
            0.5,
            1
        );

    flashlight.position.set(
        0,
        0,
        0
    );

    flashlight.target.position.set(
        0,
        0,
        -10
    );

    camera.add(
        flashlight
    );

    camera.add(
        flashlight.target
    );

    scene.add(
        camera
    );


    setupControls();


    window.addEventListener(
        "resize",
        resize
    );


    animate();
}


// ============================================================
// FLOOR
// ============================================================

function createFloor() {

    const floor =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                10,
                40
            ),

            new THREE.MeshStandardMaterial({
                color: 0x25262a,
                roughness: 1
            })

        );


    floor.rotation.x =
        -Math.PI / 2;

    floor.position.z =
        -10;

    scene.add(
        floor
    );


    // плитка

    for (
        let z = 5;
        z > -30;
        z -= 2
    ) {

        const line =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    9.8,
                    0.015,
                    0.025
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0x111214
                })

            );


        line.position.set(
            0,
            0.01,
            z
        );

        scene.add(
            line
        );

    }

}


// ============================================================
// WALLS
// ============================================================

function createWalls() {

    const material =
        new THREE.MeshStandardMaterial({
            color:
                0x3b3c41,

            roughness:
                1
        });


    const left =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.3,
                3,
                40
            ),

            material

        );


    left.position.set(
        -5,
        1.5,
        -10
    );


    scene.add(left);


    const right =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.3,
                3,
                40
            ),

            material

        );


    right.position.set(
        5,
        1.5,
        -10
    );


    scene.add(right);

}


// ============================================================
// CEILING
// ============================================================

function createCeiling() {

    const ceiling =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                10,
                0.2,
                40
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0x111216,

                roughness:
                    1
            })

        );


    ceiling.position.set(
        0,
        3,
        -10
    );


    scene.add(
        ceiling
    );

}


// ============================================================
// LIGHT
// ============================================================

function createLight(
    x,
    z
) {

    const light =
        new THREE.PointLight(
            0xdde3ff,
            2,
            7
        );


    light.position.set(
        x,
        2.7,
        z
    );


    scene.add(
        light
    );


    lights.push(
        light
    );


    const lamp =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.4,
                0.08,
                0.25
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xffffff
            })

        );


    lamp.position.set(
        x,
        2.88,
        z
    );


    scene.add(
        lamp
    );

}


// ============================================================
// KEY
// ============================================================

function createKey(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    // Большое светящееся кольцо

    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                0.22,
                0.065,
                12,
                24
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0xffd95a,

                emissive:
                    0x8a6800,

                emissiveIntensity:
                    2,

                metalness:
                    0.8,

                roughness:
                    0.2

            })

        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(
        ring
    );


    // Стержень

    const stick =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.65,
                0.09,
                0.09
            ),

            new THREE.MeshStandardMaterial({

                color:
                    0xffd95a,

                emissive:
                    0x8a6800,

                emissiveIntensity:
                    2,

                metalness:
                    0.8

            })

        );


    stick.position.x =
        0.35;


    group.add(
        stick
    );


    // Свечение вокруг ключа

    const glow =
        new THREE.PointLight(
            0xffd34d,
            1.5,
            3
        );


    group.add(
        glow
    );


    group.position.set(
        x,
        y,
        z
    );


    scene.add(
        group
    );


    return {
        mesh: group,
        x: x,
        y: y,
        z: z
    };

}


// ============================================================
// WALL TEXT
// ============================================================

function createWallText(
    text,
    x,
    y,
    z
) {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        1024;

    canvas.height =
        256;


    const ctx =
        canvas.getContext("2d");


    // Чёрная табличка

    ctx.fillStyle =
        "#08090b";

    ctx.fillRect(
        0,
        0,
        1024,
        256
    );


    // Рамка

    ctx.strokeStyle =
        "#777b82";

    ctx.lineWidth =
        6;

    ctx.strokeRect(
        8,
        8,
        1008,
        240
    );


    // Текст

    ctx.fillStyle =
        "#eeeeee";

    ctx.font =
        "bold 58px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        text,
        512,
        128
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    const material =
        new THREE.MeshBasicMaterial({
            map:
                texture,

            side:
                THREE.DoubleSide
        });


    const mesh =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                3.8,
                0.95
            ),

            material

        );


    mesh.position.set(
        x,
        y,
        z
    );


    // Левая стена

    if (x < -4) {

        mesh.rotation.y =
            Math.PI / 2;

    }


    // Правая стена

    else if (x > 4) {

        mesh.rotation.y =
            -Math.PI / 2;

    }


    // Табличка впереди

    else {

        mesh.rotation.y =
            0;

    }


    scene.add(
        mesh
    );


    return mesh;
}


// ============================================================
// RADIO
// ============================================================

function createRadio(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.9,
                0.5,
                0.4
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0x151619
            })

        );


    group.add(
        body
    );


    const redLight =
        new THREE.PointLight(
            0xff2222,
            0.8,
            1
        );


    redLight.position.set(
        0.25,
        0.15,
        -0.25
    );


    group.add(
        redLight
    );


    group.position.set(
        x,
        y,
        z
    );


    scene.add(
        group
    );


    return {
        mesh:
            group,

        x:
            x,

        y:
            y,

        z:
            z
    };

}


// ============================================================
// EXIT DOOR
// ============================================================

function createExitDoor(
    x,
    z
) {

    const door =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.6,
                2.5,
                0.25
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0x222329,

                roughness:
                    1
            })

        );


    door.position.set(
        x,
        1.25,
        z
    );


    scene.add(
        door
    );


    return {
        mesh:
            door,

        x:
            x,

        z:
            z
    };

}


// ============================================================
// DOCTOR
// ============================================================

function createDoctor(
    x,
    z
) {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                1.3,
                0.4
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0xdededa
            })

        );


    body.position.y =
        1.15;


    group.add(
        body
    );


    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.3,
                8,
                8
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0xaaa9a7
            })

        );


    head.position.y =
        2;


    group.add(
        head
    );


    group.position.set(
        x,
        0,
        z
    );


    scene.add(
        group
    );


    return group;
}


// ============================================================
// CONTROLS
// ============================================================

function setupControls() {

    // КЛАВИАТУРА

    window.addEventListener(
        "keydown",
        e => {

            keys[
                e.key.toLowerCase()
            ] = true;


            if (
                e.key.toLowerCase() === "e"
            ) {

                interact();

            }


            if (
                e.key.toLowerCase() === "f"
            ) {

                flashlight.visible =
                    !flashlight.visible;

            }

        }
    );


    window.addEventListener(
        "keyup",
        e => {

            keys[
                e.key.toLowerCase()
            ] = false;

        }
    );


    // ФОНАРИК

    const flashlightButton =
        document.getElementById(
            "flashlight"
        );

    if (flashlightButton) {

        flashlightButton.addEventListener(
            "click",
            () => {

                flashlight.visible =
                    !flashlight.visible;

            }
        );

    }


    // E

    const interactButton =
        document.getElementById(
            "interact"
        );

    if (interactButton) {

        interactButton.addEventListener(
            "click",
            interact
        );

    }


    // JOYSTICK

    const joystick =
        document.getElementById(
            "joystick"
        );


    const stick =
        document.getElementById(
            "joystickStick"
        );


    if (joystick && stick) {

        joystick.addEventListener(
            "touchmove",
            e => {

                e.preventDefault();

                const touch =
                    e.touches[0];

                const rect =
                    joystick.getBoundingClientRect();

                const centerX =
                    rect.left +
                    rect.width / 2;

                const centerY =
                    rect.top +
                    rect.height / 2;

                let dx =
                    touch.clientX -
                    centerX;

                let dy =
                    touch.clientY -
                    centerY;

                const max =
                    35;

                const len =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (len > max) {

                    dx =
                        dx /
                        len *
                        max;

                    dy =
                        dy /
                        len *
                        max;

                }


                stick.style.transform =
                    `translate(${dx}px,${dy}px)`;


                moveX =
                    dx / max;

                moveY =
                    dy / max;

            },
            {
                passive: false
            }
        );


        joystick.addEventListener(
            "touchend",
            () => {

                moveX = 0;
                moveY = 0;

                stick.style.transform =
                    "translate(0,0)";

            }
        );

    }


    // ПОВОРОТ КАМЕРЫ

    const lookArea =
        document.getElementById(
            "lookArea"
        );


    if (lookArea) {

        lookArea.addEventListener(
            "touchstart",
            e => {

                const touch =
                    e.touches[0];

                lastTouchX =
                    touch.clientX;

                lastTouchY =
                    touch.clientY;

            }
        );


        lookArea.addEventListener(
            "touchmove",
            e => {

                e.preventDefault();

                const touch =
                    e.touches[0];

                const dx =
                    touch.clientX -
                    lastTouchX;

                const dy =
                    touch.clientY -
                    lastTouchY;


                player.rotationY -=
                    dx * 0.004;


                player.rotationX -=
                    dy * 0.003;


                player.rotationX =
                    THREE.MathUtils.clamp(
                        player.rotationX,
                        -1.2,
                        1.2
                    );


                lastTouchX =
                    touch.clientX;

                lastTouchY =
                    touch.clientY;

            },
            {
                passive: false
            }
        );

    }

}


// ============================================================
// INTERACTION
// ============================================================

function interact() {

    if (!keyObject)
        return;


    const keyDistance =
        distance(
            player.x,
            player.z,
            keyObject.x,
            keyObject.z
        );


    const radioDistance =
        distance(
            player.x,
            player.z,
            radioObject.x,
            radioObject.z
        );


    const doorDistance =
        distance(
            player.x,
            player.z,
            exitDoor.x,
            exitDoor.z
        );


    // KEY

    if (
        !hasKey &&
        keyDistance < 2.2
    ) {

        hasKey =
            true;

        keyObject.mesh.visible =
            false;

        sound(
            700,
            0.25,
            0.06
        );

        showMessage(
            "КЛЮЧ ПОЛУЧЕН\n\nНа брелоке написано: 7 ЭТАЖ."
        );

        return;
    }


    // RADIO

    if (
        radioDistance < 2
    ) {

        useRadio();

        return;
    }


    // DOOR

    if (
        doorDistance < 3
    ) {

        if (!hasKey) {

            showMessage(
                "ДВЕРЬ ЗАПЕРТА.\n\nНужен ключ."
            );

            sound(
                80,
                0.2
            );

        } else {

            showMessage(
                "ДВЕРЬ ОТКРЫТА.\n\nВпереди только темнота..."
            );

            exitDoor.mesh.rotation.y =
                -Math.PI / 2;

        }

        return;
    }


    showMessage(
        "Здесь ничего нет."
    );

}


// ============================================================
// RADIO
// ============================================================

function useRadio() {

    if (radioUsed) {

        showMessage(
            "Радио молчит."
        );

        return;
    }


    radioUsed =
        true;


    sound(
        600,
        0.2
    );


    showMessage(
        "РАДИО:\n\n«...если ты меня слышишь...»"
    );


    setTimeout(
        () => {

            showMessage(
                "«...не поднимайся на седьмой этаж...»"
            );

        },
        3500
    );


    setTimeout(
        () => {

            showMessage(
                "«...ты ведь помнишь её?..»"
            );

        },
        7000
    );


    setTimeout(
        () => {

            startHorror();

        },
        10000
    );

}


// ============================================================
// HORROR
// ============================================================

function startHorror() {

    if (horrorStarted)
        return;


    horrorStarted =
        true;


    let count =
        0;


    const flicker =
        setInterval(
            () => {

                lights.forEach(
                    light => {

                        light.visible =
                            !light.visible;

                    }
                );


                count++;


                if (count >= 12) {

                    clearInterval(
                        flicker
                    );

                    lights.forEach(
                        light => {

                            light.visible =
                                true;

                        }
                    );

                }

            },
            150
        );


    sound(
        45,
        1,
        0.1
    );


    setTimeout(
        () => {

            doctor.visible =
                true;


            showMessage(
                "КТО-ТО СТОИТ В КОНЦЕ КОРИДОРА."
            );

        },
        1800
    );


    setTimeout(
        () => {

            doctor.visible =
                false;


            showMessage(
                "Но там уже никого нет."
            );

        },
        6000
    );

}


// ============================================================
// MOVEMENT
// ============================================================

function updatePlayer(
    delta
) {

    let forward = 0;
    let strafe = 0;


    if (keys["w"])
        forward += 1;

    if (keys["s"])
        forward -= 1;

    if (keys["a"])
        strafe -= 1;

    if (keys["d"])
        strafe += 1;


    forward +=
        -moveY;

    strafe +=
        moveX;


    const length =
        Math.sqrt(
            forward * forward +
            strafe * strafe
        );


    if (length > 1) {

        forward /=
            length;

        strafe /=
            length;

    }


    const speed =
        3 * delta;


    // Теперь W = движение вперёд,
    // в сторону -Z

    const forwardX =
        Math.sin(
            player.rotationY
        );


    const forwardZ =
        -Math.cos(
            player.rotationY
        );


    const rightX =
        Math.cos(
            player.rotationY
        );


    const rightZ =
        Math.sin(
            player.rotationY
        );


    player.x +=
        (
            forwardX * forward +
            rightX * strafe
        ) * speed;


    player.z +=
        (
            forwardZ * forward +
            rightZ * strafe
        ) * speed;


    player.x =
        THREE.MathUtils.clamp(
            player.x,
            -4.2,
            4.2
        );


    player.z =
        THREE.MathUtils.clamp(
            player.z,
            -25,
            5.5
        );


    camera.position.set(
        player.x,
        player.y,
        player.z
    );


    camera.rotation.order =
        "YXZ";


    camera.rotation.y =
        player.rotationY;


    camera.rotation.x =
        player.rotationX;

}


// ============================================================
// ANIMATION
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(
        delta
    );


    // KEY ANIMATION

    if (
        keyObject &&
        keyObject.mesh.visible
    ) {

        keyObject.mesh.rotation.y +=
            delta * 2;


        keyObject.mesh.position.y =
            0.55 +
            Math.sin(
                performance.now() *
                0.004
            ) * 0.08;

    }


    // DOCTOR

    if (
        doctor &&
        doctor.visible
    ) {

        doctor.rotation.y =
            Math.sin(
                performance.now() *
                0.001
            ) * 0.05;

    }


    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    text
) {

    const message =
        document.getElementById(
            "message"
        );


    if (!message) {

        console.log(text);

        return;
    }


    message.innerText =
        text;


    message.style.opacity =
        "1";


    clearTimeout(
        window.messageTimeout
    );


    window.messageTimeout =
        setTimeout(
            () => {

                message.style.opacity =
                    "0";

            },
            4500
        );

}


// ============================================================
// DISTANCE
// ============================================================

function distance(
    x1,
    z1,
    x2,
    z2
) {

    const dx =
        x1 - x2;

    const dz =
        z1 - z2;


    return Math.sqrt(
        dx * dx +
        dz * dz
    );

}


// ============================================================
// RESIZE
// ============================================================

function resize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

}
