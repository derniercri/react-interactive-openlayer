import React from 'react'
import PropTypes from 'prop-types'
import { chunk, get } from 'lodash'

import OLFeature from 'ol/feature'
import OLMap from 'ol/map'
import OLView from 'ol/view'

import OLPolygonGeom from 'ol/geom/polygon'

import OLDrawInteraction from 'ol/interaction/draw'

import OLTileLayer from 'ol/layer/tile'
import OLVectorLayer from 'ol/layer/vector'

import OLOSMSource from 'ol/source/osm'
import OLVectorSource from 'ol/source/vector'

import OLTransformInteraction from 'ol-ext/interaction/transform'

export const interactiveModes = [
  'rectangles',
  'polygons',
  'transformations',
]

class InteractiveMap extends React.Component {

  constructor(props) {
    super(props)

    this.id = Math.random().toString(36).substring(7)
  }

  componentDidMount() {
    this.vector = new OLVectorSource({ wrapX: false })

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

    this.rectangles = new OLDrawInteraction({
      source: this.vector,
      type: 'Circle',
      geometryFunction: OLDrawInteraction.createBox(),
    })

    this.polygons = new OLDrawInteraction({
      source: this.vector,
      type: 'Polygon',
    })

    this.transformations = new OLTransformInteraction({
      rotate: true,
    })

    this.props.initialVector.forEach(shape => {
      switch (shape.type) {
        case 'Polygon':
          return this.vectorLayer
            .getSource()
            .addFeature(new OLFeature(new OLPolygonGeom([ shape.coordinates ])))
      }
    })

    this.vector.on('change', ({ target }) => {
      const items = get(target, 'featuresRtree_.items_')

      this.props.onVectorChange(Object.keys(items).map(key => ({
        coordinates: chunk(get(items[key], 'value.values_.geometry.flatCoordinates'), 2),
        type: 'Polygon',
      })))
    })

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
  initialVector: PropTypes.array,
  onVectorChange: PropTypes.func,
  selectedMode: PropTypes.oneOf(interactiveModes),
  zoom: PropTypes.number,
}

InteractiveMap.defaultProps = {
  center: [ 0, 0 ],
  initialVector: [],
  onVectorChange: () => null,
  selectedMode: interactiveModes[0],
  zoom: 5,
}

export default InteractiveMap
