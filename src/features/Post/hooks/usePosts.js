import { useEffect } from "react";
import req from "../../../lib/req";
import { useDispatch, useSelector } from "react-redux";
import { addComment, addReaction, addReply, editComment, removeComment, setCommentsWithPagination, setLoading } from "../reducers/commentReducer";
import { useSocket } from "../../../context/SocketProvider";

export default function usePosts() {
    const dispatch = useDispatch();
    const sort = useSelector((store) => store.commentStore.sorting);
    const commentsReloadTrigger = useSelector((store) => store.commentStore.commentsReloadTrigger);
    const { page, limit } = useSelector((store) => store.commentStore.pagination);
    const socket = useSocket();
    const userId = useSelector((store) => store.userStore.user._id);

    useEffect(() => {
        dispatch(setLoading(true));
        const query = new URLSearchParams({ page: page, limit, sort, post: "1" }).toString();
        req({ uri: `/comment?${query}` })
            .then(({ data }) => dispatch(setCommentsWithPagination(data)))
            .catch((e) => console.log(e.message))
            .finally(() => dispatch(setLoading(false)));

        socket.on('new_comment', (comment = {}) => {
            if (comment.user?._id !== userId) dispatch(addComment(comment));
        });

        socket.on('new_reply', (comment = {}) => {
            if (comment.user?._id !== userId) dispatch(addReply({ comment }));
        });

        socket.on('comment_edited', ({ _id, user_id, content } = {}) => {
            if (user_id !== userId) dispatch(editComment({ content, _id }));
        });

        socket.on('comment_removed', ({ user_id, _id } = {}) => {
            if (user_id !== userId) dispatch(removeComment(_id));
        });

        socket.on('reaction_added', ({ user_id, _id, reaction } = {}) => {
            if (user_id !== userId) dispatch(addReaction({ _id, data: { user: user_id, element: reaction } }));
        });

        return () => {
            socket.off('new_comment');
            socket.off('comment_edited');
            socket.off('comment_removed');
            socket.off('reaction_added');
        };

    }, [dispatch, sort, page, limit, commentsReloadTrigger, socket, userId]);

    return {};
}