import AgoraRTC from "agora-rtc-sdk-ng";

let rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
    client: null,
};

let options = {
    appId: "310dc1e1cf47482c84faae11a16ab3e2", // Your app ID
    channel: "sahaya",      // Channel name
    token: "007eJxTYFCYHG+194PW2l3Tp2W9XJPqxJ1Umfr3dmjldasXy80XlqYrMBgbGqQkG6YaJqeZmJtYGCVbmKQlJqYaGiYamiUmGacabQmKSW8IZGT4GGTCyMgAgSA+G0NxYkZiZSIDAwDliCFQ", // Temp token
    uid: 123456,          // User ID
};

// Initialize the AgoraRTC client
function initializeClient() {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
}

// Handle remote user events
function setupEventListeners() {
    rtc.client.on("user-published", async (user, mediaType) => {
        console.log(`User ${user.uid} published media: ${mediaType}`);
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");

        if (mediaType === "video") {
            displayRemoteVideo(user);
        }

        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });

    rtc.client.on("user-unpublished", (user) => {
        console.log(`User ${user.uid} unpublished media`);
        const remotePlayerContainer = document.getElementById(user.uid);
        remotePlayerContainer && remotePlayerContainer.remove();
    });
}

// Display remote video
function displayRemoteVideo(user) {
    if (user.videoTrack) {
        const remoteVideoTrack = user.videoTrack;
        const remotePlayerContainer = document.createElement("div");
        remotePlayerContainer.id = user.uid.toString();
        remotePlayerContainer.textContent = `Remote user ${user.uid}`;
        remotePlayerContainer.style.width = "640px";
        remotePlayerContainer.style.height = "480px";
        document.body.append(remotePlayerContainer);
        remoteVideoTrack.play(remotePlayerContainer);
        console.log("Remote video track played");
    } else {
        console.log(`No video track found for user ${user.uid}`);
    }
}

// Join a channel and publish local media
async function joinChannel() {
    await rtc.client.join(options.appId, options.channel, options.token, options.uid);
    await createAndPublishLocalTracks();
    displayLocalVideo();
    console.log("Publish success!");
}

// Publish local audio and video tracks
async function createAndPublishLocalTracks() {
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
}

// Display local video
function displayLocalVideo() {
    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.id = options.uid;
    localPlayerContainer.textContent = `Local user ${options.uid}`;
    localPlayerContainer.style.width = "640px";
    localPlayerContainer.style.height = "480px";
    document.body.append(localPlayerContainer);
    rtc.localVideoTrack.play(localPlayerContainer);
}

// Leave the channel and clean up
async function leaveChannel() {
    // Close local tracks
    rtc.localAudioTrack.close();
    rtc.localVideoTrack.close();

    // Remove local video container
    const localPlayerContainer = document.getElementById(options.uid);
    localPlayerContainer && localPlayerContainer.remove();

    // Remove all remote video containers
    rtc.client.remoteUsers.forEach((user) => {
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
    });

    // Leave the channel
    await rtc.client.leave();
}

// Set up button click handlers
function setupButtonHandlers() {
    document.getElementById("join").onclick = joinChannel;
    document.getElementById("leave").onclick = leaveChannel;
}

// Start the basic call
function startBasicCall() {
    initializeClient();
    window.onload = setupButtonHandlers;
}

startBasicCall();
