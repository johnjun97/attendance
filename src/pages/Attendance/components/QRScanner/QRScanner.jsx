import { useEffect, useRef, useState } from 'react'
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode'
import './QRScanner.css'

function QRScanner({ onScan }) {
    const scannerRef = useRef(null)
    const streamRef = useRef(null)
    const processingRef = useRef(false)
    const mountedRef = useRef(true)

    const lastScanRef = useRef({
        value: '',
        time: 0,
    })

    const [scannerError, setScannerError] = useState('')

    function stopCamera() {
        const stream = streamRef.current

        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop()
            })

            streamRef.current = null
        }

        const video =
            document
                .getElementById('qr-reader')
                ?.querySelector('video')

        if (video?.srcObject) {
            video.srcObject
                .getTracks()
                .forEach((track) => track.stop())

            video.srcObject = null
        }
    }

    useEffect(() => {
        mountedRef.current = true

        const scanner = new Html5Qrcode('qr-reader', {
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
            ],
        })

        scannerRef.current = scanner

        async function startScanner() {
            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
                    },
                    handleScan,
                    () => {}
                )

                const video =
                    document
                        .getElementById('qr-reader')
                        ?.querySelector('video')

                if (video?.srcObject) {
                    streamRef.current = video.srcObject
                }

                if (!mountedRef.current) {
                    stopCamera()

                    if (scanner.isScanning) {
                        await scanner.stop()
                    }

                    return
                }
            } catch (error) {
                if (mountedRef.current) {
                    console.error(
                        'Unable to start QR scanner:',
                        error
                    )

                    setScannerError(
                        'Unable to access the camera.'
                    )
                }
            }
        }

        startScanner()

        return () => {
            mountedRef.current = false

            const currentScanner = scannerRef.current

            async function cleanup() {
                /*
                 * Capture the stream BEFORE html5-qrcode
                 * clears the video element.
                 */
                const video =
                    document
                        .getElementById('qr-reader')
                        ?.querySelector('video')

                if (video?.srcObject) {
                    streamRef.current = video.srcObject
                }

                try {
                    if (
                        currentScanner &&
                        currentScanner.isScanning
                    ) {
                        await currentScanner.stop()
                    }
                } catch (error) {
                    console.error(
                        'Unable to stop QR scanner:',
                        error
                    )
                }

                stopCamera()

                try {
                    currentScanner?.clear()
                } catch (error) {
                    console.error(
                        'Unable to clear QR scanner:',
                        error
                    )
                }

                scannerRef.current = null
            }

            cleanup()
        }
    }, [])

    async function handleScan(decodedText) {
        const now = Date.now()

        if (processingRef.current) {
            return
        }

        if (
            decodedText === lastScanRef.current.value &&
            now - lastScanRef.current.time < 2000
        ) {
            return
        }

        lastScanRef.current = {
            value: decodedText,
            time: now,
        }

        processingRef.current = true

        try {
            await onScan(decodedText)
        } finally {
            processingRef.current = false
        }
    }

    return (
        <div className="qr-scanner">
            <div className="qr-scanner-header">
                <h2>Scan QR Code</h2>
            </div>

            <div
                id="qr-reader"
                className="qr-reader"
            />

            {scannerError && (
                <p className="qr-scanner-error">
                    {scannerError}
                </p>
            )}

            {!scannerError && (
                <p className="qr-scanner-instruction">
                    Point the camera at the agent's QR code
                </p>
            )}
        </div>
    )
}

export default QRScanner