const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function FixedCamera() {
    let mvp = mat4.create()

    const projection = context => {
        const result = mat4.create()
        const aspect = context.canvas.clientWidth / context.canvas.clientHeight
        mat4.perspective(result, Math.PI/4, aspect, 1, 200)

        return result
    }

    const lookAt = () => {
        const result = mat4.create()
        mat4.lookAt(result, vec3.fromValues(0, 0, 3), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0))

        return result
    }

    this.calculateModelViewProjection = (context, world) => {
        const projectionView = mat4.create()
        mat4.multiply(projectionView, projection(context), lookAt())

        const modelViewProjection = mat4.create()
        mat4.multiply(modelViewProjection, projectionView, world)

        return modelViewProjection
    }

    this.initialize = (context, content) => {
    }
}

module.exports = FixedCamera
