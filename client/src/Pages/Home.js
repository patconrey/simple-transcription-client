import { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    MicrophoneIcon,
    PauseIcon,
    XIcon,
    StatusOfflineIcon,
    StatusOnlineIcon
} from '@heroicons/react/outline'

import RecordRTC from 'recordrtc'
import { io } from 'socket.io-client'

import AudioStack from '../classes/AudioStack'

export default function Home() {
    const [isRecording, setIsRecording] = useState(false)
    const [socket, setSocket] = useState(null)
    const [recorder, setRecorder] = useState(null)
    const [open, setOpen] = useState(false)
    const [isServerAvailable, setIsServerAvailable] = useState(false)
    const userId = '123'

    const audioStack = new AudioStack(3, socket)

    useEffect(() => {
        const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws'
        const socketServerUrl = `${protocol}://${process.env.REACT_APP_API_HOST}`
        console.log({socketServerUrl})

        const socketio = io(socketServerUrl, { reconnection: false, secure: process.env.NODE_ENV === 'production'})
        const socket = socketio.on('connect', () => {
            console.log('DEBUG: Connected to socket server.')
            setIsServerAvailable(true)
        })

        socket.on('connect_failed', function(){
            console.log('DEBUG: connect_failed.');
            setOpen(true)
            setIsServerAvailable(false)
        });

        socket.on('connect_error', err => {
            console.log('DEBUG: connect_error.', err)
            setOpen(true)
            setIsServerAvailable(false)
        })

        socket.on("disconnect", () => {
            if (recorder && recorder.microphone)  {
                recorder.microphone.stop()
                console.log('DEBUG: disconnect.')
                setIsRecording(false)
            }
            setOpen(true)
            setIsServerAvailable(false)
            socket.close()
        });

        setSocket(socket)
    }, [recorder])

    const recordButtonWasClicked = async () => {
        if (!isServerAvailable) {
            setOpen(true)
            return
        }

        try {
            let numberOfRecordedTracks = 0;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const recorderObject = RecordRTC(stream, {
                type: 'audio',
                sampleRate: '44100',
                mimeType: 'audio/wav',
                recorderType: RecordRTC.StereoAudioRecorder,
                numberOfAudioChannels: 1,
                timeSlice: 1000,
                desiredSampRate: 16000,
                ondataavailable: function(blob) {
                    audioStack.push(blob)
                    // audioStack.push(new Float32Array([0, 0.1, 0.2]))
                    
                    // const newStream = window.ss.createStream();
                    // window.ss(socket).emit('stream-transcribe', newStream, {
                    //     name: `${userId}.wav`, 
                    //     size: blob.size
                    // });
                    // window.ss.createBlobReadStream(blob).pipe(newStream);
                    
                    if (numberOfRecordedTracks >= 10) {
                        recorderObject.reset()
                        recorderObject.startRecording()
                        numberOfRecordedTracks = 0;
                    }

                    numberOfRecordedTracks = numberOfRecordedTracks + 1;
                }
            })
            recorderObject.microphone = stream
            recorderObject.startRecording()

            setIsRecording(true)
            setRecorder(recorderObject)
        } catch(err) {
            console.log('DEBUG: stream error.', err)
        }
    }

    const pauseButtonWasClicked = () => {
        recorder.stopRecording(function() {
            setIsRecording(false)
            recorder.microphone.stop()
        })
    }

    const ServerStatusIndicator = () => isServerAvailable
        ? (
            <span className="mb-8 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                <StatusOnlineIcon className='h-4 w-4 text-green-800 mr-1' />
                Server Status: Available
            </span>
        )
        : (
            <span className="mb-8 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                <StatusOfflineIcon className='h-4 w-4 text-red-800 mr-1' />
                Server Status: Error
            </span>
        )

    const RecordButton = () => isRecording
        ? (
            <button
                type="button"
                onClick={pauseButtonWasClicked}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                <PauseIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                Pause Streaming
            </button>
        )
        : (
            <button
                type="button"
                onClick={recordButtonWasClicked}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                <MicrophoneIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                Start Streaming
            </button>
        )

    return (
        <main className="flex-1">
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpen}>
                    <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                        <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                            <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                            <button
                                type="button"
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                onClick={() => setOpen(false)}
                            >
                                <span className="sr-only">Close</span>
                                <XIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                            </div>
                            <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <StatusOfflineIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                Connection Error
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        There was a problem establishing a connection to the server. Please try again in a few minutes.
                                    </p>
                                </div>
                            </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    </div>
                </Dialog>
            </Transition.Root>
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-semibold text-gray-900">Transcription Test</h1>
                        </div>
                    </div>
                    <h2 className="text-sm font-bold text-violet-700 uppercase mt-4">Details</h2>
                    <div className="bg-white">
                        <p className='text-base text-gray-500'>
                            This is just a simple test to route audio through the pipeline and ultimately to a deployed instance of Whisper.
                        </p>
                    </div>
                    <div className='mt-12 flex flex-col items-start'>
                        <ServerStatusIndicator />
                        <RecordButton />
                    </div>
                </div>
            </div>
        </main>
    )
}
