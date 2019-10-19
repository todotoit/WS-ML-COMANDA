/* globals Meyda */
const context = new AudioContext();

navigator.mediaDevices.getUserMedia({audio: true})
  .then((stream) => {
    const microphone = context.createMediaStreamSource(stream);  
    if (typeof Meyda === "undefined") {
      console.log("Meyda could not be found! Have you included it?");
    }
    else {
      context.resume()
      const analyzer = Meyda.createMeydaAnalyzer({
        "audioContext": context,
        "source": microphone,
        "bufferSize": 512,
        "featureExtractors": ["mfcc"],
        "callback": features => {
          console.log(features.mfcc);
          //levelRangeElement.value = features.rms;
        }
      });
      analyzer.start();
    }
  });