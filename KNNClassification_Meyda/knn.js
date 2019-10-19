// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with poseNet. Built with p5.js
=== */
let microphone;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
const context = new AudioContext();

const IOsock = io('http://localhost:3004');
let poses = [];

function setup() {
  //const canvas = createCanvas(640, 480);

  // Create the UI buttons
  createButtons();
  buttonSetData = select('#load');
  buttonSetData.mousePressed(loadMyKNN);
  buttonGetData = select('#save');
  buttonGetData.mousePressed(saveMyKNN);

  navigator.mediaDevices.getUserMedia({audio: true})
  .then((stream) => {
    const microphone = context.createMediaStreamSource(stream);  
    if (typeof Meyda === "undefined") {
      console.log("Meyda could not be found! Have you included it?");
    }
    else {
      context.resume()
      modelReady()
      const analyzer = Meyda.createMeydaAnalyzer({
        "audioContext": context,
        "source": microphone,
        "bufferSize": 512,
        "featureExtractors": ["mfcc"],
        "callback": features => {
          //console.log(features.mfcc);
          poses = features.mfcc
          //levelRangeElement.value = features.rms;
        }
      });
      analyzer.start();
    }
  });
}

function draw() {

  // We can call both functions to draw all keypoints and the skeletons
}

function modelReady(){
  select('#status').html('model Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  //const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

  // Add an example with a label to the classifier
  knnClassifier.addExample(poses, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  //const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(poses, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "A" to the classifier
  buttonA = select('#addClassA');
  buttonA.mousePressed(function() {
    addExample('Silence');
  });

  // When the B button is pressed, add the current frame
  // from the video with a label of "B" to the classifier
  buttonB = select('#addClassB');
  buttonB.mousePressed(function() {
    addExample('Left');
  });

  buttonC = select('#addClassC');
  buttonC.mousePressed(function() {
    addExample('Right');
  });

  buttonD = select('#addClassD');
  buttonD.mousePressed(function() {
    addExample('Turn');
  });

  // Reset buttons
  resetBtnA = select('#resetA');
  resetBtnA.mousePressed(function() {
    clearLabel('Silence');
  });
	
  resetBtnB = select('#resetB');
  resetBtnB.mousePressed(function() {
    clearLabel('Left');
  });

  resetBtnC = select('#resetC');
  resetBtnC.mousePressed(function() {
    clearLabel('Right');
  });
	
  resetBtnD = select('#resetD');
  resetBtnD.mousePressed(function() {
    clearLabel('Turn');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);

  // Clear all classes button
  buttonClearAll = select('#clearAll');
  buttonClearAll.mousePressed(clearAllLabels);
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
      if (result.confidencesByLabel[result.label] && result.confidencesByLabel[result.label] > 0.75) IOsock.emit('audio', result.label)
    }

    select('#confidenceA').html(`${confidences['Silence'] ? confidences['Silence'] * 100 : 0} %`);
    select('#confidenceB').html(`${confidences['Left'] ? confidences['Left'] * 100 : 0} %`);
    select('#confidenceC').html(`${confidences['Right'] ? confidences['Right'] * 100 : 0} %`);
    select('#confidenceD').html(`${confidences['Turn'] ? confidences['Turn'] * 100 : 0} %`);
  }

  classify();
}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleA').html(counts['Silence'] || 0);
  select('#exampleB').html(counts['Left'] || 0);
  select('#exampleC').html(counts['Right'] || 0);
  select('#exampleD').html(counts['Turn'] || 0);
}

// Clear the examples in one label
function clearLabel(classLabel) {
  knnClassifier.clearLabel(classLabel);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
  knnClassifier.save('audioKNN');
}

// Load dataset to the classifier
function loadMyKNN() {
  knnClassifier.load('./audioKNN.json', updateCounts);
}