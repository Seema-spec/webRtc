
const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);

let startTime;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let video1;
let video2;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

function getName(pc) {
    return (pc === video1) ? 'video1' : 'video2';
}

function getOtherPc(pc) {
    return (pc === video1) ? video2 : video1;
}

async function start() {
    console.log('Requesting local stream');
    startButton.disabled = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('Received local stream');
        localVideo.srcObject = stream;
        localStream = stream;
        callButton.disabled = false;
    } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
    }
}

async function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    startTime = window.performance.now();
    const configuration = {};
    video1 = new RTCPeerConnection(configuration);
    video1.addEventListener('icecandidate', e => onIceCandidate(video1, e));
    video2 = new RTCPeerConnection(configuration);
    video2.addEventListener('icecandidate', e => onIceCandidate(video2, e));
    video1.addEventListener('iceconnectionstatechange', e => onIceStateChange(video1, e));
    video2.addEventListener('iceconnectionstatechange', e => onIceStateChange(video2, e));
    video2.addEventListener('track', gotRemoteStream);

    localStream.getTracks().forEach(track => video1.addTrack(track, localStream));
    console.log('Added local stream to video1');

    try {
        console.log('video1 createOffer start');
        const offer = await video1.createOffer(offerOptions);
        await onCreateOfferSuccess(offer);
    } catch (e) {
        onCreateSessionDescriptionError(e);
    }
}

function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

async function onCreateOfferSuccess(desc) {
    console.log(`Offer from video1\n${desc.sdp}`);
    console.log('video1 setLocalDescription start');
    try {
        await video1.setLocalDescription(desc);
    } catch (e) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }

    console.log('video2 setRemoteDescription start');
    try {
        await video2.setRemoteDescription(desc);
    } catch (e) {
        console.log(`Failed to set session description: ${e.toString()}`);
    }

    console.log('video2 createAnswer start');
    try {
        const answer = await video2.createAnswer();
        await onCreateAnswerSuccess(answer);
    } catch (e) {
        onCreateSessionDescriptionError(e);
    }
}
function gotRemoteStream(e) {
    if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        console.log('video2 received remote stream');
    }
}

async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from video2:\n${desc.sdp}`);
    console.log('video2 setLocalDescription start');
    try {
        await video2.setLocalDescription(desc);
    } catch (e) {
        console.log(`Failed to create session description: ${e.toString()}`);
    }
    console.log('video1 setRemoteDescription start');
    try {
        await video1.setRemoteDescription(desc);
    } catch (e) {
        console.log(`Failed to create session description: ${e.toString()}`);
    }
}

async function onIceCandidate(pc, event) {
    try {
        await (getOtherPc(pc).addIceCandidate(event.candidate));
        onAddIceCandidateSuccess(pc);
    } catch (e) {
        onAddIceCandidateError(pc, e);
    }
}

function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
    if (pc) {
        console.log('ICE state change event: ', event);
    }
}

function hangup() {
    console.log('Ending call');
    video1.close();
    video2.close();
    video1 = null;
    video2 = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
}