//DEFAULTS
import TurnOn from './tracks/defaults/Turn on.json' with { type: 'json' };
import TurnOff from './tracks/defaults/Turn off.json' with { type: 'json' };
import boraOn from './tracks/defaults/Bora on.json' with { type: 'json'};
import boraOff from './tracks/defaults/Bora off.json' with { type: 'json'};
import boraBlink from './tracks/defaults/Bora blink.json' with { type: 'json'};
import whiteToBora from './tracks/defaults/White to Bora.json' with { type: 'json'};
import aquaTrans from './tracks/defaults/Aqua trans.json' with { type: 'json'};




//TRACK
//INTRO
import Intro from './tracks/00 - Intro.json' with { type: 'json' };

//01 HOOLIGAN
import Hooligan from './tracks/01 - Hooligan.json' with { type: 'json' };

//02 ALIENS
import Aliens from './tracks/02 - Aliens.json' with { type: 'json' };

//03 RUN BTS
import runBts from './tracks/03 - Run BTS.json' with { type: 'json' };

//04 THEY DON'T KNOW ABOUT US
import theyDontKnowAboutUs from './tracks/04 - they dont know about us.json' with { type: 'json' };

//05 LIKE ANIMALS + FAKE LOVE
import likeAnimalsFakeLove from './tracks/05 - Like animals + Fake Love.json' with { type: 'json' };

//06 INTRO + SWIM
import swim from './tracks/06 - Intro + Swim.json' with { type: 'json' };

//07 INTRO + SWIM
import merryGoRound from './tracks/07 - Intro + Merry Go Round + Outro.json' with { type: 'json' };

//08 2.0
import twoPointO from './tracks/08 - 2.0.json' with { type: 'json' };

//09 NORMAL
import normal from './tracks/09 - NORMAL.json' with { type: 'json' };

//10 Not Today
import notToday from './tracks/10 - Not Today.json' with { type: 'json' };

//11 MIC DROP + FYA + FIRE
import micDropFyaFire from './tracks/11 - MIC DROP + FYA + FIRE.json' with { type: 'json' };

//12 - BODY TO BODY
import bodyToBody from './tracks/12 - Body to body.json' with { type: 'json' };

//13 - IDOL + MARCHING STADIUM
import idol from './tracks/13 - IDOL + Marching Stadium.json' with { type: 'json' };

//14 - COME OVER
import comeOver from './tracks/14 - Come Over.json' with { type: 'json' };

//15 - BUTTER
import butter from './tracks/15 - Butter.json' with { type: 'json' };

//16 - DYNAMITE
import dynamite from './tracks/16 - Dynamite.json' with { type: 'json' };

//17 - PLEASE
import please from './tracks/17 - Please.json' with { type: 'json' };

//18 - INTO THE SUN + OUTRO
import intoTheSun from './tracks/18 - Into The Sun + Outro.json' with { type: 'json' };



const SERVICE_UUID = "0001fe01-0000-1000-8000-00805f9800c4";
const CHAR_UUID    = "0001ff01-0000-1000-8000-00805f9800c4";

const LED_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const LED_CHAR_UUID    = "0000fff3-0000-1000-8000-00805f9b34fb";

let characteristic;       // ARMY BOMB V4
let ledCharacteristic;    // Tira LED

// Color global state
let currentPayload = null;
let currentAnimation = null;
let currentTrackPlayer = null;

const opacityController = document.getElementById("opacityController");
const slideViewer = document.getElementById("slideLabel");
opacityController.addEventListener("input", ()=>{slideViewer.innerHTML = opacityController.value+"%"})
const logContainer = document.getElementById("logContainer");

class Animation {
    start() {}
    stop() {}
    update(deltaTime) {}
}

let lastTime = performance.now();

function animationLoop() {

    const now = performance.now();

    const deltaTime =
        now - lastTime;

    lastTime = now;

    if (currentAnimation) {
        currentAnimation.update(deltaTime);
    }

    if (currentTrackPlayer) {
        currentTrackPlayer.update();
    }

    requestAnimationFrame(animationLoop);
}


