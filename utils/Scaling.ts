export function Scaling(
    input: number,
    maxBefore: number,
    maxAfter: number
){
    return (input * maxAfter) / maxBefore
}