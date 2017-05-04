const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const quat = glmatrix.quat

function Camera(position, target) {
    let driving = false
    let cx = 0
    let cy = 0
    let xMove = t => 0.0
    let zMove = t => 0.0
    let currentTarget = vec3.copy(vec3.create(), target)
    let view = mat4.lookAt(mat4.create(),
        position,
        target,
        vec3.fromValues(0.0, 1.0, 0.0))

    let rotationDelta = {
        pitch: (t, s) => 0.0,
        yaw: (t, s) => 0.0
    }

    const currentRotation = {
        pitch: 0.0,
        yaw: 0.0
    }

    const moveSpeed = 16.0
    const rotationSpeed = 20.0

    this.getProjection = context => {
        const result = mat4.create()
        const aspect = context.canvas.clientWidth/context.canvas.clientHeight
        mat4.perspective(result, Math.PI/4, aspect, 0.1, 200.0)

        return result
    }

    this.getView = () => view

    this.getPosition = () => vec3.copy(vec3.create(), position)

    this.getTarget = () => vec3.copy(vec3.create(), currentTarget)

    this.getWorldViewProjection = (context, world) => {
        const result = mat4.create()
        mat4.multiply(result, this.getProjection(context), this.getWorldView(world))

        return result
    }

    this.getWorldView = world => {
        const result = mat4.create()
        mat4.multiply(result, this.getView(), world)

        return result
    }

    const mousedown = e => {
        driving = true
        cx = event.clientX
        cy = event.clientY
    }

    const mouseup = e => {
        driving = false

        rotationDelta = {
            pitch: (t, s) => 0.0,
            yaw: (t, s) => 0.0
        }
    }

    const mousemove = e => {
        const degToRad = value => value*Math.PI/180

        if (!driving) {
            return
        }

        const x = e.clientX
        const y = e.clientY
        const dx = x-cx
        const dy = y-cy

        rotationDelta = {
            pitch: (t, s) => degToRad(dy*t*s),
            yaw: (t, s) => degToRad(dx*t*s)
        }

        cx = x
        cy = y
    }

    const keydown = e => {
        if (e.keyCode === 37) {
            // move left
            xMove = (t, s) => -1.0*t*s
        } if (e.keyCode === 38) {
            // move forward
            zMove = (t, s) => -1.0*t*s
        } if (e.keyCode === 39) {
            // move right
            xMove = (t, s) => 1.0*t*s
        } if (e.keyCode === 40) {
            // move backward
            zMove = (t, s) => 1.0*t*s
        }
    }

    const keyup = e => {
        if (e.keyCode === 37) {
            xMove = t => 0.0
        } if (e.keyCode === 38) {
            zMove = t => 0.0
        } if (e.keyCode === 39) {
            xMove = t => 0.0
        } if (e.keyCode === 40) {
            zMove = t => 0.0
        }
    }

    this.initialize = (context, content) => {
        context.canvas.onmousedown = mousedown
        document.onmouseup = mouseup
        document.onmousemove = mousemove
        document.onkeydown = keydown
        document.onkeyup = keyup
    }

    this.getRotation = () => {
        let pitch = mat4.fromXRotation(mat4.create(), currentRotation.pitch)
        let yaw = mat4.fromYRotation(mat4.create(), currentRotation.yaw)

        return mat4.multiply(mat4.create(), pitch, yaw)
    }

    this.update = (context, time) => {
        currentRotation.pitch += rotationDelta.pitch(time.delta, rotationSpeed)
        currentRotation.yaw += rotationDelta.yaw(time.delta, rotationSpeed)

        let rotation = this.getRotation()
        let addVector = vec3.fromValues(xMove(time.delta, moveSpeed),
            0.0,
            zMove(time.delta, moveSpeed))
        let rotatedVector = vec3.transformMat4(vec3.create(), addVector, rotation);
        vec3.add(position, position, rotatedVector)
        let rotatedTarget = vec3.transformMat4(vec3.create(),
            vec3.copy(vec3.create(), target),
            rotation)
        currentTarget = vec3.add(currentTarget, position, rotatedTarget)
        let rotatedUp = vec3.transformMat4(vec3.fromValues(0.0, 1.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0),
            rotation)

        view = mat4.lookAt(mat4.create(), position, currentTarget, rotatedUp)
    }
}

module.exports = Camera
