import {
  Button,
  FileInput,
  Label,
  Modal,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useState ,useContext} from "react";
import { AuthContext } from 'src/context/AuthContext';

const EmailCompose = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user } = context;
  const [show, setShow] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
    attachments: [] as File[],
  });
  const [isSending, setIsSending] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setFormData({
      to: "",
      subject: "",
      message: "",
      attachments: [],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('to', formData.to);
      formDataToSend.append('user', user["email"]);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      
      formData.attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const response = await fetch('/api2/email/send-email', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Email sent successfully!');
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button className="w-full rounded-xl" color={"primary"} onClick={handleShow}>
        Compose
      </Button>
      <Modal show={show} onClose={handleClose}>
        <Modal.Header className="pb-0">Compose Mail</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <Label
                  htmlFor="to"
                  value="to"
                  className="mb-2 block capitalize"
                />
                <TextInput 
                  id="to" 
                  className="form-control" 
                  type="text"
                  value={formData.to}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-span-12">
                <Label
                  htmlFor="subject"
                  value="Subject"
                  className="mb-2 block capitalize"
                />
                <TextInput 
                  id="subject" 
                  className="form-control" 
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-span-12">
                <Label
                  htmlFor="message"
                  value="Message"
                  className="mb-2 block capitalize"
                />
                <Textarea
                  id="message"
                  className="form-control-textarea"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-12">
                <Label
                  htmlFor="attachments"
                  value="Attachments"
                  className="mb-2 block capitalize"
                />
                <FileInput 
                  id="attachments" 
                  className="form-control" 
                  onChange={handleFileChange}
                  multiple
                />
                {formData.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Attachments:</p>
                    <ul className="list-disc pl-5">
                      {formData.attachments.map((file, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-sm">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="col-span-12">
                <Modal.Footer className="p-0 pt-6">
                  <Button
                    color={"primary"}
                    className="bg-primary"
                    type="submit"
                    disabled={isSending}
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                  <Button 
                    color={"error"} 
                    onClick={handleClose}
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                </Modal.Footer>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EmailCompose;