import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { useIntl } from 'react-intl';

type FormChipsFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  labelId: string;
  className?: string;
};

const uniqueTrimmed = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

/** Free-text list stored as `string[]`: type a value and press Enter (or leave the field) to add it as a chip. */
export function FormChipsField<T extends FieldValues>({ name, control, labelId, className }: FormChipsFieldProps<T>) {
  const { $t } = useIntl();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete<string, true, false, true>
          multiple
          freeSolo
          autoSelect
          options={[]}
          value={field.value}
          onChange={(_event, value) => field.onChange(uniqueTrimmed(value))}
          onBlur={field.onBlur}
          className={className}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return <Chip key={key} size="small" label={option} {...tagProps} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={field.ref}
              label={$t({ id: labelId })}
              error={Boolean(fieldState.error)}
              helperText={$t({ id: fieldState.error?.message ?? 'field.chipsHint' })}
            />
          )}
        />
      )}
    />
  );
}
