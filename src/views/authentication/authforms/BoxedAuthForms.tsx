import { useState, useContext } from 'react';
import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { Link } from 'react-router';
import { AuthContext } from 'src/context/AuthContext';

const BoxedAuthLogin = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e:any) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <>
      <form className="mt-6" onSubmit={handleLogin}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email" />
          </div>
          <TextInput
            name="email"
            id="email"
            type="text"
            sizing="md"
            className="form-control"
            placeholder="Enter your user name"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password" value="Password" />
          </div>
          <TextInput
            name="password"
            id="password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" defaultChecked />
            <Label htmlFor="accept" className="font-medium cursor-pointer">
              Keep me logged in
            </Label>
          </div>
        </div>
        <Button type="submit" className="rounded-md w-full bg-sky dark:bg-sky hover:bg-dark dark:hover:bg-dark">
          Sign in
        </Button>
      </form>
    </>
  );
};

export default BoxedAuthLogin;
