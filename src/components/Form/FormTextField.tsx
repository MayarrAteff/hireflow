import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useState } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useIntl } from 'react-intl';

type FormTextFieldProps<T extends FieldValues> = Omit<TextFieldProps, 'name'> & {
  name: FieldPath<T>;
  control: Control<T>;
  labelId: string;
};

/** react-hook-form + MUI TextField. Translates yup messages (which are i18n ids). Password fields get a visibility toggle. */
export function FormTextField<T extends FieldValues>({ name, control, labelId, type, ...rest }: FormTextFieldProps<T>) {
  const { $t } = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          type={isPassword && showPassword ? 'text' : type}
          label={$t({ id: labelId })}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ? $t({ id: fieldState.error.message }) : rest.helperText}
          fullWidth
          slotProps={
            isPassword
              ? {
                  ...rest.slotProps,
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1}>
                          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }
              : rest.slotProps
          }
        />
      )}
    />
  );
}
