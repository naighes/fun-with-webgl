const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const quat = glmatrix.quat

function Camera(initialPosition, dir) {
    let mvp = mat4.create()
    let driving = false
    let cx = 0
    let cy = 0
    let xRot = (t, s) => 0.0
    let yRot = (t, s) => 0.0
    let xMove = t => 0.0
    let zMove = t => 0.0
    const moveSpeed = 16.0
    const rotationSpeed = 20.0

    const initialDirection = dir

    let position = initialPosition
    let direction = vec3.create()
    let rotation = quat.create()

    this.calculateProjection = context => {
        const result = mat4.create()
        const aspect = context.canvas.clientWidth/context.canvas.clientHeight
        mat4.perspective(result, Math.PI/4, aspect, 0.1, 200.0)

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

    this.getPosition = () => position

    this.calculateModelViewProjection = (context, world) => {
        const result = mat4.create()
        mat4.multiply(result, this.calculateProjection(context), this.calculateModelView(world))

        return result
    }

    this.calculateModelView = world => {
        const result = mat4.create()
        mat4.multiply(result, lookAt(), world)

        return result
    }

    const mousedown = e => {
        driving = true
        cx = event.clientX
        cy = event.clientY
    }

    const mouseup = e => {
        driving = false

        xRot = (t, s) => 0.0
        yRot = (t, s) => 0.0
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

        xRot = (t, s) => degToRad(dy*t*s)
        yRot = (t, s) => degToRad(dx*t*s)

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
        vec3.copy(direction, initialDirection)

        context.canvas.onmousedown = mousedown
        document.onmouseup = mouseup
        document.onmousemove = mousemove
        document.onkeydown = keydown
        document.onkeyup = keyup
    }

    this.update = (context, time) => {
        updateRotation(time, rotationSpeed)
        updatePosition(time, moveSpeed)
    }

    const updatePosition = (time, speed) => {
        if (xMove === 0.0 && zMove === 0.0) {
            return
        }

        let addVector = vec3.fromValues(xMove(time.delta, speed), 0.0, zMove(time.delta, speed))
        vec3.transformQuat(addVector, addVector, rotation)
        vec3.add(position, position, addVector)
    }

    const updateRotation = (time, speed) => {
        const yaw = yRot(time.delta, speed)
        const pitch = xRot(time.delta, speed)

        if (yaw === 0.0 && pitch === 0.0) {
            return
        }

        const rx = quat.create(), ry = quat.create()
        quat.setAxisAngle(rx, vec3.fromValues(1.0, 0.0, 0.0), pitch)
        quat.setAxisAngle(ry, vec3.fromValues(0.0, 1.0, 0.0), yaw)

        const r = quat.create()
        quat.multiply(r, rx, ry)

        quat.multiply(rotation, rotation, r)
        direction = vec3.create()
        vec3.copy(direction, initialDirection)
        vec3.transformQuat(direction, direction, rotation)
        vec3.normalize(direction, direction)
    }
}

module.exports = Camera
