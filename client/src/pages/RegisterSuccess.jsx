import ConfirmationScreen from '../components/ConfirmationScreen';

const RegisterSuccess = () => {
    return (
        <ConfirmationScreen
            title="Registration Successful!"
            message="Thank you for signing up. You will be redirected to the main page soon."
            redirectPath="/"
        />
    );
};

export default RegisterSuccess;

