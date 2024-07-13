import React from 'react';
import styles from './avatar.module.scss';

const Avatar = ({ id, ...rest }) => {

    return (
        <div className={styles.avatar_wrapper} {...rest}>
            <img
                className={styles.avatar}
                src={id ? `${process.env.REACT_APP_BACKEND_URL}/file/${id}` : 'https://www.w3schools.com/howto/img_avatar.png'} alt='Avatar'
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = 'https://www.w3schools.com/howto/img_avatar.png';
                }}
            />
        </div>
    );
}

export default Avatar;
