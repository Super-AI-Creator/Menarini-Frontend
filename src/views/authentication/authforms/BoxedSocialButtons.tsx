import Google from "/src/assets/images/svgs/google-icon.svg";
import FB from "/src/assets/images/svgs/facebook-icon.svg";
import { HR } from "flowbite-react";
import { Link } from "react-router";
import { useRef, useEffect, useState, useContext  } from "react";
import { AuthContext } from 'src/context/AuthContext';
import BoxedAuthRegister from "./BoxedRegForms"
import { AlertComponent } from 'src/Alert/alert';

interface MyAppProps {
    title?: string;
}

const BoxedSocialButtons: React.FC<MyAppProps> = ({ title }) => {
    const { gmail_login } = useContext(AuthContext);
    const [extraRegistFlag, setExtraRegistFlag] = useState(false);
    const googleButton = useRef<HTMLDivElement | null>(null);
    const [reloadGoogleBtn, setReloadGoogleBtn] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [alertState, setAlertState] = useState(false)
    const [alertColor, setAlertColor] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    const loadScript = (src: string): Promise<void> =>
        new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (err) => reject(err);
            document.body.appendChild(script);
        });

    useEffect(() => {
        googleSSO();
        setTimeout(() => {
            setReloadGoogleBtn(true);
        }, 1000);
    }, [reloadGoogleBtn]);

    const googleSSO = () => {
        const googleSSOPublicKey = "879058051169-g9kgb1fcnqurp8tv09scgv1d6631gdi6.apps.googleusercontent.com";
        const src = "https://accounts.google.com/gsi/client";
        
        loadScript(src)
            .then(() => {
                if (window.google) {
                    window.google.accounts.id.initialize({
                        client_id: googleSSOPublicKey,
                        select_by: "btn",
                        callback: handleCredentialResponse,
                    });
                    if (googleButton.current) {
                        window.google.accounts.id.renderButton(googleButton.current, {
                            theme: "outline",
                            text: "signin_with",
                            shape: "pill",
                            size: "large",
                        });
                    }
                }
            })
            .catch(console.error);
    };


    const handleCredentialResponse = (response: any) => {
        if (response.credential) {
            const data = { auth_token: response.credential };
            fetch("/api2/accounts/google", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            })
                .then((res) => res.json())
                .then((res) => {
                    processGoogleSSOResponse(res);
                });
        }
    };

    const processGoogleSSOResponse = (res: any) => {
        if(res["success"] == "login success"){
            gmail_login(res)
        }
        if(res["success"] == "pre-register success"){
            setAlertState(true)
            setAlertMessage("Well done. Please enter this field for platform.")
            setAlertColor("success")
            
            setTimeout(() => {
                setAlertState(false);
            }, 5000);
            setEmail(res["email"])
            setName(res["name"])
            setExtraRegistFlag(true)
        }
        console.log(res)
    };

    return (
        <>
            <div className="flex justify-between gap-8 mb-6 md:mt-10 mt-5" >
                <div ref={googleButton} id="google-ref"></div>
            </div>
            {
                extraRegistFlag ? <BoxedAuthRegister email = {email} name = {name}/> : ""
            }
            {/* Divider */}
            <HR.Text text={title} className="!border-t !border-ld !bg-transparent text-bodytext" />
            <AlertComponent alert = {alertState} message={alertMessage} color={alertColor} />
        </>
    );
};

export default BoxedSocialButtons;