// 
class Base64TransformStream extends TransformStream {
    constructor() {
        /*
        super calls the parent class's constructor TransformStream and binds the parent class's public fields
        the derived class's constructor can further access and modify this.
        */
        super()

        // Any extra chars from the last chunk
        this.extra = null

        console.log('constructor started')
    }
    /*
    This transform method is called when a new chunk originally written to the writable side is ready to be transformed.
    so we overwrite the parentclass with our own transform call
    */
    transform(chunk, controller) {

        console.log('[transform]', chunk);

        if (this.extra) {
            console.log('some leftovers from previous chunk')
            chunk = Buffer.concat([this.extra, chunk]);
            this.extra = null;
        }

        // 3 bytes are represented by 4 characters, so we can only encode in groups of 3 bytes
        const remaining = chunk.length % 3;

        if (remaining !== 0) {
            console.log(`we have ${remaining} chars left, let's store them`)
            // Store the extra bytes for later
            this.extra = chunk.slice(chunk.length - remaining);
            chunk = chunk.slice(0, chunk.length - remaining);
        }

        // place our base64 encoded string back in the queue
        controller.enqueue(btoa(chunk))

    }
}

const response = await fetch('https://headers.grinwis.com')

const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new Base64TransformStream())
    .getReader()

for (let result = await reader.read(); !result.done; result = await reader.read()) {
    console.log('[value]', result.value);
}
