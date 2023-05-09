function measureNoise() {
  // Create an AudioContext object
  let audioContext = new AudioContext();

  // Create a MediaStreamSource from the user's microphone
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      let mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // Create a ScriptProcessorNode with a buffer size of 4096
      let scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      // Connect the mediaStreamSource to the scriptProcessor
      mediaStreamSource.connect(scriptProcessor);

      // Connect the scriptProcessor to the destination (the computer's speakers)
      scriptProcessor.connect(audioContext.destination);

      // Define a variable to store the noise level
      let noiseLevel = 0;

      // Define a function to calculate the noise level
      scriptProcessor.onaudioprocess = function (audioProcessingEvent) {
        // Get the input buffer (contains the audio samples)
        let inputBuffer = audioProcessingEvent.inputBuffer;

        // Loop through the samples and calculate the noise level
        for (let i = 0; i < inputBuffer.length; i++) {
          let sample = inputBuffer.getChannelData(0)[i];
          noiseLevel += Math.abs(sample);
        }
      };

      // Stop measuring the noise level after 3 seconds
      setTimeout(function () {
        // Calculate the average noise level
        noiseLevel /= audioContext.sampleRate * 3;

        // Convert the noise level to decibels (dB)
        let noiseLevelDB = 20 * Math.log10(noiseLevel);

        // Display the noise level in the HTML
        let noiseLevelElement = document.getElementById("noise-level");
        noiseLevelElement.innerHTML =
          "Noise level: " + noiseLevelDB.toFixed(2) + " dB";

        // Disconnect the nodes and stop the stream
        scriptProcessor.disconnect();
        mediaStreamSource.disconnect();
        stream.getTracks()[0].stop();
      }, 3000);
    })
    .catch(function (error) {
      console.log("Error accessing microphone:", error);
    });
}
