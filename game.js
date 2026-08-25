// ============================================================
// THE VISION OF FEAR
// Demo 0.2
// Первый этаж — Приёмное отделение
// ============================================================

let scene;
let camera;
let renderer;

let flashlight;
let ambientLight;

let player = {
    x: 0,
    y: 1.65,
    z: 6,
    rotationY: 0,
    rotationX: 0
};

let moveX = 0;
let moveY = 0;

let keys = {};

let lastTouchX = null;
let lastTouchY = null;

let flashlightOn = true;

let hasKey = false;
let doorOpened = false;

let radioUsed = false;
let horrorStarted = false;
let doctorVisible = false;

let keyObject;
let doorObject;
let radioObject;
let doctorObject;

let lights = [];

let audioContext = null;

let clock = new THREE.Clock();


// ============================================================
// START
// ============================================================

document
    .getElementById("startButton")
    .addEventListener("click", startGame);


function startGame() {

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    createAudio();

    createGame();

    setTimeout(() => {

        showMessage(
            "02:17 AM\n\nБОЛЬНИЦА ЗАКРЫТА."
        );

        playLowSound();

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

    } catch (error) {

        console.log("Audio is not available.");

    }
}


function playTone(
    frequency = 120,
    duration = 0.2,
    volume = 0.05,
    type = "sine"
) {

    if (!audioContext)
        return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        0,
        audioContext.currentTime
    );

    gain.gain.linearRampToValueAtTime(
        volume,
        audioContext.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


function playLowSound() {

    playTone(
        65,
        1.2,
        0.08,
        "sine"
    );

}


function playDoorSound() {

    playTone(
        90,
        0.15,
        0.08,
        "square"
    );

    setTimeout(() => {

        playTone(
            55,
            0.4,
            0.05,
            "sine"
        );

    }, 120);

}


function playRadioSound() {

    playTone(
        800,
        0.05,
        0.025,
        "square"
    );

    setTimeout(() => {

        playTone(
            250,
            0.4,
            0.025,
            "sawtooth"
        );

    }, 80);

}


function playScareSound() {

    playTone(
        45,
        1.4,
        0.12,
        "sawtooth"
    );

    setTimeout(() => {

        playTone(
            110,
            0.7,
            0.06,
            "square"
        );

    }, 100);

}


// ============================================================
// CREATE GAME
// ============================================================

function createGame() {

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            0x020304
        );

    scene.fog =
        new THREE.Fog(
            0x020304,
            2,
            30
        );


    // --------------------------------------------------------
    // CAMERA
    // --------------------------------------------------------

    camera =
        new THREE.PerspectiveCamera(
            72,
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


    // --------------------------------------------------------
    // RENDERER
    // --------------------------------------------------------

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

    renderer.shadowMap.enabled = true;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    document
        .getElementById("game")
        .appendChild(
            renderer.domElement
        );


    // --------------------------------------------------------
    // LIGHT
    // --------------------------------------------------------

    ambientLight =
        new THREE.AmbientLight(
            0x6f7280,
            0.18
        );

    scene.add(
        ambientLight
    );


    // --------------------------------------------------------
    // FLOOR
    // --------------------------------------------------------

    const floorMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x292b30,

            roughness:
                1

        });


    const floor =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                10,
                0.2,
                34
            ),

            floorMaterial

        );


    floor.position.set(
        0,
        0,
        -10
    );

    scene.add(floor);


    // --------------------------------------------------------
    // WALL MATERIAL
    // --------------------------------------------------------

    const wallMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x44454a,

            roughness:
                1

        });


    // --------------------------------------------------------
    // LEFT WALL
    // --------------------------------------------------------

    const leftWall =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.3,
                3,
                34
            ),

            wallMaterial

        );


    leftWall.position.set(
        -5,
        1.5,
        -10
    );

    scene.add(leftWall);


    // --------------------------------------------------------
    // RIGHT WALL
    // --------------------------------------------------------

    const rightWall =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.3,
                3,
                34
            ),

            wallMaterial

        );


    rightWall.position.set(
        5,
        1.5,
        -10
    );

    scene.add(rightWall);


    // --------------------------------------------------------
    // CEILING
    // --------------------------------------------------------

    const ceiling =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                10,
                0.2,
                34
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


    // --------------------------------------------------------
    // FLOOR TILES
    // --------------------------------------------------------

    createFloorTiles();


    // --------------------------------------------------------
    // CEILING LIGHTS
    // --------------------------------------------------------

    createCeilingLight(
        0,
        4
    );

    createCeilingLight(
        0,
        -5
    );

    createCeilingLight(
        0,
        -14
    );

    createCeilingLight(
        0,
        -23
    );


    // --------------------------------------------------------
    // DOORS
    // --------------------------------------------------------

    createDoor(
        -4.82,
        1
    );

    createDoor(
        4.82,
        -4
    );

    createDoor(
        -4.82,
        -10
    );


    // --------------------------------------------------------
    // EXIT DOOR
    // --------------------------------------------------------

    doorObject =
        createExitDoor(
            0,
            -27
        );


    // --------------------------------------------------------
    // RADIO
    // --------------------------------------------------------

    radioObject =
        createRadio(
            -3.8,
            1.25,
            -9
        );


    // --------------------------------------------------------
    // KEY
    // --------------------------------------------------------

    keyObject =
        createKey(
            3.6,
            0.35,
            -4
        );


    // --------------------------------------------------------
    // WALL SIGNS
    // --------------------------------------------------------

    createSign(
        "ПРИЁМНОЕ\nОТДЕЛЕНИЕ",
        0,
        1.7,
        -1.8
    );


    createSign(
        "ЭТАЖ 01",
        4.7,
        1.8,
        -18
    );


    // --------------------------------------------------------
    // DOCTOR
    // --------------------------------------------------------

    doctorObject =
        createDoctor(
            0,
            -19
        );


    doctorObject.visible = false;


    // --------------------------------------------------------
    // FLASHLIGHT
    // --------------------------------------------------------

    flashlight =
        new THREE.SpotLight(
            0xdce7ff,
            3.2,
            18,
            Math.PI / 7,
            0.55,
            1.5
        );


    flashlight.position.set(
        0,
        0,
        0
    );


    flashlight.target.position.set(
        0,
        1,
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


    // --------------------------------------------------------
    // CONTROLS
    // --------------------------------------------------------

    setupControls();


    window.addEventListener(
        "resize",
        resize
    );


    animate();
}


