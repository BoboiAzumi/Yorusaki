import { Jimp } from "jimp";
import { Tensor } from "onnxruntime-web";

export async function ImageToTensor(ObjectUrl: string, setTensor: Function, setDimension: Function, dims = [1, 3, 640, 640]){
    const image = await Jimp.read(ObjectUrl)
    await setDimension({
        w: image.bitmap.width,
        h: image.bitmap.height
    })
    
    const buffer = image.resize({w: dims[2], h: dims[3]}).bitmap.data

    const [red, green, blue] = new Array(new Array<number>(), new Array<number>(), new Array<number>())

    for(let i = 0; i < buffer.length; i += 4){
        red.push(buffer[i])
        green.push(buffer[i + 1])
        blue.push(buffer[i + 2])
    }

    const transposed = red.concat(green).concat(blue)
    const float32Tensor = new Float32Array(dims[1] * dims[2] * dims[3])

    for(let i = 0; i < transposed.length; i++){
        float32Tensor[i] = transposed[i] / 255;
    }
    
    setTensor(new Tensor("float32", float32Tensor, dims))
}