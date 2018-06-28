import React from 'react'
import PropTypes from 'prop-types'

import { chunk, get } from 'lodash'

import OLMap from 'ol/map'
import OLView from 'ol/view'

import OLGeoJSON from 'ol/format/geojson'

import OLDrawInteraction from 'ol/interaction/draw'

import OLTileLayer from 'ol/layer/tile'
import OLVectorLayer from 'ol/layer/vector'

import OLOSMSource from 'ol/source/osm'
import OLVectorSource from 'ol/source/vector'

import OLStyle from 'ol/style/style'
import OLStrokeStyle from 'ol/style/stroke'

import OLTransformInteraction from 'ol-ext/interaction/transform'

export const interactiveModes = [
  'polygons',
  'rectangles',
  'transformations',
]

const getCenterFromExtent = (extent) => {
  const newExtent = chunk(extent, 2)

  return [
    (get(newExtent, '0.0') + get(newExtent, '1.0')) / 2,
    (get(newExtent, '0.1') + get(newExtent, '1.1')) / 2,
  ]
}

const geoJson = new OLGeoJSON()

export const featureToGeoJson = feature =>
  geoJson.writeFeature(feature)

export const featuresToGeoJson = features =>
  geoJson.writeFeatures(features)

export const geoJsonToFeatures = json =>
  geoJson.readFeatures(json)


class InteractiveMap extends React.Component {

  constructor(props) {
    super(props)

    this.id = Math.random().toString(36).substring(7)
  }

  componentDidMount() {
    this.vector = new OLVectorSource({ wrapX: false })
    this.vector.on('change', () => this.props.onFeaturesChange(this.vector.getFeatures()))

    this.vectorLayer = new OLVectorLayer({
      source: this.vector,
    })

    this.view = new OLView({
      center: this.props.center,
      zoom: this.props.zoom,
    })

    this.map = new OLMap({
      layers: [
        new OLTileLayer({
          source: new OLOSMSource(),
        }),
        this.vectorLayer,
      ],
      target: this.id,
      view: this.view,
    })

    // Interactions
    this.rectangles = new OLDrawInteraction({
      geometryFunction: OLDrawInteraction.createBox(),
      source: this.vector,
      type: 'Circle',
    })
    this.rectangles.on('drawstart', e => this.setIdToFeature(e))

    this.polygons = new OLDrawInteraction({
      source: this.vector,
      type: 'Polygon',
    })
    this.polygons.on('drawstart', e => this.setIdToFeature(e))

    this.transformations = new OLTransformInteraction({
      rotate: true,
    })

    if (this.props.features) {
      this.vectorLayer
        .getSource()
        .addFeatures(this.props.features)
    }

    this.handleInteractionChange(this.props)
  }

  componentWillReceiveProps(newProps) {
    if (newProps.selectedMode !== this.props.selectedMode) {
      this.handleInteractionChange(newProps)
    }
    if (newProps.center !== this.props.center) {
      this.view.setCenter(newProps.center)
    }
    if (newProps.zoom !== this.props.zoom) {
      this.view.setZoom(newProps.zoom)
    }
  }

  handleInteractionChange(props) {
    this.removeInteractions()

    switch (props.selectedMode) {
      case 'rectangles':
        return this.toggleToRectanglesMode()
      case 'polygons':
        return this.toggleToPolygonsMode()
      case 'transformations':
        return this.toggleToTransformationsMode()
    }
  }

  setIdToFeature({ feature }) {
    feature.setId(this.vector.getFeatures().length)
  }

  highlightFeature(featureId) {
    this.vector.getFeatures().forEach(feature => {
      if (feature.getId() === featureId) {
        this.view.setCenter(getCenterFromExtent(feature.getGeometry().getExtent()))
        feature.setStyle(new OLStyle({
          stroke: new OLStrokeStyle({
            color: 'red',
            width: 5,
          }),
        }))
      } else {
        feature.setStyle(null)
      }
    })
  }

  removeHighlights() {
    this.vector.getFeatures().forEach(feature => feature.setStyle(null))
  }

  removeInteractions() {
    interactiveModes.forEach(mode =>
      this.map.removeInteraction(this[mode]))
  }

  toggleToPolygonsMode() {
    this.map.addInteraction(this.polygons)
  }

  toggleToRectanglesMode() {
    this.map.addInteraction(this.rectangles)
  }

  toggleToTransformationsMode() {
    this.map.addInteraction(this.transformations)
  }

  render() {
    return (
      <div
        id={this.id}
        style={{
          height: '100%',
        }}
      />)
  }

}

InteractiveMap.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  features: PropTypes.array,
  onFeaturesChange: PropTypes.func,
  selectedMode: PropTypes.oneOf(interactiveModes),
  zoom: PropTypes.number,
}

InteractiveMap.defaultProps = {
  center: [ 0, 0 ],
  features: [],
  onFeaturesChange: () => null,
  selectedMode: interactiveModes[0],
  zoom: 5,
}

export default InteractiveMap
