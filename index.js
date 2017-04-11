window.onload = () => {
    wgl('view', 'fx/2d-vs.fx', 'fx/2d-fs.fx', game)
}

const initialize = (context, program) => {
    game.objects.push(buildTriangle(context, program))
}

const update = (context, program, timestamp) => {
}

const draw = (context, program, timestamp) => {
    context.clearColor(0.392157, 0.584314, 0.929412, 1.0)
    // enable depth testing
    context.enable(context.DEPTH_TEST)
    // near things obscure far things
    context.depthFunc(context.LEQUAL)
    // clear the color as well as the depth buffer
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
    context.viewport(0, 0, context.canvas.width, context.canvas.height)
    context.useProgram(program)
}

const buildTriangle = (context, program) => {
    return {
        update: (context, program, timestamp) => {
            const position = context.getAttribLocation(program, 'a_position')
            const buffer = context.createBuffer()
            // bind the position buffer
            context.bindBuffer(context.ARRAY_BUFFER, buffer)
            var positions = [0, 0,
                0, 0.5,
                0.7, 0]
            context.bufferData(context.ARRAY_BUFFER, new Float32Array(positions), context.STATIC_DRAW)
            context.enableVertexAttribArray(position)

            // tell the attribute how to get data out of buffer (ARRAY_BUFFER)
            const size = 2 // 2 components per iteration
            const type = context.FLOAT // the data is 32bit floats
            const normalize = false // don't normalize the data
            const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
            const offset = 0 // start at the beginning of the buffer
            context.vertexAttribPointer(position, size, type, normalize, stride, offset)
        },
        draw: (context, program, timestamp) => {
            context.drawArrays(context.TRIANGLES, // primitive type
                0, // offset
                3) //count
        }
    }
}

const game = {
    initialize: initialize,
    update: update,
    draw: draw,
    objects: []
}

