import { BoundingBox } from "./BoundingBoxTypes";

function iou(boxA: BoundingBox, boxB: BoundingBox){
    const [xA1, yA1, wA, hA] = [boxA.x, boxA.y, boxA.w, boxA.h]
    const [xB1, yB1, wB, hB] = [boxB.x, boxB.y, boxB.w, boxB.h]
    const xA2 = xA1 + wA
    const yA2 = yA1 + hA
    const xB2 = xB1 + wB
    const yB2 = yB1 + hB

    const interX1 = Math.max(xA1, xB1)
    const interY1 = Math.max(yA1, yB1)
    const interX2 = Math.min(xA2, xB2)
    const interY2 = Math.min(yA2, yB2)
    const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1)

    const boxAArea = wA * hA
    const boxBArea = wB * hB
    const iouValue = interArea / (boxAArea + boxBArea - interArea)

    return iouValue
}

export function NonMaxSuppresion(boxes: BoundingBox[], iouThreshold = 0.5){
    const selectedBox = []

    while(boxes.length > 0){
        boxes.sort((a, b) => b.prob - a.prob)

        const chosenBox: BoundingBox = boxes.shift() as BoundingBox
        selectedBox.push(chosenBox)

        boxes = boxes.filter(box => {
            return iou(chosenBox, box) < iouThreshold}
        )
    }

    return selectedBox
}