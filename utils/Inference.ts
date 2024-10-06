import { InferenceSession, Tensor } from "onnxruntime-web";
import { Model } from "./Models";
import { BoundingBox } from "./BoundingBoxTypes";
import { NonMaxSuppresion } from "./NonMaxSuppression";
import { createCanvas, CanvasRenderingContext2D, loadImage } from "canvas";

const color = ["red", "blue", "green", "purple"]

async function generateRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, classId: number, prob: number, model: Model){
    const randomColor = color[Math.floor(Math.random() * (color.length - 1))]
    ctx.fillStyle = randomColor
    ctx.strokeStyle = randomColor
    ctx.strokeRect(x, y, w, h)
    ctx.font = "20px Arial"
    ctx.fillRect(x, ((y - 30) > 0? (y - 30) : y), ((`${model.label[classId]} ${prob.toPrecision(2).toString()}`).length * 10), 30)
    ctx.fillStyle = "white"
    ctx.fillText(`${model.label[classId]} ${prob.toPrecision(2).toString()}`, x + 2, ((y - 30 + 20) >= 10 ? (y - 30 + 20) : (y + 20)))
}

export async function Inference(tensor: Tensor, runtime: InferenceSession, model: Model, setProgress: Function, ObjectURL: string, setOutputImage: Function, dimension: {w: number, h: number}){
    // Inference
    console.log(tensor)
    const output = await runtime.run({images: tensor})
    console.log(output)
    // Postprocessing
    setProgress(2)
    const detection = output.output0.dims[2]
    const box = []
    const confidenceThreshold = 0.5

    for(let i = 0; i < detection; i++){
        const prob: number[] = []
        for(let j = 0; j < model.numClass; j++){
            prob.push(output.output0.data[i + (detection * (4 + j))] as number)
        }
        const conf = Math.max(...prob)

        if(conf < confidenceThreshold) continue

        box.push({
            x: (output.output0.data[i + (detection * 0)] as number) - ((output.output0.data[i + (detection * 2)] as number) / 2),
            y: (output.output0.data[i + (detection * 1)] as number) - ((output.output0.data[i + (detection * 3)] as number) / 2),
            w: (output.output0.data[i + (detection * 2)] as number),
            h: (output.output0.data[i + (detection * 3)] as number),
            prob: conf,
            classId: prob.indexOf(conf)
        } as BoundingBox)
    }
    console.log(box)
    // Filtering
    setProgress(3)
    const filteringBox = NonMaxSuppresion(box)
    console.log(filteringBox)

    const canvas = createCanvas(640, 640)
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")

    ctx.drawImage(await loadImage(ObjectURL), 0, 0, 640, 640)

    for(let i = 0; i < filteringBox.length; i++){
        generateRectangle(ctx, filteringBox[i].x, filteringBox[i].y, filteringBox[i].w, filteringBox[i].h, filteringBox[i].classId, filteringBox[i].prob, model)
    }

    const resizingCanvas = createCanvas(dimension.w, dimension.h)
    const ctxResizing = resizingCanvas.getContext("2d")
    ctxResizing.drawImage(canvas, 0, 0, dimension.w, dimension.h)

    setOutputImage(resizingCanvas.toDataURL())
    setProgress(0)
}