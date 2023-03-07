const readableStream = new ReadableStream({
  start(controller) {
    // Called by constructor.
    console.log('[start readable]');
    controller.enqueue('a');
    controller.enqueue('b');
    controller.enqueue('c');
  },
  pull(controller) {
    // Called when controller's queue is empty.
    console.log('[pull]');
    controller.enqueue('d');
    controller.close();
  },
  cancel(reason) {
    // Called when the stream is canceled.
    console.log('[cancel]', reason);
  },
});

const writableStream = new WritableStream({
  start(controller) {
    // Called by constructor
    console.log('[start writable]');
  },
  async write(chunk, controller) {
    // Called upon writer.write()
    console.log('[write]', chunk);
    // Wait for next write.
    await new Promise((resolve) => setTimeout(() => {
      document.body.textContent += chunk;
      resolve();
    }, 1_000));
  },
  close(controller) {
    console.log('[close]');
  },
  abort(reason) {
    console.log('[abort]', reason);
  },
});

await readableStream.pipeTo(writableStream);
console.log('[finished]');
