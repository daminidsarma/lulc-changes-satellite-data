// Load TIFF file as an image asset for the year 2015
var image2015 = ee.Image("projects/ee-lab5-ce671/assets/2023");
print('Loaded 2015 image', image2015);

// Display the true color and false color composites
Map.centerObject(image2015, 10);  // Center map on the image
Map.addLayer(image2015, {bands: ['b3', 'b2', 'b1'], min: 0, max: 5000}, 'True Color Composite');
Map.addLayer(image2015, {bands: ['b4', 'b3', 'b2'], min: 0, max: 5000}, 'False Color Composite');

// Load training data with the new numeric label column
var trainingData = ee.FeatureCollection("projects/ee-lab5-ce671/assets/Training_2023");
print('Training data', trainingData);
print('Properties of GT_2023 features', trainingData.first());

// Load test data for accuracy assessment
var testData = ee.FeatureCollection("projects/ee-lab5-ce671/assets/Test_2023");
print('Test data', testData);
print('Properties of GT_Test features', testData.first());

// Select relevant bands for training
var bands = ['b1', 'b2', 'b3', 'b4'];
var training = image2015.select(bands).sampleRegions({
  collection: trainingData,
  properties: ['Labels'],  // Use the new numeric 'Labels' column
  scale: 10  // Adjust scale if necessary
});
print('Prepared training data', training);

// Define color palette for visualization
var palette = ['#008000', '#FFFF00', '#808080', '#000000'];

// 1. CART Classifier
var cartClassifier = ee.Classifier.smileCart().train({
  features: training,
  classProperty: 'Labels',  // Use 'Labels' as the class property
  inputProperties: bands
});

var classifiedCart = image2015.select(bands).classify(cartClassifier);
Map.addLayer(classifiedCart, {min: 0, max: 3, palette: palette}, 'CART Classification Results');

// CART accuracy assessment
var testCart = classifiedCart.sampleRegions({
  collection: testData,
  properties: ['Labels'],
  scale: 10
});
var testConfusionMatrixCart = testCart.errorMatrix('Labels', 'classification');
print('Confusion Matrix for CART', testConfusionMatrixCart);
print('Test Accuracy for CART', testConfusionMatrixCart.accuracy());

// 2. SVM Classifier
var svmClassifier = ee.Classifier.libsvm().train({
  features: training,
  classProperty: 'Labels',
  inputProperties: bands
});

var classifiedSVM = image2015.select(bands).classify(svmClassifier);
Map.addLayer(classifiedSVM, {min: 0, max: 3, palette: palette}, 'SVM Classification Results');

// SVM accuracy assessment
var testSVM = classifiedSVM.sampleRegions({
  collection: testData,
  properties: ['Labels'],
  scale: 10
});
var testConfusionMatrixSVM = testSVM.errorMatrix('Labels', 'classification');
print('Confusion Matrix for SVM', testConfusionMatrixSVM);
print('Test Accuracy for SVM', testConfusionMatrixSVM.accuracy());

// 3. Minimum Distance Classifier
var minDistClassifier = ee.Classifier.minimumDistance().train({
  features: training,
  classProperty: 'Labels',
  inputProperties: bands
});

var classifiedMinDist = image2015.select(bands).classify(minDistClassifier);
Map.addLayer(classifiedMinDist, {min: 0, max: 3, palette: palette}, 'Minimum Distance Classification Results');

// Minimum Distance accuracy assessment
var testMinDist = classifiedMinDist.sampleRegions({
  collection: testData,
  properties: ['Labels'],
  scale: 10
});
var testConfusionMatrixMinDist = testMinDist.errorMatrix('Labels', 'classification');
print('Confusion Matrix for Minimum Distance', testConfusionMatrixMinDist);
print('Test Accuracy for Minimum Distance', testConfusionMatrixMinDist.accuracy());
