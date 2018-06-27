# React Interactive OpenLayer

## Usage

`$ npm install react-interactive-openlayer --save`

or

`$ yarn add react-interactive-openlayer`

Require it in your file

import InteractiveMap, { featuresToGeoJson, geoJsonToFeatures, interactiveModes } from 'react-interactive-openlayer'

## Component Properties

| Prop name | Type | Default value | Description | 
| --- | :---: | :---: | --- |
| center | arrayOf(number) | `[0, 0]` | Center of the map | 
| features | arrayOf([feature](http://openlayers.org/en/latest/apidoc/ol.Feature.html)) | `[]` | List of features |
| onFeaturesChange | function | `() => null` | Function to trigger when a new shape is drawn on the map. Returns an array of [features](http://openlayers.org/en/latest/apidoc/ol.Feature.html) | 
| selectedMode | oneOf(polygons, rectangle, transform) | polygons | Selected drawing mode | 
| zoom | number | 5 | Zoom level | 

## Component Methods

| Method name | Params | Description |
| --- | :---: | --- |
| `highlightFeature` | `(featureId)` | Highlights a feature on the map |
| `removeHighlights` |  | Remove all highlights on the map |

## Global Methods

### `featureToGeoJson`

Converts feature to GeoJSON

### `featuresToGeoJson`

Converts features to GeoJSON

### `geoJsonToFeatures`

Converts GeoJSON to features

## Global Variables

### `interactiveModes`

Array of all available modes (strings)
