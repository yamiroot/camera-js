// Declaramos elementos del DOM
const $video = document.querySelector("#video"),
    $canvas = document.querySelector("#canvas"),
    $buttonAccess = document.querySelector("#button-access"),
    $devicesList = document.querySelector("#devicesList"),
    $state = document.querySelector('#state'),
    $divSelect = document.querySelector('#divSelect');


const hasSupportUserMedia = () =>
    (navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia) || navigator.webkitGetUserMedia || navigator.msGetUserMedia)


const getDevices = () => navigator.mediaDevices.enumerateDevices();


const _getUserMedia = (...arguments) =>
    (navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia) || navigator.webkitGetUserMedia || navigator.msGetUserMedia).apply(navigator, arguments);


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


const showStream = idDevice => {
    _getUserMedia({
        video: {
            // Justo aquí indicamos cuál dispositivo usar
            deviceId: idDevice,
        }
    },
        (streamObtenido) => {
            // Aquí ya tenemos permisos, ahora sí llenamos el select,
            // pues si no, no nos daría el nombre de los dispositivos
            llenarSelectConDispositivosDisponibles();

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
            stream = streamObtenido;

            // Mandamos el stream de la cámara al elemento de vídeo
            $video.srcObject = stream;
            $video.play();

            //Escuchar el click del botón para tomar la foto
            $boton.addEventListener("click", function () {

                //Pausar reproducción
                $video.pause();

                //Obtener contexto del canvas y dibujar sobre él
                let contexto = $canvas.getContext("2d");
                $canvas.width = $video.videoWidth;
                $canvas.height = $video.videoHeight;
                contexto.drawImage($video, 0, 0, $canvas.width, $canvas.height);

                let foto = $canvas.toDataURL(); //Esta es la foto, en base 64

                let enlace = document.createElement('a'); // Crear un <a>
                enlace.download = "foto_parzibyte.me.png";
                enlace.href = foto;
                enlace.click();
                //Reanudar reproducción
                $video.play();
            });
        }, (error) => {
            console.log("Permiso denegado o error: ", error);
            $state.innerHTML = "No se puede acceder a la cámara, o no diste permiso.";
        });
}


(() => {
    $buttonAccess.addEventListener('click', () => {

        // Comenzamos viendo si tiene soporte
        if (!hasSupportUserMedia()) {
            $state.innerHTML = "Parece que tu navegador no soporta esta característica. Intenta actualizarlo.";
            $state.classList.add('alert-danger');

            setTimeout(() => {
                $state.innerHTML = '';
                $state.classList.remove('alert-danger');
            }, 3000);

            return;
        } else {
            clearSelect();

            $divSelect.classList.remove('hidden');

            // Comenzamos pidiendo los dispositivos
            getDevices()
                .then(devices => {
                    console.log(devices)
                    if (devices.length !== 0 && devices !== '') {
                        // Vamos a filtrarlos y guardar aquí los de vídeo
                        const devicesVideo = [];

                        // Recorrer y filtrar
                        devices.forEach((device) => {
                            const type = device.kind;

                            if (type === "videoinput") {
                                devicesVideo.push(device);
                            }
                        });

                        // Vemos si encontramos algún dispositivo, y en caso de que si, entonces llamamos a la función
                        // y le pasamos el id de dispositivo
                        if (devicesVideo.length > 0) {
                            // Mostrar stream con el ID del primer dispositivo, luego el usuario puede cambiar
                            /* showStream(devicesVideo[0].deviceId); */
                            const option = document.createElement('option');
                            let _node = null;
                           
                            console.log(devicesVideo.length)
                            if (devicesVideo.length === 1) {
                                _node = option.cloneNode(false);
                                _node.value = '';
                                _node.text = 'Seleccione';
                                _node.setAttribute('selected', 'selected');

                                $devicesList.appendChild(_node); 
                            } 

                            // Llenar el select
                            devicesVideo.forEach(device => {
                                _node = option.cloneNode(false);
                                _node.value = device.deviceId;
                                _node.text = device.label;

                                $devicesList.appendChild(option);
                            });
                        }
                    }
                });
        }
    });
})();

