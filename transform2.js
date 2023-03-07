class base64 {
    constructor() {
        const { readable, writable } = new TransformStream({
            transform(chunk, controller) {
                controller.enqueue(btoa(chunk))
            },
        });

        this.writable = writable;
        this.readable = readable;
    }
}

const response = await fetch('https://api.grinwis.com')

const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new base64())
    .getReader()

for (let result = await reader.read(); !result.done; result = await reader.read()) {
    console.log('[value]', result.value);
}
