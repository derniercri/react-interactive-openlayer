import React from 'react'
import PropTypes from 'prop-types'

import { chunk, get } from 'lodash'

import OLFeature from 'ol/feature'
import OLMap from 'ol/map'
import OLView from 'ol/view'

import OLGeoJSON from 'ol/format/geojson'

import OLPolygon from 'ol/geom/polygon'

import OLDrawInteraction from 'ol/interaction/draw'

import OLTileLayer from 'ol/layer/tile'
import OLVectorLayer from 'ol/layer/vector'

import units from 'ol/proj/units'

import OLOSMSource from 'ol/source/osm'
import OLVectorSource from 'ol/source/vector'
import OLWMTSSource from 'ol/source/wmts'

import OLStyle from 'ol/style/style'
import OLStrokeStyle from 'ol/style/stroke'

import OLWMTSTileGrid from 'ol/tilegrid/wmts'

import OLTransformInteraction from 'ol-ext/interaction/transform'

const resolutions = [
  156543.03392804103,
  78271.5169640205,
  39135.75848201024,
  19567.879241005125,
  9783.939620502562,
  4891.969810251281,
  2445.9849051256406,
  1222.9924525628203,
  611.4962262814101,
  305.74811314070485,
  152.87405657035254,
  76.43702828517625,
  38.218514142588134,
  19.109257071294063,
  9.554628535647034,
  4.777314267823517,
  2.3886571339117584,
  1.1943285669558792,
  0.5971642834779396,
  0.29858214173896974,
  0.14929107086948493,
  0.07464553543474241,
]

export const interactiveModes = [
  'pins',
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
    this.view.on('change:center', () => this.props.onViewCenterChange(this.view.getCenter()))

    this.map = new OLMap({
      layers: [
        new OLTileLayer({
          source: this.props.IGNKey
            ? new OLWMTSSource({
              url: `https://wxs.ign.fr/${this.props.IGNKey}/geoportail/wmts`,
              layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
              matrixSet: 'PM',
              format: 'image/jpeg',
              style: 'normal',
              tileGrid: new OLWMTSTileGrid({
                origin: [ -20037508, 20037508 ], // topLeftCorner
                resolutions: resolutions, // résolutions
                matrixIds: [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19' ], // ids des TileMatrix
              }),
            })
            : new OLOSMSource(),
        }),
        this.vectorLayer,
      ],
      target: this.id,
      view: this.view,
    })

    // Interactions
    this.pins = new OLDrawInteraction({
      source: this.vector,
      type: 'Point',
    })
    this.pins.on('drawstart', e => this.setIdToFeature(e))

    this.polygons = new OLDrawInteraction({
      source: this.vector,
      type: 'Polygon',
    })
    this.polygons.on('drawstart', e => this.setIdToFeature(e))

    this.rectangles = new OLDrawInteraction({
      geometryFunction: OLDrawInteraction.createBox(),
      type: 'Circle',
    })
    this.rectangles.on('drawstart', e => this.setIdToFeature(e))

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
      case 'pins':
        return this.toggleToPinsMode()
      case 'polygons':
        return this.toggleToPolygonsMode()
      case 'rectangles':
        return this.toggleToRectanglesMode()
      case 'transformations':
        return this.toggleToTransformationsMode()
    }
  }

  setIdToFeature({ feature }) {
    feature.setId(this.vector.getFeatures().length)
  }

  createFeature(coordinates) {
    const feature = new OLFeature({
      geometry: new OLPolygon(coordinates),
    })

    this.setIdToFeature({ feature })
    this.vector.addFeature(feature)

    return feature
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

  toggleToPinsMode() {
    this.map.addInteraction(this.pins)
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
  IGNKey: PropTypes.oneOfType([ PropTypes.string, null ]),
  onFeaturesChange: PropTypes.func,
  onViewCenterChange: PropTypes.func,
  selectedMode: PropTypes.oneOf(interactiveModes),
  zoom: PropTypes.number,
}

InteractiveMap.defaultProps = {
  center: [ 0, 0 ],
  features: [],
  IGNKey: null,
  onFeaturesChange: () => null,
  onViewCenterChange: () => null,
  selectedMode: interactiveModes[0],
  zoom: 5,
}

export default InteractiveMap