// ============================================================
// FLOOR TILES
// ============================================================

function createFloorTiles() {

    const materialA =
        new THREE.MeshStandardMaterial({
            color: 0x292b30,
            roughness: 1
        });


    const materialB =
        new THREE.MeshStandardMaterial({
            color: 0x24262b,
            roughness: 1
        });


    for (
        let z = 6;
        z > -28;
        z -= 2
    ) {

        for (
            let x = -4;
            x <= 4;
            x += 2
        ) {

            const tile =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.9,
                        0.025,
                        1.9
                    ),

                    (
                        ((x + z) / 2) % 2 === 0
                        ? materialA
                        : materialB
                    )

                );


            tile.position.set(
                x,
                0.11,
                z
            );


            scene.add(tile);

        }
    }
}


// ============================================================
// CEILING LIGHT
// ============================================================

function createCeilingLight(
    x,
    z
) {

    const light =
        new THREE.PointLight(
            0xcbd4ff,
            1.7,
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


    const bulb =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.4,
                0.06,
                0.16
            ),

            new THREE.MeshBasicMaterial({
                color:
                    0xe8ebff
            })

        );


    bulb.position.copy(
        light.position
    );


    scene.add(
        bulb
    );
}


// ============================================================
// NORMAL DOOR
// ============================================================

function createDoor(
    x,
    z
) {

    const material =
        new THREE.MeshStandardMaterial({
            color:
                0x25262a,

            roughness:
                1
        });


    const door =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.12,
                2.3,
                1.5
            ),

            material

        );


    door.position.set(
        x,
        1.15,
        z
    );


    scene.add(
        door
    );
}


// ============================================================
// EXIT DOOR
// ============================================================

function createExitDoor(
    x,
    z
) {

    const frameMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0x16171a,

            roughness:
                1
        });


    const doorMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0x33343a,

            roughness:
                1
        });


    const frame =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                3,
                2.8,
                0.25
            ),

            frameMaterial

        );


    frame.position.set(
        x,
        1.4,
        z
    );


    scene.add(
        frame
    );


    const door =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.5,
                2.5,
                0.18
            ),

            doorMaterial

        );


    door.position.set(
        x,
        1.25,
        z - 0.15
    );


    scene.add(
        door
    );


    const sign =
        createSign(
            "7 ЭТАЖ",
            x,
            2.25,
            z - 0.35
        );


    return {

        mesh: door,

        sign: sign,

        x: x,

        z: z

    };
}


