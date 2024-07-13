import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: true,
    sorting: 'createdAt:desc',
    comments: [],
    commentsReloadTrigger: false,
    pagination: {
        page: 1,
        limit: 20,
        totalDocs: 0,
    },
};

export const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        /**
         * Updates the comments state with the provided data, considering pagination.
         *
         * This reducer handles setting comments retrieved from the server, merging new data
         * with existing comments based on page number. It also updates the pagination information.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {Object} action.payload - The payload containing comments and pagination data.
         *     @prop {Array<Object>} action.payload.docs - The array of comment objects.
         *     @prop {Object} action.payload.pagination - The pagination information.
         */
        setCommentsWithPagination: (state, action) => {
            const { docs, pagination } = action.payload;

            if (pagination.page === 1) {
                state.comments = docs;
            } else {
                const existingCommentIds = new Set(state.comments.map(comment => comment._id));
                const newDocs = docs.filter(doc => !existingCommentIds.has(doc._id));
                if (newDocs.length === 0 && state.pagination.hasNextPage) state.pagination = { ...state.pagination, page: state.pagination.page + 1 }
                else state.comments = [...state.comments, ...newDocs];
            }

            state.pagination = { ...pagination, page: state.pagination.page, limit: state.pagination.limit };
        },
        /**
         * Increments the current page number in the pagination state for loading more comments.
         *
         * This reducer is used when the user wants to load additional comments on a paginated list.
         * It doesn't directly update the comments, but signals the need to fetch more data.
         */
        loadMoreComments: (state) => {
            state.pagination = { ...state.pagination, page: state.pagination.page + 1 };
        },

        /**
         * Adds a new comment to the beginning of the comments list and updates total document count.
         *
         * This reducer handles adding a newly created comment to the state. It prepends the
         * new comment to the existing list and increments the total number of comments.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {Object} action.payload - The new comment object.
         */
        addComment: (state, action) => {
            state.comments = [action.payload, ...state.comments];
            state.pagination.totalDocs += 1;
        },

        addReply: (state, action) => {
            const comment = action.payload;
            const existsAny = state.comments.some(c => c.replyOf === comment.replyOf);
            if (existsAny) state.comments = [...state.comments, comment];
            else state.comments = state.comments.map(c => {
                if (c._id === comment.replyOf) c.replyCount++;
                return c;
            })
        },
        /**
         * Adds a new comment to the beginning of the comments list and updates total document count.
         *
         * This reducer handles adding a newly created comment to the state. It prepends the
         * new comment to the existing list and increments the total number of comments.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {Object} action.payload - The new comment object.
         */
        addReplies: (state, action) => {
            state.comments = [...state.comments, ...action.payload || []];
        },

        /**
         * Updates the content and edited flag of a comment in the state based on its ID.
         *
         * This reducer handles editing an existing comment. It iterates through the comments
         * and finds the matching one by ID, then updates its content and edited flag.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {Object} action.payload - The updated comment data.
         *     @prop {string} action.payload._id - The comment's ID.
         *     @prop {string} action.payload.content - The updated comment content.
         *     @prop {boolean} [action.payload.edited] - Optional flag indicating if the comment was edited (defaults to true).
         */
        editComment: (state, action) => {
            const { _id, content, edited = true } = action.payload;
            state.comments = state.comments.map((c) => {
                if (c._id === _id) {
                    c.content = content;
                    c.edited = edited;
                }
                return c;
            })
        },
        /**
         * Removes a comment from the state by ID and updates total document count.
         *
         * This reducer handles deleting a comment. It filters out the comment with the
         * matching ID from the list and decrements the total number of comments. Additionally,
         * if the comment list becomes empty, a trigger for reloading comments is set.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {string} action.payload - The ID of the comment to be removed.
         */
        removeComment: (state, action) => {
            const comments = state.comments.filter(c => c._id !== action.payload);
            state.comments = comments;
            state.pagination.totalDocs -= 1;
            if (comments.length === 0) state.commentsReloadTrigger = !state.commentsReloadTrigger;
        },
        /**
         * Adds a new reaction to a specific comment and updates the reaction count.
         *
         * This reducer handles adding a user's reaction (e.g., like, dislike) to a comment.
         * It finds the comment by ID, adds the reaction data, and updates the corresponding
         * reaction count in the comment object.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {Object} action.payload - The reaction data and comment ID.
         *     @prop {string} action.payload._id - The comment's ID.
         *     @prop {Object} action.payload.data - The reaction object with details like type and user.
         */
        addReaction: (state, action) => {
            const { _id, data } = action.payload;
            state.comments = state.comments.map((comment) => {
                if (comment._id === _id) {
                    comment = {
                        ...comment,
                        reactions: [
                            ...comment.reactions,
                            data
                        ]
                    };
                    comment[`${data.element}s`] += 1;
                }
                return comment;
            });
        },
        /**
         * Removes a user's reaction from a specific comment and updates the reaction count.
         *
         * This reducer handles removing a user's reaction (e.g., like, dislike) from a comment.
         * It finds the comment by ID, filters out the matching reaction from its list, and
         * updates the corresponding reaction count in the comment object.
         *
         * @param {Object} action - The dispatched action object.
         *   @prop {Object} action.payload - The reaction data and comment ID.
         *     @prop {string} action.payload._id - The comment's ID.
         *     @prop {Object} action.payload.data - The reaction object with details like type and user.
         */
        removeReaction: (state, action) => {
            const { _id, data } = action.payload;
            state.comments = state.comments.map((comment) => {
                if (comment._id === _id) {
                    comment.reactions = comment.reactions.filter(r => r.user !== data.userId);
                    comment[`${data.element}s`] -= 1;
                }
                return comment;
            })
        },
        /**
         * Sets the loading state for comments.
         *
         * This reducer updates the `loading` flag in the state to indicate whether comments
         * are being fetched or not. It's useful for displaying loading indicators while data
         * is being retrieved from the server.
         *
         * @param {boolean} action.payload - The new loading state (true/false).
         */
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        /**
         * Updates the sorting criteria for comments.
         *
         * This reducer handles changing the sorting order for comments (e.g., by creation date,
         * likes, etc.). It updates the `sorting` property in the state with the new sorting criteria.
         * Additionally, it resets the current page number to 1 to ensure fresh data is fetched
         * according to the new sorting order.
         *
         * @param {string} action.payload - The new sorting criteria string.
         */
        updateSorting: (state, action) => {
            state.sorting = action.payload;
            state.pagination.page = 1;
        },
    }
});

export const {
    setCommentsWithPagination,
    setLoading,
    addComment,
    addReaction,
    removeReaction,
    removeComment,
    loadMoreComments,
    editComment,
    updateSorting,
    addReplies,
    addReply
} = commentSlice.actions;

export default commentSlice.reducer;