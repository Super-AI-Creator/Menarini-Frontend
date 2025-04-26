import { useState, useContext } from 'react';
import { Button, Select, Label, TextInput } from 'flowbite-react';
import { Link } from 'react-router';
import { AuthContext } from 'src/context/AuthContext';
const BoxedAuthRegister = (props) => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { register } = context;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gmail_password: '',
    domain: 'AU82',
  });

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleRegister = (e:any) => {
    e.preventDefault();
    formData["username"] = props.name
    formData["email"] = props.email
    // console.log(formData)
    register(formData);
  };

  return (
    <>
      <form className="mt-6" onSubmit={handleRegister}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password" value="password" />
          </div>
          <TextInput
            name="password"
            id="password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder="Enter your password for platform."
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="gmail_password" value="Google Password" />
          </div>
          <TextInput
            name="gmail_password"
            id="gmail_password"
            type="text"
            sizing="md"
            className="form-control"
            placeholder="Enter your Gmail Password"
            value={formData.gmail_password}
            onChange={handleChange}
          />
        </div>
        <div className="mb-8">
          <div className="mb-2 block">
            <Label htmlFor="domain" value="Domain" />
          </div>
          <Select
            id="domain"
            name="domain"
            className="select-md"
            value={formData.domain}
            onChange={handleChange}
          >
            <option value="AU82">AU82</option>
            <option value="RO">RO</option>
            <option value="C307">C307</option>
            <option value="C355">C355</option>
          </Select>
        </div>
        <Button type="submit" className="rounded-md w-full bg-sky dark:bg-sky hover:bg-dark dark:hover:bg-dark">
          Sign Up
        </Button>

      </form>
    </>
  );
};

export default BoxedAuthRegister;