const trackInformation = document.getElementById("eventText");
class TrackPlayer {

    constructor(track) {

        this.track = this.normalizeTrack(track);

        this.index = 0;
        this.playing = false;
        this.startTime = 0;
    }

    normalizeTrack(track) {

        if (!track.length) return [];

        const offset = track[0].time;

        const normalized = track.map(event => ({
            ...event,
            time: event.time - offset
        }));

        return normalized.filter((event, index, arr) => {

            if (index === 0) return true;

            const prev = arr[index - 1];

            return (
                event.data[0] !== prev.data[0] ||
                event.data[1] !== prev.data[1] ||
                event.data[2] !== prev.data[2] ||
                event.data[3] !== prev.data[3]
            );
        });
    }

    play() {

        this.index = 0;
        this.startTime = performance.now();
        this.playing = true;

    }

    stop() {

        this.playing = false;
        this.index = 0;

    }

    update() {

        if (!this.playing) return;

        const elapsed =
            performance.now() - this.startTime;

        while (
            this.index < this.track.length &&
            this.track[this.index].time <= elapsed
        ) {

            const event =
                this.track[this.index];

            currentPayload = [...event.data];

            queuePayload(currentPayload);

            this.index++;
        }

        if (this.index >= this.track.length) {

            this.playing = false;
            trackInformation.innerHTML = "No event";

        }
    }
}

/*function log(msg) {
    document.getElementById("log").textContent += msg + "\n";
}*/

// --- Conexión ARMY BOMB V4 ---
document.getElementById("connect").onclick = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BTS_V4" }],
            optionalServices: [
                SERVICE_UUID,
                "0000180a-0000-1000-8000-00805f9b34fb"
            ]
        });

        //log("Conectando ARMY BOMB...");
        const server  = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        characteristic = await service.getCharacteristic(CHAR_UUID);
        //log("ARMY BOMB V4 conectado ✓");
        var card = document.createElement("div");
        card.classList.add("logCard");
        var errorLog = document.createElement("h4");
        errorLog.textContent = "ARMY BOMB V4 Conextada!";

        card.appendChild(errorLog);
        logContainer.appendChild(card);
        sendRGB(66, 0, 255, mode = 1);
    } catch (err) {
        //log("ERROR ARMY BOMB: " + err);
        var card = document.createElement("div");
        card.classList.add("logCard");
        var errorLog = document.createElement("h4");
        errorLog.textContent = err;

        card.appendChild(errorLog);
        logContainer.appendChild(card);
    }
};

// --- Conexión Tira LED ---
document.getElementById("connect-led").onclick = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "ELK-BLEDOM" }],
            optionalServices: [LED_SERVICE_UUID]
        });

        //log("Conectando tira LED...");
        const server  = await device.gatt.connect();
        const service = await server.getPrimaryService(LED_SERVICE_UUID);
        ledCharacteristic = await service.getCharacteristic(LED_CHAR_UUID);
        //log("Tira LED conectada ✓");
        var card = document.createElement("div");
        card.classList.add("logCard");
        var errorLog = document.createElement("h4");
        errorLog.textContent = "Tira LED Conectada";

        card.appendChild(errorLog);
        logContainer.appendChild(card);

    } catch (err) {
        var card = document.createElement("div");
        card.classList.add("logCard");
        var errorLog = document.createElement("h4");
        errorLog.textContent = err;

        card.appendChild(errorLog);
        logContainer.appendChild(card);
    }
};

// --- BLE Loop ---
let latestPayload = null;
let sending = false;
const colorViewer = document.getElementById("colorViewer");


