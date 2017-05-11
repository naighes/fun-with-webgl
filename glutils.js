const createBuffer = (context,
    program,
    data,
    getLocation,
    target,
    size) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, data, context.STATIC_DRAW)

        const attribute = getLocation(context, program)
        context.enableVertexAttribArray(attribute)

        let type = null

        if (data instanceof Int8Array) {
            type = context.BYTE
        } else if (data instanceof Uint8Array) {
            type = context.UNSIGNED_BYTE
        } else if (data instanceof Int16Array) {
            type = context.SHORT
        } else if (data instanceof Uint16Array) {
            type = context.UNSIGNED_SHORT
        } else if (data instanceof Int32Array) {
            type = context.INT
        } else if (data instanceof Uint32Array) {
            type = context.UNSIGNED_INT
        } else if (data instanceof Float32Array) {
            type = context.FLOAT
        }

        const bind = context => {
            context.bindBuffer(context.ARRAY_BUFFER, buffer)
            context.vertexAttribPointer(attribute,
                size,
                type,
                false,
                0,
                0)
        }

        return { bind: bind }
    }


module.exports.createArrayBuffer = (context,
    program,
    data,
    getLocation,
    size) => {
        return createBuffer(context,
            program,
            data,
            getLocation,
            context.ARRAY_BUFFER,
            size)
    }
