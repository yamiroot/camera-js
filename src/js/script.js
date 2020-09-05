// Declaramos elementos del DOM
const $video = document.querySelector("#video"),
    $canvas = document.querySelector("#canvas"),
    $buttonAccess = document.querySelector("#button-access"),
    $devicesList = document.querySelector("#devicesList"),
    $state = document.querySelector('#state'),
    $divSelect = document.querySelector('#divSelect'),
    $buttonCapture = document.querySelector('#button-capture'),
    $divVideo = document.getElementById('divVideo'),
    $divCanva = document.querySelector('divCanva'),
    $buttonDownload = document.querySelector('#button-download');

let stream;


const alertSupportVideo = (textContent) => {
    $state.classList.add('alert-danger');
    $state.innerHTML = textContent;

    setTimeout(() => {
        $state.innerHTML = '';
        $state.classList.remove('alert-danger');
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


const callCombo = (devicesVideo) => {
    const option = document.createElement('option');
    let _node = null;

    // Llenar el select
    devicesVideo.forEach(device => {
        _node = option.cloneNode(false);
        _node.value = device.deviceId;
        _node.text = device.label;

        $devicesList.appendChild(_node);
    });
}


const clearSelect = () => {
    for (let x = $devicesList.options.length - 1; x >= 0; x--)
        $devicesList.remove(x);
};


// La función que es llamada después de que ya se dieron los permisos
// Lo que hace es llenar el select con los dispositivos obtenidos
const llenarSelectConDispositivosDisponibles = () => {

    getDevices()
        .then(dispositivos => {
            console.log(dispositivos);

            const dispositivosDeVideo = [];

            dispositivos.forEach(dispositivo => {
                const tipo = dispositivo.kind;

                if (tipo === "videoinput") {
                    dispositivosDeVideo.push(dispositivo);
                }
            });

            // Vemos si encontramos algún dispositivo, y en caso de que si, entonces llamamos a la función
            if (dispositivosDeVideo.length > 0) {
                // Llenar el select
                dispositivosDeVideo.forEach(dispositivo => {
                    const option = document.createElement('option');
                    option.value = dispositivo.deviceId;
                    option.text = dispositivo.label;

                    $listaDeDispositivos.appendChild(option);
                });
            }
        });
}


const showStream = (idDevice) => {
    let photo;

    _getUserMedia({
        video: {
            deviceId: idDevice,
        }
    },
        (streamObtained) => {
            clearSelect();

            // Aquí ya tenemos permisos, ahora sí llenamos el select,
            // pues si no, no nos daría el nombre de los dispositivos

            getDevices()
                .then((devicesList) => {
                    if (devicesVideo(devicesList).length > 0) {
                        callCombo(devicesVideo(devicesList));

                        $divSelect.classList.remove('hidden');
                        $divVideo.classList.remove('hidden');

                        // Escuchar cuando seleccionen otra opción y entonces llamar a esta función
                        $devicesList.onchange = () => {
                            // Detener el stream
                            if (stream) {
                                stream.getTracks().forEach(function (track) {
                                    track.stop();
                                });
                            }

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
                    }
                })
                .catch(() => {

                });


        }, (error) => {
            console.log("Permiso denegado o error: ", error);

            $state.classList.add('alert-danger');
            $state.innerHTML = "No se puede acceder a la cámara, o no diste permiso.";
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
                    console.log(devicesList);

                    if (devicesVideo(devicesList).length > 0) {
                        // Mostrar stream con el ID del primer dispositivo, luego el usuario puede cambiar
                        showStream(devicesList[1].deviceId);
                    } else {
                        alertSupportVideo('No se encontraron dispositivos de video disponibles.');
                    }
                });
        }
    });
})();

