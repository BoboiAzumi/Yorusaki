import { InferenceSession, Tensor } from "onnxruntime-web";
import { Model } from "./Models";
import { BoundingBox } from "./BoundingBoxTypes";
import { NonMaxSuppresion } from "./NonMaxSuppression";
import { createCanvas, CanvasRenderingContext2D, loadImage } from "canvas";
import { Scaling } from "./Scaling";

const color = ["red", "blue", "green", "purple", "orange", "brown", "gray", "#4800a6", "#0a6500", "#009c2f"]

async function generateRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, classId: number, prob: number, model: Model, dimension: {w: number, h: number}){
    const randomColor = color[Math.floor(Math.random() * (color.length - 1))]
    const c = Scaling(30, 640, dimension.w < dimension.h ? dimension.w : dimension.h)
    const d = Scaling(20, 640, dimension.w < dimension.h ? dimension.w : dimension.h)
    const e = Scaling(10, 640, dimension.w < dimension.h ? dimension.w : dimension.h)

    ctx.lineWidth = Scaling(2, 640, dimension.w)
    ctx.fillStyle = randomColor
    ctx.strokeStyle = randomColor
    ctx.strokeRect(x, y, w, h)
    ctx.font = `${d}px Arial`
    ctx.fillRect(x, ((y - c) > 0? (y - c) : y), ((`${model.label[classId]} ${prob.toPrecision(2).toString()}`).length * e), c)
    ctx.fillStyle = "white"
    ctx.fillText(`${model.label[classId]} ${prob.toPrecision(2).toString()}`, x + 2, ((y - c + d) >= e ? (y - c + d) : (y + d)))
}

export async function Inference(tensor: Tensor, runtime: InferenceSession, model: Model, setProgress: Function, ObjectURL: string, setOutputImage: Function, dimension: {w: number, h: number}){
    // Inference
    const output = await runtime.run({images: tensor})
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
            x: Scaling((output.output0.data[i + (detection * 0)] as number) - ((output.output0.data[i + (detection * 2)] as number) / 2), 640, dimension.w),
            y: Scaling((output.output0.data[i + (detection * 1)] as number) - ((output.output0.data[i + (detection * 3)] as number) / 2), 640, dimension.h),
            w: Scaling((output.output0.data[i + (detection * 2)] as number), 640, dimension.w),
            h: Scaling((output.output0.data[i + (detection * 3)] as number), 640, dimension.h),
            prob: conf,
            classId: prob.indexOf(conf)
        } as BoundingBox)
    }
    // Filtering
    setProgress(3)
    const filteringBox = NonMaxSuppresion(box)

    const canvas = createCanvas(dimension.w, dimension.h)
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")

    ctx.drawImage(await loadImage(ObjectURL), 0, 0, dimension.w, dimension.h)

    for(let i = 0; i < filteringBox.length; i++){
        generateRectangle(ctx, filteringBox[i].x, filteringBox[i].y, filteringBox[i].w, filteringBox[i].h, filteringBox[i].classId, filteringBox[i].prob, model, dimension)
    }

    setOutputImage(canvas.toDataURL())
    setProgress(0)
}