// ============================================================
// RADIO
// ============================================================

function createRadio(
    x,
    y,
    z
) {

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.8,
                0.45,
                0.35
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0x17181a,

                roughness:
                    1
            })

        );


    body.position.set(
        x,
        y,
        z
    );


    scene.add(
        body
    );


    const speaker =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.35,
                0.25,
                0.03
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0x08090a
            })

        );


    speaker.position.set(
        x - 0.15,
        y,
        z - 0.19
    );


    scene.add(
        speaker
    );


    return {
        mesh: body,
        x: x,
        y: y,
        z: z
    };
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


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                0.13,
                0.035,
                8,
                16
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0xb8a85d,

                metalness:
                    0.8,

                roughness:
                    0.3
            })

        );


    ring.rotation.x =
        Math.PI / 2;


    group.add(
        ring
    );


    const stick =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.35,
                0.045,
                0.045
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0xb8a85d,

                metalness:
                    0.8,

                roughness:
                    0.3
            })

        );


    stick.position.x =
        0.2;


    group.add(
        stick
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
// SIGN
// ============================================================

function createSign(
    text,
    x,
    y,
    z
) {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width = 512;
    canvas.height = 256;


    const ctx =
        canvas.getContext("2d");


    ctx.fillStyle =
        "#121316";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "#c6c7ca";


    ctx.font =
        "bold 42px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    const lines =
        text.split("\n");


    lines.forEach(
        (line, index) => {

            ctx.fillText(
                line,
                256,
                110 +
                index * 50
            );

        }
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    const material =
        new THREE.MeshBasicMaterial({
            map: texture
        });


    const sign =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                2.4,
                1.2
            ),

            material

        );


    sign.position.set(
        x,
        y,
        z
    );


    if (x < 0) {

        sign.rotation.y =
            Math.PI / 2;

    }


    if (x > 0) {

        sign.rotation.y =
            -Math.PI / 2;

    }


    scene.add(
        sign
    );


    return sign;
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


    // BODY

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                1.2,
                0.38
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0xeeeeea,

                roughness:
                    1
            })

        );


    body.position.y =
        1.15;


    group.add(
        body
    );


    // HEAD

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.28,
                8,
                8
            ),

            new THREE.MeshStandardMaterial({
                color:
                    0xaaa8a5,

                roughness:
                    1
            })

        );


    head.position.y =
        2.0;


    group.add(
        head
    );


    // ARMS

    const armMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0xdededa,

            roughness:
                1
        });


    const leftArm =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.18,
                1.1,
                0.2
            ),

            armMaterial

        );


    leftArm.position.set(
        -0.48,
        1.2,
        0
    );


    group.add(
        leftArm
    );


    const rightArm =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.18,
                1.1,
                0.2
            ),

            armMaterial

        );


    rightArm.position.set(
        0.48,
        1.2,
        0
    );


    group.add(
        rightArm
    );


    // LEGS

    const legMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0x202126,

            roughness:
                1
        });


    const leftLeg =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.22,
                0.9,
                0.22
            ),

            legMaterial

        );


    leftLeg.position.set(
        -0.18,
        0.45,
        0
    );


    group.add(
        leftLeg
    );


    const rightLeg =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.22,
                0.9,
                0.22
            ),

            legMaterial

        );


    rightLeg.position.set(
        0.18,
        0.45,
        0
    );


    group.add(
        rightLeg
    );


    // EYES

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color:
                0x050505
        });


    const leftEye =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.035,
                6,
                6
            ),

            eyeMaterial

        );


    leftEye.position.set(
        -0.09,
        2.04,
        -0.255
    );


    group.add(
        leftEye
    );


    const rightEye =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.035,
                6,
                6
            ),

            eyeMaterial

        );


    rightEye.position.set(
        0.09,
        2.04,
        -0.255
    );


    group.add(
        rightEye
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

    // --------------------------------------------------------
    // KEYBOARD
    // --------------------------------------------------------

    window.addEventListener(
        "keydown",
        function(event) {

            keys[event.key.toLowerCase()] =
                true;


            if (
                event.key.toLowerCase()
                === "e"
            ) {

                interaction();

            }


            if (
                event.key === "f"
            ) {

                toggleFlashlight();

            }

        }
    );


    window.addEventListener(
        "keyup",
        function(event) {

            keys[event.key.toLowerCase()] =
                false;

        }
    );


    // --------------------------------------------------------
    // JOYSTICK
    // --------------------------------------------------------

    const joystick =
        document.getElementById(
            "joystick"
        );


    const stick =
        document.getElementById(
            "joystickStick"
        );


    joystick.addEventListener(
        "touchmove",
        function(event) {

            event.preventDefault();


            const touch =
                event.touches[0];


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


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance > max
            ) {

                dx =
                    dx /
                    distance *
                    max;


                dy =
                    dy /
                    distance *
                    max;

            }


            stick.style.transform =
                `translate(${dx}px, ${dy}px)`;


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
        function() {

            moveX = 0;
            moveY = 0;

            stick.style.transform =
                "translate(0,0)";

        }
    );


    // --------------------------------------------------------
    // CAMERA
    // --------------------------------------------------------

    const lookArea =
        document.getElementById(
            "lookArea"
        );


    lookArea.addEventListener(
        "touchstart",
        function(event) {

            const touch =
                event.touches[0];


            lastTouchX =
                touch.clientX;


            lastTouchY =
                touch.clientY;

        },
        {
            passive: true
        }
    );


    lookArea.addEventListener(
        "touchmove",
        function(event) {

            event.preventDefault();


            const touch =
                event.touches[0];


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


    // --------------------------------------------------------
    // BUTTONS
    // --------------------------------------------------------

    document
        .getElementById(
            "flashlight"
        )
        .addEventListener(
            "click",
            toggleFlashlight
        );


    document
        .getElementById(
            "interact"
        )
        .addEventListener(
            "click",
            interaction
        );
}


// ============================================================
// FLASHLIGHT
// ============================================================

function toggleFlashlight() {

    flashlightOn =
        !flashlightOn;


    flashlight.visible =
        flashlightOn;


    if (flashlightOn) {

        showMessage(
            "Фонарик включён."
        );

        playTone(
            500,
            0.08,
            0.03,
            "square"
        );

    } else {

        showMessage(
            "Темнота."
        );

        playTone(
            100,
            0.1,
            0.03,
            "square"
        );

    }
}


// ============================================================
// INTERACTION
// ============================================================

function interaction() {

    if (!camera)
        return;


    const distanceToKey =
        distance(
            player.x,
            player.z,
            keyObject.x,
            keyObject.z
        );


    const distanceToRadio =
        distance(
            player.x,
            player.z,
            radioObject.x,
            radioObject.z
        );


    const distanceToDoor =
        distance(
            player.x,
            player.z,
            doorObject.x,
            doorObject.z
        );


    // --------------------------------------------------------
    // KEY
    // --------------------------------------------------------

    if (
        !hasKey &&
        distanceToKey < 2.0
    ) {

        collectKey();

        return;
    }


    // --------------------------------------------------------
    // RADIO
    // --------------------------------------------------------

    if (
        distanceToRadio < 2.2
    ) {

        useRadio();

        return;
    }


    // --------------------------------------------------------
    // EXIT DOOR
    // --------------------------------------------------------

    if (
        distanceToDoor < 2.5
    ) {

        useExitDoor();

        return;
    }


    showMessage(
        "Здесь нечего использовать."
    );
}


// ============================================================
// COLLECT KEY
// ============================================================

function collectKey() {

    hasKey =
        true;


    keyObject.mesh.visible =
        false;


    playTone(
        650,
        0.15,
        0.04,
        "sine"
    );


    showMessage(
        "Вы нашли ключ.\n\nНа брелоке написано: «7 ЭТАЖ»."
    );


    setTimeout(
        () => {

            showMessage(
                "Где-то далеко хлопнула дверь..."
            );

            playDoorSound();

        },
        3000
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


    playRadioSound();


    showMessage(
        "РАДИО:\n\n«...если ты это слышишь...»"
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
// EXIT DOOR
// ============================================================

function useExitDoor() {

    if (!hasKey) {

        playDoorSound();


        showMessage(
            "Дверь заперта.\n\nНужен ключ."
        );


        return;
    }


    if (doorOpened)
        return;


    doorOpened =
        true;


    playDoorSound();


    doorObject.mesh.rotation.y =
        -Math.PI / 2;


    showMessage(
        "Дверь открылась.\n\nЗа ней темно."
    );


    setTimeout(
        () => {

            showMessage(
                "Но до седьмого этажа ещё далеко..."
            );

        },
        3500
    );
}


// ============================================================
// HORROR EVENT
// ============================================================

function startHorror() {

    if (horrorStarted)
        return;


    horrorStarted =
        true;


    // Свет начинает мигать

    let flashes = 0;


    const flicker =
        setInterval(
            () => {

                lights.forEach(
                    light => {

                        light.visible =
                            !light.visible;

                    }
                );


                flashes++;


                if (
                    flashes >= 10
                ) {

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
            180
        );


    playScareSound();


    setTimeout(
        () => {

            doctorVisible =
                true;


            doctorObject.visible =
                true;


            doctorObject.position.set(
                0,
                0,
                -19
            );


            showMessage(
                "..."
            );

        },
        1700
    );


    setTimeout(
        () => {

            showMessage(
                "Кто-то стоит в конце коридора."
            );

        },
        3500
    );


    setTimeout(
        () => {

            doctorObject.visible =
                false;


            doctorVisible =
                false;


            playLowSound();


            showMessage(
                "..."
            );

        },
        6500
    );


    setTimeout(
        () => {

            showMessage(
                "Там никого нет."
            );

        },
        8000
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
// MESSAGE
// ============================================================

function showMessage(
    text
) {

    const message =
        document.getElementById(
            "message"
        );


    message.innerText =
        text;


    message.style.opacity =
        1;


    clearTimeout(
        window.messageTimer
    );


    window.messageTimer =
        setTimeout(
            () => {

                message.style.opacity =
                    0;

            },
            4500
        );
}


// ============================================================
// PLAYER MOVEMENT
// ============================================================

function updatePlayer(
    delta
) {

    if (!camera)
        return;


    let forward =
        0;


    let strafe =
        0;


    // Keyboard

    if (keys["w"])
        forward += 1;


    if (keys["s"])
        forward -= 1;


    if (keys["a"])
        strafe -= 1;


    if (keys["d"])
        strafe += 1;


    // Joystick

    forward +=
        -moveY;


    strafe +=
        moveX;


    const length =
        Math.sqrt(
            forward * forward +
            strafe * strafe
        );


    if (
        length > 1
    ) {

        forward /=
            length;


        strafe /=
            length;

    }


    const speed =
        3.0 * delta;


    // Direction

    const forwardX =
        Math.sin(
            player.rotationY
        );


    const forwardZ =
        Math.cos(
            player.rotationY
        );


    const rightX =
        Math.cos(
            player.rotationY
        );


    const rightZ =
        -Math.sin(
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


    // --------------------------------------------------------
    // BOUNDARIES
    // --------------------------------------------------------

    player.x =
        THREE.MathUtils.clamp(
            player.x,
            -4.2,
            4.2
        );


    player.z =
        THREE.MathUtils.clamp(
            player.z,
            -25.5,
            6
        );


    // --------------------------------------------------------
    // CAMERA
    // --------------------------------------------------------

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
// DOCTOR ANIMATION
// ============================================================

function updateDoctor(
    delta
) {

    if (
        !doctorVisible ||
        !doctorObject.visible
    )
        return;


    // Очень медленное покачивание

    doctorObject.rotation.y =
        Math.sin(
            performance.now() *
            0.0008
        ) * 0.04;


    // Иногда немного приближается

    if (
        distance(
            player.x,
            player.z,
            doctorObject.position.x,
            doctorObject.position.z
        ) < 8
    ) {

        doctorObject.position.z +=
            delta * 0.03;

    }
}


// ============================================================
// GAME LOOP
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


    updateDoctor(
        delta
    );


    // Анимация ключа

    if (
        keyObject &&
        keyObject.mesh.visible
    ) {

        keyObject.mesh.rotation.y +=
            delta * 2;


        keyObject.mesh.position.y =
            0.35 +
            Math.sin(
                performance.now() *
                0.003
            ) * 0.04;

    }


    // Если доктор виден —
    // немного затемняем атмосферу

    if (
        doctorVisible
    ) {

        ambientLight.intensity =
            0.08;

    } else {

        ambientLight.intensity =
            0.18;

    }


    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// RESIZE
// ============================================================

function resize() {

    if (
        !camera ||
        !renderer
    )
        return;


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


// ============================================================
// PREVENT MOBILE BROWSER BEHAVIOUR
// ============================================================

document.addEventListener(
    "touchmove",
    function(event) {

        if (
            event.target.closest(
                "#game"
            )
        ) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);
