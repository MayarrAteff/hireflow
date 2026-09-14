import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { type ClipboardEvent, type KeyboardEvent, useEffect, useRef } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { MdAdd, MdClose } from 'react-icons/md';
import { useIntl } from 'react-intl';

type ListEditorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  onBlur: () => void;
  labelId: string;
  placeholderId: string;
  addLabelId: string;
  removeLabelId: string;
  hintId: string;
  error?: string;
};

function ListEditor({
  value,
  onChange,
  onBlur,
  labelId,
  placeholderId,
  addLabelId,
  removeLabelId,
  hintId,
  error,
}: ListEditorProps) {
  const { $t } = useIntl();
  // Always show at least one row to type into; blank rows are dropped when the job is saved.
  const rows = value.length ? value : [''];

  // Stable keys per row so focus and animations survive inserts and removals.
  const nextId = useRef(0);
  const ids = useRef<number[]>([]);
  while (ids.current.length < rows.length) ids.current.push(nextId.current++);
  ids.current.length = rows.length;

  const inputs = useRef(new Map<number, HTMLInputElement>());
  const pendingFocus = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocus.current === null) return;
    inputs.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  const insertAfter = (index: number, lines: string[] = ['']) => {
    const newIds = lines.map(() => nextId.current++);
    ids.current.splice(index + 1, 0, ...newIds);
    onChange([...rows.slice(0, index + 1), ...lines, ...rows.slice(index + 1)]);
    pendingFocus.current = newIds[newIds.length - 1];
  };

  const removeAt = (index: number) => {
    if (rows.length === 1) {
      onChange([]);
      pendingFocus.current = ids.current[0];
      return;
    }
    ids.current.splice(index, 1);
    onChange(rows.filter((_, i) => i !== index));
    pendingFocus.current = ids.current[Math.max(index - 1, 0)];
  };

  const updateAt = (index: number, text: string) => onChange(rows.map((row, i) => (i === index ? text : row)));

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (rows[index].trim()) insertAfter(index);
    } else if (event.key === 'Backspace' && !rows[index] && rows.length > 1) {
      event.preventDefault();
      removeAt(index);
    }
  };

  // Pasting several lines (e.g. from a job spec) turns each line into its own point.
  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    const lines = event.clipboardData
      .getData('text')
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
      .filter(Boolean);
    if (lines.length < 2) return;
    event.preventDefault();
    const [first, ...rest] = lines;
    const merged = rows[index].trim() ? `${rows[index]} ${first}` : first;
    const newIds = rest.map(() => nextId.current++);
    ids.current.splice(index + 1, 0, ...newIds);
    onChange([...rows.slice(0, index), merged, ...rest, ...rows.slice(index + 1)]);
    pendingFocus.current = newIds[newIds.length - 1];
  };

  const handleAdd = () => {
    const lastIndex = rows.length - 1;
    // Reuse an empty last row instead of stacking blank ones.
    if (rows[lastIndex].trim()) insertAfter(lastIndex);
    else inputs.current.get(ids.current[lastIndex])?.focus();
  };

  return (
    <Box>
      <Box className="mb-2 flex items-baseline justify-between gap-2">
        <Typography fontWeight={600}>{$t({ id: labelId })}</Typography>
        <Typography variant="caption" color="text.secondary">
          {$t({ id: hintId })}
        </Typography>
      </Box>

      <Box
        component="ol"
        className="m-0 flex list-none flex-col gap-2 rounded-2xl p-3"
        sx={{ border: 1, borderColor: error ? 'error.main' : 'divider', bgcolor: 'action.hover' }}
      >
        <AnimatePresence initial={false}>
          {rows.map((row, index) => {
            const id = ids.current[index];
            return (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2"
              >
                <Box
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                >
                  {index + 1}
                </Box>
                <TextField
                  value={row}
                  size="small"
                  fullWidth
                  placeholder={$t({ id: placeholderId })}
                  inputRef={(element: HTMLInputElement | null) => {
                    if (element) inputs.current.set(id, element);
                    else inputs.current.delete(id);
                  }}
                  onChange={(event) => updateAt(index, event.target.value)}
                  onKeyDown={handleKeyDown(index)}
                  onPaste={handlePaste(index)}
                  onBlur={onBlur}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                />
                <Tooltip title={$t({ id: removeLabelId })}>
                  <span>
                    <IconButton
                      size="small"
                      aria-label={$t({ id: removeLabelId })}
                      disabled={rows.length === 1 && !row}
                      onClick={() => removeAt(index)}
                    >
                      <MdClose size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </motion.li>
            );
          })}
        </AnimatePresence>

        <li>
          <Button size="small" startIcon={<MdAdd />} onClick={handleAdd} className="ms-7">
            {$t({ id: addLabelId })}
          </Button>
        </li>
      </Box>

      {error && <FormHelperText error>{$t({ id: error })}</FormHelperText>}
    </Box>
  );
}

type FormListFieldProps<T extends FieldValues> = Omit<ListEditorProps, 'value' | 'onChange' | 'onBlur' | 'error'> & {
  name: FieldPath<T>;
  control: Control<T>;
};

/** Ordered list of short sentences stored as `string[]`, e.g. job requirements. */
export function FormListField<T extends FieldValues>({ name, control, ...editorProps }: FormListFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ListEditor
          {...editorProps}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
