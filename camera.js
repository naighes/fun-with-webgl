const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const quat = glmatrix.quat

function Camera(initialPosition, direction) {
    let mvp = mat4.create()
    let driving = false
    let cx = 0
    let cy = 0
    let xRot = 0.0
    let yRot = 0.0

    const initialDirection = dir

    let position = initialPosition
    let direction = vec3.create()
    let rotation = quat.create()

    const projection = context => {
        const result = mat4.create()
        const aspect = context.canvas.clientWidth/context.canvas.clientHeight
        mat4.perspective(result, Math.PI/4, aspect, 1, 200)

        return result
    }

    const lookAt = () => {
        const result = mat4.create()
        let center = vec3.create()
        vec3.add(center, position, direction)
        mat4.lookAt(result,
            position, // eye:    position of the viewer
            center, // center: point the viewer is looking at
            vec3.fromValues(0.0, 1.0, 0.0)) // vec3  : pointing up

        return result
    }

    this.calculateModelViewProjection = (context, world) => {
        const projectionView = mat4.create()
        mat4.multiply(projectionView, projection(context), lookAt())

        const modelViewProjection = mat4.create()
        mat4.multiply(modelViewProjection, projectionView, world)

        return modelViewProjection
    }

    const mousedown = e => {
        driving = true
        cx = event.clientX
        cy = event.clientY
    }

    const mouseup = e => {
        driving = false

        xRot = 0.0
        yRot = 0.0
    }

    const quaternion = quat.create()

    const mousemove = e => {
        const degToRad = value => value*Math.PI/180

        if (!driving) {
            return
        }

        const x = e.clientX
        const y = e.clientY

        const dx = x-cx
        const dy = y-cy

        xRot = degToRad(dy/10.0)
        yRot = degToRad(dx/10.0)

        cx = x
        cy = y
    }

    this.initialize = (context, content) => {
        vec3.copy(direction, initialDirection)

        context.canvas.onmousedown = mousedown
        document.onmouseup = mouseup
        document.onmousemove = mousemove
    }

    this.update = (context, time) => {
        const rx = quat.create()

        if (xRot !== 0.0) {
            quat.setAxisAngle(rx, vec3.fromValues(1.0, 0.0, 0.0), xRot)
        }

        const ry = quat.create()

        if (yRot !== 0.0) {
            quat.setAxisAngle(ry, vec3.fromValues(0.0, 1.0, 0.0), yRot)
        }

        const r = quat.create()
        quat.multiply(r, rx, ry)

        if (xRot !== 0.0 || yRot !== 0.0) {
            quat.multiply(rotation, rotation, r)
            direction = vec3.create()
            vec3.copy(direction, initialDirection)
            vec3.transformQuat(direction, direction, rotation)
            vec3.normalize(direction, direction)
        }
    }
}

module.exports = Camera
