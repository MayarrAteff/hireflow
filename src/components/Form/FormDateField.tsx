import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { useIntl } from 'react-intl';

type FormDateFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  labelId: string;
  disablePast?: boolean;
  className?: string;
};

/** react-hook-form + MUI DatePicker holding a `Dayjs | null`. Translates yup messages (which are i18n ids). */
export function FormDateField<T extends FieldValues>({
  name,
  control,
  labelId,
  disablePast,
  className,
}: FormDateFieldProps<T>) {
  const { $t } = useIntl();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          value={field.value}
          onChange={field.onChange}
          inputRef={field.ref}
          label={$t({ id: labelId })}
          disablePast={disablePast}
          className={className}
          slotProps={{
            field: { clearable: true },
            textField: {
              fullWidth: true,
              onBlur: field.onBlur,
              error: Boolean(fieldState.error),
              helperText: fieldState.error?.message ? $t({ id: fieldState.error.message }) : undefined,
            },
          }}
        />
      )}
    />
  );
}
