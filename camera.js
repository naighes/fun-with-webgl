const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function Camera(eye, center) {
    let mvp = mat4.create()
    let driving = false
    let cx = 0
    let cy = 0
    let xRot = 0.0
    let yRot = 0.0

    const projection = context => {
        const result = mat4.create()
        const aspect = context.canvas.clientWidth / context.canvas.clientHeight
        mat4.perspective(result, Math.PI/4, aspect, 1, 200)

        const ry = mat4.create()
        mat4.fromYRotation(ry, yRot)

        const rx = mat4.create()
        mat4.fromXRotation(rx, xRot)

        rotation = mat4.create()
        mat4.multiply(rotation, rx, ry)

        mat4.multiply(result, result, rotation)

        return result
    }

    const lookAt = () => {
        const result = mat4.create()
        mat4.lookAt(result,
            eye, // eye:    position of the viewer
            center, // center: point the viewer is looking at
            vec3.fromValues(0, 1, 0)) // vec3  : pointing up

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
    }

    const mousemove = e => {
        const degToRad = value => value*Math.PI/180

        if (!driving) {
            return
        }

        const x = e.clientX
        const y = e.clientY

        const dx = x - cx
        const dy = y - cy

        xRot += degToRad(dy/10.0)
        yRot += degToRad(dx/10.0)

        cx = x
        cy = y
    }

    this.initialize = (context, content) => {
        context.canvas.onmousedown = mousedown
        document.onmouseup = mouseup
        document.onmousemove = mousemove
    }

    this.update = (context, time) => {
    }
}

module.exports = Camera