async function bleLoop() {

    if (sending) return;

    sending = true;

    while (true) {

        if (latestPayload) {

            const payload = latestPayload;

            latestPayload = null;

            const r = Math.floor(payload[0]*(opacityController.value/100));
            const g = Math.floor(payload[1]*(opacityController.value/100));
            const b = Math.floor(payload[2]*(opacityController.value/100));

            if (characteristic) {

                try {

                    await characteristic.writeValue(
                        new Uint8Array(payload)
                    );

                } catch (err) {

                    console.error(
                        "ARMY BOMB write error:",
                        err
                    );
                }
            }

            if (ledCharacteristic) {

                try {

                    const cmd =
                        new Uint8Array([
                            0x7E,
                            0x07,
                            0x05,
                            0x03,
                            r,
                            g,
                            b,
                            0x10,
                            0xEF
                        ]);

                    await ledCharacteristic.writeValue(cmd);

                } catch (err) {

                    console.error(
                        "LED write error:",
                        err
                    );
                }
            }

            console.log(r, g, b);
            console.log(opacityController.value/100)
            colorViewer.style.backgroundColor = "rgb("+r+", "+g+", "+b+")";
        }

        await new Promise(
            r => setTimeout(r, 15)
        );
    }
}

function queuePayload(payload) {
    latestPayload = [...payload];
}

// --- Color picker ---
document.getElementById("rgbColorPicker").addEventListener("input", (e)=>{
    const hex = e.target.value;

    queuePayload([
        parseInt(hex.substr(1, 2), 16),
        parseInt(hex.substr(3, 2), 16),
        parseInt(hex.substr(5, 2), 16),
        1
    ]);
})

async function sendRGB(r, g, b, mode = 1) {
    try {
        const data = new Uint8Array([r, g, b, mode]);
        if (characteristic)    await characteristic.writeValue(data);
        if (ledCharacteristic) {
            const cmd = new Uint8Array([0x7E, 0x07, 0x05, 0x03, r,g, b, 0x10, 0xEF]);
            await ledCharacteristic.writeValue(cmd);
        }

    } catch (error) {
        console.log("ERROR: " + error);
    }
}

//VIDEO PLAYER CONTROLLER
const video = document.getElementById('videoPlayer');
const mensajeDiv = document.getElementById('timerText');

video.addEventListener('timeupdate', () => {
          // 1. Obtener los segundos totales con decimales
          const segundosTotales = video.currentTime;

          // 2. Convertir a Minutos y Segundos enteros
          const minutos = Math.floor(segundosTotales / 60);
          const segundos = Math.floor(segundosTotales % 60);

          // 3. Formatear con ceros a la izquierda (ej. 02:12)
          const minutosFormateados = String(minutos).padStart(2, '0');
          const segundosFormateados = String(segundos).padStart(2, '0');
          const tiempoMMSS = `${minutosFormateados}:${segundosFormateados}`;

          // Ejemplo de uso: Ejecutar lógica basada estrictamente en el valor devuelto
          evaluarTiempoDelListener(tiempoMMSS);
          mensajeDiv.innerText = minutosFormateados + ":" + segundosFormateados;
        }
);


