import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { type ChangeEvent, type DragEvent, type KeyboardEvent, useRef, useState } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';

type FileDropzoneProps = {
  accept: string[];
  /** Called with the dropped or picked file; validation is up to the caller. */
  onFile: (file: File) => void;
  titleId: string;
  captionId: string;
  captionValues?: Record<string, string | number>;
  compact?: boolean;
  error?: boolean;
};

/** Drag & drop area that also opens the file picker on click, Enter or Space. */
export function FileDropzone({ accept, onFile, titleId, captionId, captionValues, compact, error }: FileDropzoneProps) {
  const { $t } = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFile(file);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-label={$t({ id: titleId })}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`tw-flex tw-cursor-pointer tw-items-center tw-rounded-2xl tw-text-center tw-transition-colors ${
          compact ? 'tw-gap-3 tw-p-4 tw-text-start' : 'tw-flex-col tw-gap-2 tw-px-6 tw-py-10'
        }`}
        sx={(theme) => {
          const borderColor = error ? theme.palette.error.main : theme.palette.divider;
          return {
            border: `2px dashed ${isDragging ? theme.palette.primary.main : borderColor}`,
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            outline: 'none',
            '&:hover, &:focus-visible': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          };
        }}
      >
        <IconTile icon={MdCloudUpload} size={compact ? 'md' : 'lg'} />
        <Box className="tw-min-w-0">
          <Typography fontWeight={600}>{$t({ id: titleId })}</Typography>
          {!compact && (
            <Typography variant="body2" color="text.secondary">
              {$t(
                { id: 'upload.dropHint' },
                {
                  browse: (
                    <Typography key="browse" component="span" variant="body2" color="primary" fontWeight={600}>
                      {$t({ id: 'upload.browse' })}
                    </Typography>
                  ),
                },
              )}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {$t({ id: captionId }, captionValues)}
          </Typography>
        </Box>
      </Box>
      <input ref={inputRef} type="file" accept={accept.join(',')} hidden onChange={handleChange} />
    </>
  );
}
