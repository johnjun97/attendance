import { useEffect, useRef, useState } from 'react'
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode'
import './QRScanner.css'

function QRScanner({ onScan, onClose }) {
    const scannerRef = useRef(null)
    const processingRef = useRef(false)
    const mountedRef = useRef(true)

    const lastScanRef = useRef({
        value: '',
        time: 0,
    })

    const [scannerError, setScannerError] = useState('')

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
                    () => { }
                )
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

            if (
                currentScanner &&
                currentScanner.isScanning
            ) {
                currentScanner
                    .stop()
                    .then(() => {
                        currentScanner.clear()
                    })
                    .catch((error) => {
                        console.error(
                            'Unable to stop QR scanner:',
                            error
                        )
                    })
            }
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

    async function handleClose() {
        const currentScanner = scannerRef.current

        try {
            if (
                currentScanner &&
                currentScanner.isScanning
            ) {
                await currentScanner.stop()
            }

            currentScanner?.clear()
        } catch (error) {
            console.error(
                'Unable to stop QR scanner:',
                error
            )
        } finally {
            onClose()
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