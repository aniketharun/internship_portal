import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';

const CropModal = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const handleCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Crop Profile Picture</h3>
                    <button onClick={onCancel} style={styles.closeBtn}><X size={20} /></button>
                </div>
                <div style={styles.cropperContainer}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={handleCropComplete}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <div style={styles.controls}>
                    <div style={styles.sliderGroup}>
                        <label style={styles.label}>Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            style={styles.slider}
                        />
                    </div>
                </div>
                <div style={styles.footer}>
                    <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={handleSave} style={styles.saveBtn}>
                        <Check size={18} /> Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modal: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid var(--border-color)',
    },
    header: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        margin: 0,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
    },
    cropperContainer: {
        position: 'relative',
        height: '350px',
        width: '100%',
        background: '#333',
    },
    controls: {
        padding: '1.25rem 1.5rem',
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)',
    },
    sliderGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        opacity: 0.7,
        minWidth: '50px',
    },
    slider: {
        flex: 1,
        cursor: 'pointer',
    },
    footer: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        background: 'var(--card-bg)',
    },
    cancelBtn: {
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--text-color)',
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    saveBtn: {
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'white',
        backgroundColor: 'var(--primary-color)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'opacity 0.2s',
    },
};

export default CropModal;
