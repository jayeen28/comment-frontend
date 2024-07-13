import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from '../../../components/Toaster';
import useComment from '../hooks/useComment';
import { addComment, addReply } from '../reducers/commentReducer';
import CommentInput from './CommentInput';

const SubmitComment = ({ replyOf }) => {
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();
    const dispatch = useDispatch();
    const { submitComment } = useComment();
    const commentType = replyOf ? 'reply' : 'comment';

    const handleSubmit = () => {
        const content = inputRef.current.value;
        if (!content) return inputRef.current.focus();
        setLoading(true);
        submitComment(content, replyOf)
            .then(({ data }) => {
                if (commentType === 'comment') dispatch(addComment(data));
                else dispatch(addReply({ comment: data, directAdd: true }));
                inputRef.current.value = '';
            })
            .catch((e) => {
                console.log(e);
                toast('Something went wrong!', 'error');
            })
            .finally(() => setLoading(false));
    };

    return (<CommentInput loading={loading} inputRef={inputRef} handleSubmit={handleSubmit} />);
}

export default SubmitComment;
