window.onload = () => {
    wgl('view', new Game())
}

function Game() {
    this.objects = []

    this.shaders = {
        'default': { vs: 'fx/vs.fx', fs: 'fx/fs.fx' }
    }

    const rgb = [1.0, 0.0, 0.0, 1.0,
                 0.0, 1.0, 0.0, 1.0,
                 0.0, 0.0, 1.0, 1.0]

    const camera = new FixedCamera()

    this.initialize = context => {
        const triangles = [[0, 0.5,
                            0, 1.0,
                            0.7, 0.5],
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

        const cube1 = new ColoredCube(0.2)
        cube1.camera = camera
        this.objects.push(cube1)

        const cube2 = new TexturedCube(0.8)
        cube2.camera = camera
        this.objects.push(cube2)
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

