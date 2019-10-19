const button = [
  { id: 0, block: 'L' },
  { id: 1, block: '[]' },
  { id: 2, block: 'z' },
  // { id: 3, block: 'T' },
  // { id: 4, block: 'I' },
]

let init = function () {
  for (let i = 0; i < button.length; i++) {
    const container = document.createElement('div')
    const btnAdd = document.createElement("button")
    const btnRes = document.createElement("button")
    const count = document.createElement("p")
    const confidence = document.createElement("p")
    const counter = document.createElement("span")
    const value = document.createElement("span")
    btnAdd.setAttribute("id", "btn-add-" + i);
    btnAdd.innerHTML = "Add " + button[i].block;
    btnRes.innerHTML = "Reset";
    counter.setAttribute("id", "counter-" + i)
    count.innerHTML = button[i].block + " Examples "
    counter.innerHTML = '0'
    count.appendChild(counter)
    value.setAttribute("id", "value-" + i)
    confidence.innerHTML = 'Confidence ' + button[i].block + ' is '
    value.innerHTML = '0'
    confidence.appendChild(value)
    btnRes.setAttribute("id", "btn-res-" + i);
    count.setAttribute("id", "count-" + i);
    confidence.setAttribute("id", "confidence-" + i);
    container.setAttribute("id", "container-" + i)
    container.append(btnAdd, btnRes, count, confidence)
    const right = document.getElementById("right");
    right.append(container);
  }
}
init();

let video;
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  noCanvas();
  video = createCapture(VIDEO);
  video.parent('videoContainer');
  createButtons();
}

function modelReady() {
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  const features = featureExtractor.infer(video);
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  const features = featureExtractor.infer(video);
  knnClassifier.classify(features, gotResults);
}

function createButtons() {
  for (let i = 0; i < button.length; i++) {
    let btn = select("#btn-add-" + i)
    btn.mousePressed(function () {
      addExample(button[i].block)
    })
    let reset = select("#btn-res-" + i)
    reset.mousePressed(function () {
      clearLabel(button[i].block)
    })
  }
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);
  buttonClearAll = select('#clearAll');
  buttonClearAll.mousePressed(clearAllLabels);
  buttonSetData = select('#load');
  buttonSetData.mousePressed(loadMyKNN);
  buttonGetData = select('#save');
  buttonGetData.mousePressed(saveMyKNN);
}

// Show the results
function gotResults(err, result) {
  if (err) {
    // console.error(err);
  }
  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
    }
    for (let i = 0; i < button.length; i++) {
      select('#confidence-' + i).html(`${confidences[button[i].block] ? Math.floor(confidences[button[i].block] * 100) : 0}`)
      document.querySelector('#confidence-' + i).style.width = `${confidences[button[i].block] ? confidences[button[i].block] * 100 + "%" : 0 + "%"}`
    }
  }
  classify();

  


}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();
  for (let i = 0; i < button.length; i++) {
    select('#counter-' + i).html(counts[button[i].block] || 0)
  }
}

// Clear the examples in one label
function clearLabel(label) {
  knnClassifier.clearLabel(label);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
  knnClassifier.save('trained');
}

// Load dataset to the classifier
function loadMyKNN() {
  knnClassifier.load('./trained.json', updateCounts);
}