function evaluarTiempoDelListener(tiempo) {
  if (tiempo === "00:05") {
      currentTrackPlayer = new TrackPlayer(TurnOn);
      currentTrackPlayer.play();
      trackInformation.innerHTML = "Turning On";
  }
  if (tiempo === "15:57") {
      currentTrackPlayer = new TrackPlayer(TurnOff);
      currentTrackPlayer.play();
      trackInformation.innerHTML = "Turning Off";
  }
  if (tiempo === "16:13") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(Intro);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Intro";
        }, 500);
  }
  if (tiempo === "17:48") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(Hooligan);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Hooligan";
        }, 600);
  }
  if (tiempo === "20:58") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(Aliens);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Aliens";
        }, 50);
  }
  if (tiempo === "23:50") {
      currentTrackPlayer = new TrackPlayer(runBts);
      currentTrackPlayer.play();
      trackInformation.innerHTML = "Run BTS";
  }
  if (tiempo === "27:19") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(boraOn);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora On";
        }, 0);
  }
  if (tiempo === "30:19") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(boraBlink);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora Blink";
        }, 0);
  }
  if (tiempo === "30:49") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(boraOff);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora Off";
        }, 0);
  }
  if (tiempo === "30:53") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(theyDontKnowAboutUs);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "They don't know about us";
        }, 100);
  }
  if (tiempo === "33:43") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(likeAnimalsFakeLove);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Like animals + Fake Love";
        }, 600);
  }
  if (tiempo === "40:59") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(swim);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Intro + Swim";
        }, 650);
  }
  if (tiempo === "44:49") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(merryGoRound);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Intro + Merry Go Round + Outro";
        }, 300);
  }
  if (tiempo === "62:07") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(twoPointO);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "2.0";
        }, 250);
  }
  if (tiempo === "65:01") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(normal);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "NORMAL";
        }, 800);
  }
  if (tiempo === "68:10") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(boraOn);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora On";
        }, 0);
  }
  if (tiempo === "70:18") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(boraOff);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora Off";
        }, 0);
  }
  if (tiempo === "70:21") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(notToday);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Not Today";
        }, 600);
  }
  if (tiempo === "73:59") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(micDropFyaFire);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "MIC DROP + FYA + FIRE";
        }, 0);
  }
  if (tiempo === "85:08") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(bodyToBody);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Body to Body";
        }, 600);
  }
  if (tiempo === "88:27") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(idol);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "IDOL + Marching Stadium";
        }, 500);
  }
  if (tiempo === "97:00") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(TurnOn);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Turning On";
        }, 0);
  }
  if (tiempo === "105:45") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(aquaTrans);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "VCR Transition 1";
        }, 0);
  }
  if (tiempo === "107:22") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(comeOver);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Come Over";
        }, 700);
  }
  if (tiempo === "111:08") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(boraOn);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora On";
        }, 0);
  }
  if (tiempo === "112:53") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(butter);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Butter";
        }, 800);
  }
  if (tiempo === "115:45") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(dynamite);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Dynamite";
        }, 0);
  }
  if (tiempo === "119:08") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(whiteToBora);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora On";
        }, 0);
  }
  if (tiempo === "143:09") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(please);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Please";
        }, 300);
  }
  if (tiempo === "146:06") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(intoTheSun);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Into The Sun + Outro";
        }, 800);
  }
  if (tiempo === "152:19") {
      setTimeout(() => {
        currentTrackPlayer = new TrackPlayer(whiteToBora);
        currentTrackPlayer.play();
        trackInformation.innerHTML = "Bora On";
        }, 0);
  }
}



bleLoop();
animationLoop();


/*
(() => {

    const playlist = [];
    const startTime = performance.now();

    let lastColor = "";

    function parseRGB(rgbString) {

        const match = rgbString.match(
            /rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/
        );

        if (!match) return null;

        return [
            parseInt(match[1]),
            parseInt(match[2]),
            parseInt(match[3])
        ];
    }

    function captureColor() {

        const colorBulk =
            document.getElementById("colorBulk");

        if (!colorBulk) return;

        const rgb =
            colorBulk.style.backgroundColor;

        if (!rgb) return;

        if (rgb === lastColor) return;

        lastColor = rgb;

        const values = parseRGB(rgb);

        if (!values) return;

        playlist.push({
            time: Math.round(
                performance.now() - startTime
            ),
            uuid:
                "0001ff01-0000-1000-8000-00805f9800c4",
            data: [
                values[0],
                values[1],
                values[2],
                1
            ]
        });
    }

    const captureInterval =
        setInterval(captureColor, 10);

    window.BLERecorder = {

        getData() {
            return playlist;
        },

        clear() {

            playlist.length = 0;
            lastColor = "";

            console.log(
                "Captura limpiada"
            );
        },

        stop() {

            clearInterval(
                captureInterval
            );

            console.log(
                "Captura detenida"
            );
        },

        download(
            filename =
            "color_playlist.json"
        ) {

            const blob = new Blob(
                [
                    JSON.stringify(
                        playlist,
                        null,
                        2
                    )
                ],
                {
                    type:
                    "application/json"
                }
            );

            const a =
                document.createElement("a");

            a.href =
                URL.createObjectURL(blob);

            a.download =
                filename;

            a.click();

            URL.revokeObjectURL(
                a.href
            );
        }
    };

    console.log(
        "Color Recorder iniciado"
    );

})();

BLERecorder.download()
*/