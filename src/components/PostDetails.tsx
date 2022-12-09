import React, { useState, useEffect } from 'react';
import { Comment, CommentData } from '../types/Comment';
import { getComments, removeComment, addComment } from '../api/comments';
import { Post } from '../types/Post';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';

type Props = {
  post: Post;
};

export const PostDetails: React.FC<Props> = ({ post }) => {
  const {
    id,
    title,
    body,
  } = post;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoad, setIsLoad] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isErrorDelete, setIsErrorDelete] = useState(false);
  const [isErrorAdding, setIsErrorAdding] = useState(false);
  const [isShowForm, setIsShowForm] = useState(false);

  const loadComments = async (postID: number) => {
    setIsLoad(false);
    setIsShowForm(false);
    try {
      await getComments(postID)
        .then(data => setComments(data));
    } catch (e) {
      setIsError(true);
    }

    setIsLoad(true);
  };

  const deleteComment = async (commentID: number) => {
    try {
      setComments(current => {
        return current.filter(comment => comment.id !== commentID);
      });
      removeComment(commentID);

      if (isErrorDelete) {
        setIsErrorDelete(false);
      }
    } catch (e) {
      setIsErrorDelete(true);
    }
  };

  const addNewComment = async (commentData: CommentData) => {
    setIsLoad(false);
    try {
      const newComment = await addComment({
        postId: id,
        name: commentData.name,
        email: commentData.email,
        body: commentData.body,
      });

      await setComments(current => [...current, newComment]);

      if (isErrorAdding) {
        setIsErrorAdding(false);
      }
    } catch (error) {
      setIsErrorAdding(true);
    } finally {
      setIsLoad(true);
    }
  };

  useEffect(() => {
    loadComments(post.id);
  }, [post.id]);

  return (
    <div className="content" data-cy="PostDetails">
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">
            {`#${id}: ${title}`}
          </h2>

          <p data-cy="PostBody">
            {body}
          </p>
        </div>

        <div className="block">
          { !isLoad && (<Loader />) }

          { isLoad && isError && (
            <div className="notification is-danger" data-cy="CommentsError">
              Something went wrong
            </div>
          )}

          { isLoad && !isError && comments.length === 0 && (
            <p className="title is-4" data-cy="NoCommentsMessage">
              No comments yet
            </p>
          )}

          {isLoad && !isError && comments.length > 0 && (
            <>
              <p className="title is-4">Comments:</p>

              { isErrorDelete && (
                <div className="notification is-danger">
                  Error with deleting comments!
                </div>
              )}

              { comments.map(comment => (
                <article
                  className="message is-small"
                  data-cy="Comment"
                  key={comment.id}
                >
                  <div className="message-header">
                    <a
                      href={`mailto:${comment.email}`}
                      data-cy="CommentAuthor"
                    >
                      {comment.name}
                    </a>
                    <button
                      data-cy="CommentDelete"
                      type="button"
                      className="delete is-small"
                      aria-label="delete"
                      onClick={() => deleteComment(comment.id)}
                    >
                      delete button
                    </button>

                  </div>

                  <div className="message-body" data-cy="CommentBody">
                    {comment.body}
                  </div>
                </article>
              ))}
            </>
          )}

          {!isShowForm && isLoad && !isError && ( // TODO
            <button
              data-cy="WriteCommentButton"
              type="button"
              className="button is-link"
              onClick={() => setIsShowForm(true)}
            >
              Write a comment
            </button>
          )}

        </div>
        { isShowForm && (
          <NewCommentForm onSubmit={addNewComment} />
        )}

        { isErrorAdding && (
          <div className="notification is-danger">
            Error with adding comments!
          </div>
        )}

      </div>
    </div>
  );
};