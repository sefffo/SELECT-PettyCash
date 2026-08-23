# React Form Skill

Create a form component using React Hook Form + Zod.

## Guidelines
- Use `useForm` from `react-hook-form`
- Use `zodResolver` from `@hookform/resolvers/zod`
- Define schema in `src/schemas/` if reusable
- Export type from schema
- Use MUI form components

## Example
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas';
import { TextField, Button } from '@mui/material';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <TextField {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
      <TextField {...register('password')} type="password" error={!!errors.password} helperText={errors.password?.message} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```
