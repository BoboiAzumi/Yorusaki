"use client"
import Navbar from "@/components/Navbar";
import { Model, Models } from "@/utils/Models"
import { useEffect, useState } from "react";
import * as ort from "onnxruntime-web"
import Image from "next/image";
import { ImageToTensor } from "@/utils/Preprocessing";
import { Inference } from "@/utils/Inference";

export default function Home() {
	const [selectedModels, setSelectedModels] = useState(0)
	const [model, setModel] = useState({} as ort.InferenceSession)
	const [modelLoaded, setModelLoaded] = useState(false)
	const [imgSrc, setImgSrc] = useState("")
	const [tensor, setTensor] = useState({} as ort.Tensor)
	const [progress, setProgress] = useState(0)
	const [imgDimension, setImgDimension] = useState({w: 0, h: 0} as {w: number, h: number})
	const [outputImage, setOutputImage] = useState("")

	useEffect(() => {
		loadModel()
	}, [])

	useEffect(() => {
		if(!model.inputNames) return
		
		setModelLoaded(false)
		model.release()
		.then(() => {
			loadModel()
		})
		.catch(() => {
			alert("Failed release model")
		})
	}, [selectedModels])

	useEffect(() => {
		if(imgSrc == "") return

		ImageToTensor(imgSrc, setTensor, setImgDimension)
		.catch(() => alert("Failed Preprocessing"))
	}, [imgSrc])

	function loadModel(){
		ort.InferenceSession.create(Models[selectedModels].path)
		.then((_model) => {
			setModel(_model)
			setModelLoaded(true)
		})
		.catch(() => alert("Error Loading Model"))
	}

	return (
        <div className="min-h-[100vh] bg-base-200">
            <Navbar />
            <div className="flex justify-center py-5">
                <div className="box bg-base-100 px-5 py-2 rounded-md w-[90vw] md:w-[60vw] lg:w-[40vw] min-h-[40vh]">
                    {!modelLoaded ? (
                        <div className="flex flex-col justify-center items-center h-full">
                            <img
                                src="/img/logo.png"
                                width={100}
                                className="animate-bounce"
                            />
                        </div>
                    ) : (
                        <>
                            <h3 className="text-center my-3 text-lg font-semibold">
                                Object Detection
                            </h3>
                            <h3 className="mt-3 text-sm">Select Models</h3>
                            <select
                                className="select bg-base-200 w-full my-3"
                                onChange={(ev) => {
                                    setSelectedModels(
                                        parseInt(ev.target.value)
                                    );
                                }}
                            >
                                {Models.map((v: Model, i) => (
                                    <option
                                        value={i}
                                        selected={selectedModels == i}
                                        key={i}
                                    >
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                            <h3 className="mt-3 text-sm">Image</h3>
                            <div className="w-full my-3 bg-base-200 p-5 rounded-sm min-h-[10rem] flex flex-col justify-center items-center">
                                <input
                                    type="file"
									accept=".jpg, .jpeg, .png, .jfif"
                                    className="file-input max-w-xs"
                                    onChange={async (ev) => {
                                        if (ev.target.files && ev.target.files[0] != null) {
                                            const fileReader = new FileReader();
                                            fileReader.readAsArrayBuffer(
                                                ev.target.files[0]
                                            );
                                            fileReader.onload = async function (e) {
                                                if (e.target) {
                                                    const ObjUrl =
                                                        URL.createObjectURL(
                                                            new Blob(
                                                                [
                                                                    e.target.result as ArrayBuffer,
                                                                ],
                                                                {
                                                                    type: "image/png",
                                                                }
                                                            )
                                                        );
                                                    setImgSrc(ObjUrl);
                                                }
                                            };
                                        }
                                    }}
                                />
                                {imgSrc != "" ? (
                                    <Image
                                        src={imgSrc}
                                        width={500}
										height={0}
										className="w-full mt-5"
                                        alt={"Image Preview"}
                                    />
                                ) : (
                                    <></>
                                )}
                            </div>
                            <button
                                className={"btn w-full "+(progress != 0 ? "hidden" : "")}
								onClick={() => {
									if (tensor.data != null) {
										setProgress(1)
										setTimeout(() => Inference(tensor, model, Models[selectedModels], setProgress, imgSrc, setOutputImage, imgDimension), 100)
									}
								}}
                            >Detect</button>
							<progress 
								className={"progress w-full "+(progress != 0 ? "" : "hidden")} 
								value={(progress / 3) * 100} 
								max={100}
							/>
							{outputImage != "" ? (
								<>
									<h3 className="mt-5 text-sm">Result</h3>
									<img
									src={outputImage}
									className="w-full mt-3"
									alt={"Image Preview"}
									/>
								</>
							): (<></>)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
