import { ChangeEvent, Dispatch, SetStateAction } from 'react';

const handleChange = <T extends object>(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setForm: Dispatch<SetStateAction<T>>
) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

export default handleChange;
