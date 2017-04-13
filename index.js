window.onload = () => {
    wgl('view', 'fx/vs.fx', 'fx/fs.fx', new Game())
}

function FixedCamera() {
    let mvp = mat4.create()

    this.modelViewProjection = () => {
        return mvp
    }

    const calculateModelViewProjection = context => {
        const projection = mat4.create()
        const aspect = context.canvas.clientWidth / context.canvas.clientHeight
        mat4.perspective(projection, Math.PI/4, aspect, 1, 200)

        const view = mat4.create()
        mat4.lookAt(view, vec3.fromValues(0, 0, 3), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0))

        const mvp = mat4.create()
        mat4.multiply(mvp, projection, view)

        return mvp
    }

    this.initialize = context => {
        mvp = calculateModelViewProjection(context)
    }
}

function Game() {
    this.objects = []

    const rgb = [1.0, 0.0, 0.0, 1.0,
                 0.0, 1.0, 0.0, 1.0,
                 0.0, 0.0, 1.0, 1.0]

    const camera = new FixedCamera()

    this.initialize = context => {
        const triangles = [[0, 0,
                            0, 0.5,
                            0.7, 0],
                           [-0.5, -0.5,
                            -0.9, -0.5,
                            -0.5, -0.8],
                           [-0.5, 0.9,
                            -0.9, 0.9,
                            -0.5, 0.2]]
        this.objects.push(camera)
        triangles.map(t => new Triangle(t, rgb)).forEach(t => {
            t.camera = camera
            this.objects.push(t)
        })
    }

    this.update = (context, time) => {
    }

    this.draw = (context, time) => {
        context.clearColor(0.392157, 0.584314, 0.929412, 1.0)
        // enable depth testing
        context.enable(context.DEPTH_TEST)
        // near things obscure far things
        context.depthFunc(context.LEQUAL)
        // clear the color as well as the depth buffer
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
        context.viewport(0, 0, context.canvas.width, context.canvas.height)
    }
}

