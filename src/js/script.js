
// Declaramos elementos del DOM
const $video = document.querySelector("#video"),
    $canvas = document.querySelector("#canvas"),
    $buttonAccess = document.querySelector("#button-access"),
    $buttonStopCamera = document.querySelector('#button-stop-camera'),
    $devicesList = document.querySelector("#devicesList"),
    $state = document.querySelector('#state'),
    $divSelect = document.querySelector('#divSelect'),
    $buttonCapture = document.querySelector('#button-capture'),
    $divVideo = document.getElementById('divVideo'),
    $divCanva = document.querySelector('#divCanva'),
    $buttonDownload = document.querySelector('#button-download');

let stream;


const stopStream = (streamDetected) => {
    if (streamDetected) {
        streamDetected.getTracks().forEach((track) => {
            console.log(track)
            track.stop();
        });
    }
}


const alertSupportVideo = (textContent) => {
    $state.classList.add('alert-danger', 'mt-4');
    $state.innerHTML = textContent;

    setTimeout(() => {
        $state.innerHTML = '';
        $state.classList.remove('alert-danger', 'mt-4');
    }, 3000);
}


const devicesVideo = (devicesList) => {
    const devicesVideo = [];

    if (devicesList.length !== 0 && devicesList !== '') {
        // Vamos a filtrarlos y guardar aquí los de vídeo
        devicesList.forEach((device) => {
            const type = device.kind;

            if (type === "videoinput") {
                devicesVideo.push(device);
            }
        });
    }

    return devicesVideo;
}


const hasSupportUserMedia = () =>
    (navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia) || navigator.webkitGetUserMedia || navigator.msGetUserMedia)


const getDevices = () => navigator.mediaDevices.enumerateDevices();


const _getUserMedia = (...arguments) =>
    (navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia) || navigator.webkitGetUserMedia || navigator.msGetUserMedia).apply(navigator, arguments);


const callCombo = (devicesVideo, idDevice) => {
    const _xDocFrag = document.createDocumentFragment();
    const option = document.createElement('option');
    let _node = null;

    // Llenar el select
    devicesVideo.forEach(device => {
        _node = option.cloneNode(false);
        _node.value = device.deviceId;
        _node.text = device.label;

        if (device.deviceId === idDevice) {
            _node.setAttribute('selected', 'selected');
        }

        _xDocFrag.appendChild(_node);
    });

    clearSelect();
    $devicesList.appendChild(_xDocFrag);
}


const clearSelect = () => {
    for (let x = $devicesList.options.length - 1; x >= 0; x--)
        $devicesList.remove(x);
};


const showStream = (idDevice) => {
    let photo;

    _getUserMedia({
        video: {
            deviceId: idDevice,
        }
    },
        (streamObtained) => {
            // Aquí ya tenemos permisos, ahora sí llenamos el select,
            // pues si no, no nos daría el nombre de los dispositivos

            getDevices()
                .then((devicesList) => {
                    if (devicesVideo(devicesList).length > 0) {
                        callCombo(devicesVideo(devicesList), idDevice);

                        $divSelect.classList.remove('hidden');
                        $divVideo.classList.remove('hidden');
                        $divCanva.classList.add('hidden');

                        // Escuchar cuando seleccionen otra opción y entonces llamar a esta función
                        $devicesList.onchange = () => {

                            // Detener el stream
                            stopStream(stream);

                            // Limpiamos el canvas
                            $canvas.width = $canvas.width;

                            // Mostrar el nuevo stream con el dispositivo seleccionado
                            showStream($devicesList.value);

                        }

                        // Simple asignación
                        stream = streamObtained;

                        // Mandamos el stream de la cámara al elemento de vídeo
                        $video.srcObject = stream;
                        $video.play();

                        //Escuchar el click del botón para tomar la foto
                        $buttonCapture.addEventListener("click", function () {

                            //Pausar reproducción
                            $video.pause();

                            $divCanva.classList.remove('hidden');

                            //Obtener contexto del canvas y dibujar sobre él
                            let contexto = $canvas.getContext("2d");
                            $canvas.width = $video.videoWidth;
                            $canvas.height = $video.videoHeight;
                            contexto.drawImage($video, 0, 0, $canvas.width, $canvas.height);

                            photo = $canvas.toDataURL(); //Esta es la foto, en base 64

                            //Reanudar reproducción
                            $video.play();
                        });

                        $buttonDownload.addEventListener('click', () => {
                            let enlace = document.createElement('a'); // Crear un <a>
                            enlace.download = "photo.png";
                            enlace.href = photo;

                            enlace.click();
                        });

                        $buttonStopCamera.addEventListener('click', () => {
                            // Apagamos cámara
                            stopStream(stream);

                            $canvas.width = $canvas.width;

                            $divVideo.classList.add('hidden');
                            $divCanva.classList.add('hidden');
                            $divSelect.classList.add('hidden');
                            $buttonStopCamera.classList.add('hidden');
                            $buttonAccess.classList.remove('hidden');
                        });
                    }
                })
                .catch(() => {

                });


        }, (error) => {
            console.log("Permiso denegado o error: ", error);

            alertSupportVideo('No se puede acceder a la cámara, o no diste permiso.');
        });
}


(() => {
    $buttonAccess.addEventListener('click', () => {
        $state.innerHTML = '';
        clearSelect();

        // Comenzamos viendo si tiene soporte
        if (!hasSupportUserMedia()) {
            alertSupportVideo("Parece que tu navegador no soporta esta característica. Intenta actualizarlo.");
            return;
        } else {
            // Comenzamos evaluamos si posee dispositivos de video
            getDevices()
                .then(devicesList => {
                    if (devicesVideo(devicesList).length > 0) {
                        $buttonAccess.classList.add('hidden');
                        $buttonStopCamera.classList.remove('hidden');

                        // Mostrar stream con el ID del primer dispositivo, luego el usuario puede cambiar
                        showStream(devicesList[0].deviceId);
                    } else {
                        alertSupportVideo('No se encontraron dispositivos de video disponibles.');
                    }
                });
        }
    });
})();
