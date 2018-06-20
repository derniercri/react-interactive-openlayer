# React Interactive OpenLayer

## Usage

`$ npm install react-interactive-openlayer --save`

or

`$ yarn add react-interactive-openlayer`

Require it in your file

`import InteractiveMap from 'react-interactive-openlayer'`

## Properties

| Prop name | Type | Default value | Description | 
| --- | :---: | :---: | --- |
| defaultCoordinates | arrayOf(number) | `[0, 0]` | Default coordinates to center the map on first load | 
| defaultZoom | number | 5 | Default zoom level | 
| onVectorChange | function | `() => null` | Function to trigger when a new shape is drawn on the map. Returns an array of [GeoJSON objects](https://tools.ietf.org/html/rfc7946#section-3) | 
| selectedMode | oneOf(polygons, rectangle, transform) | polygons | Selected drawing mode | 
