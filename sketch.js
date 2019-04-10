

const timeScale = 5
const lineNumber = 10
const segmentSize = (14000-20) / lineNumber
let buffer = []
let completeSong = []
for(let i = 0; i < lineNumber; i++){
  buffer.push([])
  completeSong.push([])
}

let songInput
let songLoaded = false

let fileIn

let freqAnalyser
let mic
function setup(){
  fileIn = createFileInput(gotSound)
  createCanvas(windowWidth, windowHeight*0.97)
  pixelDensity(1)
  freqAnalyser = new p5.FFT()
  freqAnalyser.setInput(songInput)

  freqAnalyser.smooth(0.8)
}

function draw(){
  background(255)

  if (songInput && songInput.isPlaying()){
    const freqs = freqAnalyser.analyze()

    const freqAmplitudes = buffer.map((ran, i) => {

      const segment = (i * segmentSize) + 20

      const rangeFreq = freqAnalyser.getEnergy(segment, segment + segmentSize)

      const mappedFreq = map(rangeFreq, 0, 300, 0, width/2)
      buffer[i].push(mappedFreq)
      completeSong[i].push(mappedFreq)
    })

    if (buffer[0].length >= height/timeScale){
      buffer.forEach(x => {
        x.splice(0, 1)
      })
    }
  }
  push()
  translate(width/2, 0)
  noFill()
  strokeWeight(3)
  strokeJoin(ROUND)
  colorMode(HSB)
  buffer.forEach((ran, i)=>{
    push()
    stroke((i / buffer.length) * 255, 100, 100)

    beginShape()
    ran.forEach((bMoment, j) => {
      curveVertex(bMoment, height - (j*timeScale))
    })
    endShape()
    beginShape()
    ran.forEach((bMoment, j) => {
      curveVertex(-bMoment, height - (j*timeScale))
    })
    endShape()
    pop()
  })

  strokeWeight(1)
  stroke(0, 10)
  line(0, 0, 0, height)
  pop()

  textAlign(LEFT, TOP)
  if (songLoaded){
    text('cancion cargada', 0, 0)
  } else {
    text('ninguna cancion', 0, 0)
  }
}

function gotSound(file){
  loadSound(file, x=>{
    songInput = x
  })
}

function mousePressed(){
  if (!songInput) return

  if (!songInput.isPlaying()){
    songInput.play()
    loop()
  } else {
    songInput.pause()
    noLoop()
  }
}

function keyPressed(){
  if (key == 'p'){
    printCompleteSong()
  }
}

function printCompleteSong(){
  const newContext = createGraphics(width, timeScale * completeSong[0].length)

  newContext.translate(newContext.width/2, 0)
  newContext.noFill()
  newContext.strokeWeight(3)
  newContext.strokeJoin(ROUND)
  newContext.colorMode(HSB)
  completeSong.forEach((ran, i)=>{
    newContext.push()
    newContext.stroke((i / completeSong.length) * 255, 100, 100)

    newContext.beginShape()
    ran.forEach((bMoment, j) => {
      newContext.curveVertex(bMoment, newContext.height - (j*timeScale))
    })
    newContext.endShape()
    newContext.beginShape()
    ran.forEach((bMoment, j) => {
      newContext.curveVertex(-bMoment, newContext.height - (j*timeScale))
    })
    newContext.endShape()
    newContext.pop()
  })

  saveCanvas(newContext, songInput.file + '.png')

}