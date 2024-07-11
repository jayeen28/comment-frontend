import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setUser } from '../features/PrivateRoute/reducers/userReducer';
import req from '../lib/req';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { handleSubmit, register } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        setLoading(true);
        req({ method: 'POST', uri: '/user/login', data })
            .then(({ data }) => {
                dispatch(setUser(data));
                navigate('/posts');
            })
            .catch(() => toast('Credentials are invalid.', 'error'))
            .finally(() => setLoading(false))
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type='email' placeholder='Your email' required {...register('email')} maxLength={50} />
                <input type='password' placeholder='Your password' required {...register('password')} minLength={8} />
                <button type='submit' disabled={loading}>Login</button>
            </form>
        </div>
    );
}

export default Login;
