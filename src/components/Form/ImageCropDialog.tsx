import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { type PointerEvent, useEffect, useRef, useState } from 'react';
import { MdZoomIn, MdZoomOut } from 'react-icons/md';
import { useIntl } from 'react-intl';

const VIEWPORT_SIZE = 260;
const OUTPUT_SIZE = 400;
const MAX_ZOOM = 3;

type Offset = { x: number; y: number };

type ImageCropDialogProps = {
  /** The picked image; the dialog is open while this is set. */
  file: File | null;
  /** `circle` for profile photos, `rounded` for logos. Both export a square image. */
  shape?: 'circle' | 'rounded';
  titleId?: string;
  confirmId?: string;
  onClose: () => void;
  onConfirm: (image: Blob) => void;
};

/** Drag to position and zoom to frame an image inside a circle or rounded square, then export a square JPEG. */
export function ImageCropDialog({
  file,
  shape = 'circle',
  titleId = 'profile.photo.cropTitle',
  confirmId = 'profile.photo.savePhoto',
  onClose,
  onConfirm,
}: ImageCropDialogProps) {
  const { $t } = useIntl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ pointer: Offset; offset: Offset } | null>(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // At zoom 1 the shorter side exactly fills the frame.
  const baseScale = natural.width ? VIEWPORT_SIZE / Math.min(natural.width, natural.height) : 1;
  const scale = baseScale * zoom;

  // Keep the image covering the whole viewport so no empty corners end up in the photo.
  const clampOffset = (next: Offset, nextZoom = zoom): Offset => {
    const displayScale = baseScale * nextZoom;
    const maxX = Math.max(0, (natural.width * displayScale - VIEWPORT_SIZE) / 2);
    const maxY = Math.max(0, (natural.height * displayScale - VIEWPORT_SIZE) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { pointer: { x: event.clientX, y: event.clientY }, offset };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const { pointer, offset: startOffset } = dragStart.current;
    setOffset(
      clampOffset({ x: startOffset.x + event.clientX - pointer.x, y: startOffset.y + event.clientY - pointer.y }),
    );
  };

  const handleZoom = (nextZoom: number) => {
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  };

  const handleConfirm = () => {
    const image = imageRef.current;
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Map the frame's bounding square back to the image's own pixels.
    const displayWidth = natural.width * scale;
    const displayHeight = natural.height * scale;
    const sourceX = (displayWidth / 2 - offset.x - VIEWPORT_SIZE / 2) / scale;
    const sourceY = (displayHeight / 2 - offset.y - VIEWPORT_SIZE / 2) / scale;
    const sourceSize = VIEWPORT_SIZE / scale;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    canvas.toBlob((blob) => blob && onConfirm(blob), 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={Boolean(file)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{$t({ id: titleId })}</DialogTitle>
      <DialogContent className="flex flex-col items-center gap-4">
        <Box
          role="presentation"
          className="relative flex shrink-0 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
          sx={{
            width: VIEWPORT_SIZE,
            height: VIEWPORT_SIZE,
            bgcolor: 'action.hover',
            touchAction: 'none',
            boxShadow: 4,
            borderRadius: shape === 'circle' ? '50%' : '28px',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => (dragStart.current = null)}
          onPointerCancel={() => (dragStart.current = null)}
        >
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt=""
              draggable={false}
              onLoad={(event) =>
                setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
              }
              className="pointer-events-none shrink-0 select-none"
              style={{
                maxWidth: 'none',
                width: natural.width * scale || undefined,
                height: natural.height * scale || undefined,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {$t({ id: 'profile.photo.cropHint' })}
        </Typography>
        <Box className="flex w-full items-center gap-3 px-2">
          <MdZoomOut size={20} />
          <Slider
            value={zoom}
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            onChange={(_event, value) => handleZoom(value as number)}
            aria-label={$t({ id: 'profile.photo.zoom' })}
          />
          <MdZoomIn size={20} />
        </Box>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose}>{$t({ id: 'profile.cancel' })}</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!natural.width}>
          {$t({ id: confirmId })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
