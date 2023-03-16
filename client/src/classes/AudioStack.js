/**
 * A stack data structure that can hold instances of Float32Array and provide
 * methods for manipulating and concatenating them.
 */
class AudioStack {
    /**
     * Creates a new Float32ArrayStack instance with an optional maximum length
     * limit for the internal buffer.
     * @param {number} [maxLength] - The maximum length limit for the internal buffer.
     * @param {???} [socket] - Socket!
     */
    constructor(maxLength, socket) {
        this.items = [];
        this.maxLength = maxLength;
        this.socket = socket;
    }

    /**
     * Pushes a new Float32Array element to the top of the stack. If the new length
     * of the internal buffer exceeds the maximum length limit, the elements in the
     * buffer are concatenated into a single Float32Array and sent to the server.
     * @param {Float32Array} element - The Float32Array element to push to the stack.
     */
    push(element) {
        this.items.push(element);
        console.log('pushing', this.items)
        if (this.maxLength && this.length() > this.maxLength) {
            this._sendToServer();
            this._clear();
            console.log('Sent!')
        }
    }

    /**
     * Removes and returns the Float32Array element at the top of the stack. If the
     * stack is empty, returns undefined.
     * @returns {Float32Array|undefined} The Float32Array element at the top of the stack,
     * or undefined if the stack is empty.
     */
    pop() {
        return this.items.pop();
    }

    /**
     * Returns the Float32Array element at the top of the stack without removing it. If
     * the stack is empty, returns undefined.
     * @returns {Float32Array|undefined} The Float32Array element at the top of the stack,
     * or undefined if the stack is empty.
     */
    peek() {
        return this.items[this.items.length - 1];
    }

    /**
     * Returns the number of elements in the stack.
     * @returns {number} The number of elements in the stack.
     */
    length() {
        return this.items.length;
    }

    /**
     * Returns true if the stack is empty, false otherwise.
     * @returns {boolean} True if the stack is empty, false otherwise.
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Clears all elements from the stack and resets the internal buffer length to 0.
     * This method should not be accessed via public interface.
     * @private
     */
    _clear() {
        this.items = [];
    }

    /**
     * Sends the contents of the internal buffer to the server. This method should not be
     * accessed via public interface.
     * @private
     */
    _sendToServer() {
        if (this.socket) {
            const stream = window.ss.createStream();

            const item = new Blob(this.items, {
                type: "audio/wav"
            })
            console.log('Will do', item)

            window.ss(this.socket).emit('stream-transcribe', stream, {
                name: 'Something.wav', 
                size: item.size
            });
            window.ss.createBlobReadStream(item).pipe(stream);
        } else {
            console.error('NO SOCKET!')
        }
    }
}

export default AudioStack