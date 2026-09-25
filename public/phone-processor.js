// AudioWorklet del teléfono web. Corre en el hilo de audio del navegador:
// - micrófono (frecuencia del AudioContext) → PCM 16 bits a 8 kHz en frames de 20 ms → hilo principal;
// - PCM a 8 kHz del servidor → cola → parlante, remuestreado a la frecuencia del AudioContext.
// Remuestreo lineal: para voz telefónica (hasta 3,4 kHz) alcanza y no suma latencia.

const PHONE_RATE = 8000
const FRAME_SAMPLES = 160
// Más de medio segundo en cola es retraso acumulado (red a ráfagas): se descarta lo viejo.
const MAX_QUEUE = PHONE_RATE / 2

class PhoneProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.muted = false
    this.inStep = PHONE_RATE / sampleRate
    this.inPos = 0
    this.frame = new Int16Array(FRAME_SAMPLES)
    this.frameLength = 0
    this.lastIn = 0
    this.queue = new Float32Array(0)
    this.outStep = PHONE_RATE / sampleRate
    this.outPos = 0

    this.port.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.enqueue(new Int16Array(event.data))
      } else if (event.data?.type === 'mute') {
        this.muted = event.data.value
      }
    }
  }

  enqueue(pcm) {
    const pending = this.queue.subarray(Math.floor(this.outPos))
    const merged = new Float32Array(pending.length + pcm.length)
    merged.set(pending)
    for (let i = 0; i < pcm.length; i++) merged[pending.length + i] = pcm[i] / 32768
    this.outPos -= Math.floor(this.outPos)
    this.queue = merged.length > MAX_QUEUE ? merged.subarray(merged.length - MAX_QUEUE) : merged
  }

  process(inputs, outputs) {
    this.capture(inputs[0]?.[0])
    this.play(outputs[0]?.[0])
    return true
  }

  capture(input) {
    if (!input) return
    for (let i = 0; i < input.length; i++) {
      const sample = input[i]
      // Se emite una muestra cada vez que el acumulador cruza un período de 8 kHz, interpolando.
      this.inPos += this.inStep
      if (this.inPos >= 1) {
        this.inPos -= 1
        const t = 1 - this.inPos / this.inStep
        const value = this.muted ? 0 : this.lastIn + (sample - this.lastIn) * Math.min(1, Math.max(0, t))
        this.frame[this.frameLength++] = Math.max(-32768, Math.min(32767, Math.round(value * 32767)))
        if (this.frameLength === FRAME_SAMPLES) {
          const out = this.frame.buffer
          this.port.postMessage(out, [out])
          this.frame = new Int16Array(FRAME_SAMPLES)
          this.frameLength = 0
        }
      }
      this.lastIn = sample
    }
  }

  play(output) {
    if (!output) return
    for (let i = 0; i < output.length; i++) {
      const index = Math.floor(this.outPos)
      if (index + 1 >= this.queue.length) {
        output[i] = 0
        continue
      }
      const frac = this.outPos - index
      output[i] = this.queue[index] + (this.queue[index + 1] - this.queue[index]) * frac
      this.outPos += this.outStep
    }
  }
}

registerProcessor('phone-processor', PhoneProcessor)
