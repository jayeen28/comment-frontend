import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import useComment from '../hooks/useComment';
import Comment from './Comment';
import Comments from './Comments';
import SubmitComment from './SubmitComment';
import styles from '../styles/comment.module.scss';

let replyBtnDebounce;
const CommentWrapper = ({ comment }) => {
    const [showInput, setShowInput] = useState(false);//Show/hide the input responsible for reply.
    const [replyLoading, setReplyLoading] = useState(false);
    const replies = useSelector((store) => store.commentStore.comments).filter((c) => c.replyOf === comment._id);//loaded the replies of a single comment.
    const isRepliesNotLoaded = comment.replyCount > 0 && replies.length === 0;//This variable is to know that, is the user previously clicked the show reply button?
    const { showReplies } = useComment({ comment });//The function to load replies and put in store.

    function handleShowReplyClick() {//debouced show reply click handler
        setReplyLoading(true);
        clearTimeout(replyBtnDebounce);
        replyBtnDebounce = setTimeout(() => {
            showReplies(setReplyLoading);
        }, 1000);
    }

    function replyClicked() {//This is the click handler for the reply button under each comment.
        setShowInput(false);//
        setTimeout(() => setShowInput(true));// These to lines are for setting focus to the reply comment input. Otherwise user's will not notice 
        //that a input is opened to type specially when there is lot of replies.
        if (isRepliesNotLoaded) handleShowReplyClick();//This one for loading previous replies when user clicks the reply button.
    }


    return (
        <div>
            <Comment comment={comment} replyClicked={replyClicked} />
            <div className={styles.replies_wrapper}>
                {
                    replyLoading ? <span className={`link ${styles.replies_tips}`}>Loading . . .</span> :
                        isRepliesNotLoaded ?
                            <span className={`link ${styles.replies_tips}`} onClick={handleShowReplyClick}>
                                Show {comment.replyCount} replies
                            </span>
                            :
                            <div className={styles.replies}>
                                {/* Recursively call the comments component to use already implemented features. */}
                                <Comments type='reply' parent={comment._id} noCommentsMessage={false} style={{ height: 'max-content' }} replies={replies} />
                            </div>
                }
                {
                    showInput ?
                        <div style={{ marginLeft: '20px' }}>
                            <SubmitComment replyOf={comment._id} />
                            <span className={`link ${styles.reply_cancel_btn}`} onClick={() => setShowInput(false)}>Cancel</span>
                        </div> : <></>
                }
            </div>
        </div>
    );
}

export default CommentWrapper;
