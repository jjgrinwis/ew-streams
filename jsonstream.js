function jsonfyTransformStream() {
    const response = { 'test': 'testing' }
    const transformStream = new TransformStream({
        transform(chunk, controller) {
            response['data'] = chunk
            controller.enqueue(response)
        },
    });

    return transformStream
}

class Base64TransformStream {
    /*
    An instance of this class will be used in the constuctor of the TransformStream() class
    Using class but should also be possible to use just an object 
    A TextDecoderStream() should be use before using this transform class, stream should already be text
    */
    constructor() {
        // we need groups of 3 bytes for our base64 encoding, any leftover bytes are stored in this extra field. 
        this.extra = null
    }

    // his method is called when a new chunk is written to the writable side and is ready to be transformed.
    transform(chunk, controller) {

        // if we have 1 or 2 chars left from previous stream, add that data to the head of the new text chunk
        if (this.extra) {
            // chunk should be text so just concat it.
            chunk = this.extra + chunk
            this.extra = null;
        }

        // with base64 encoding, 3 bytes are represented by 4 characters, so we can only encode in groups of 3 bytes
        const remaining = chunk.length % 3;

        // remove the remaining bytes from our chunk and store in this.extra 
        if (remaining !== 0) {
            // Store the extra bytes for later
            this.extra = chunk.slice(chunk.length - remaining);
            chunk = chunk.slice(0, chunk.length - remaining);
        }

        // our chunk should now begroups of 3 bytes so no == padding in the middle of our streaming output
        controller.enqueue(btoa(chunk))
    }

    /*
    When there is no more data, flush is called and the writable stream is about to close
    Pushing any leftovers in to the queue and we're done
    */
    flush(controller) {
        // this.extra can only be null or a string
        if (this.extra !== null) {
            controller.enqueue(btoa(this.extra))
        }
    }
}
/*
The TransformStream() constructor accepts as its first argument an optional JavaScript object representing the transformer.
This object should contain a transfer() method. If no transform() method is supplied, it enqueues chunks unchanged from the writable side to the readable side.
https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#anything-to-uint8array_stream
https://github.com/akamai/edgeworkers-examples/blob/master/edgecompute/examples/stream/find-replace-stream/main.js

We're using a new object with transform() method as the transformer. Using a class but can also be a static object
like const transformContent = {} with transform() method.  
*/
class Base64 extends TransformStream {
    constructor() {
        super(new Base64TransformStream());
    }
}

const response = await fetch('https://api.grinwis.com')

const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new Base64())
    .pipeThrough(jsonfyTransformStream())
    .getReader()

for (let result = await reader.read(); !result.done; result = await reader.read()) {
    console.log('[value]', result.value);
}