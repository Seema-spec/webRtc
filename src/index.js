const myElement = document.getElementById("showVideo");
const video = document.querySelector('video');// for getting all video tracks connected to your system.

function myFunction() {
    console.log(document.getElementById("showVideo")); 
    const constraints = {
        'video': true,
        'audio': true
    }
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            window.stream = stream; // make variable available to browser console
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
        });          
  }

  function screenShots() {
    console.log("screenShots button click");
    const canvas = document.querySelector('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0,0,canvas.width, canvas.height)
  }
