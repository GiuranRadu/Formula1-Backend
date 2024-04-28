const Comment = require('../Models/commentModel')
const User = require('../Models/userModel')
const ApiFeatures = require('./../Utils/ApiFeatures');


exports.createComment = async (req, res, next) => {
  try {
    const creatorId = req.params.id

    const commentToAdd = {
      creatorId,
      ...req.body, // Use spread operator to include properties from req.body
    }

    const comment = await Comment.create(commentToAdd);

    await User.findByIdAndUpdate(creatorId, {
      $push: {
        comments: {
          commentId: comment._id,
          // info: comment.info,
          circuitId: comment.circuitId
        },
      },
    });
    res.status(201).json({
      status: 'created',
      comment
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}


exports.getAnyComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        status: "fail",
        message: "Comment with that ID does not exist"
      })
    } else {
      res.status(200).json({
        status: "success",
        comment
      })
    }
  } catch (error) {
    console.error('Error finding comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error finding comment'
    });
  }
}


exports.getSpecificUserComments = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    let comments = await Comment.find({ creatorId: userId });  //! preluam doar commenturile unde creatorId: userId
    res.status(200).json({
      status: 'success',
      data: {
        comments: comments,
      },
    });
  } catch (error) {
    console.error('Error finding comments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error finding comments',
    });
  }
};


exports.deleteComment = async (req, res, next) => {
  try {
    let commentToDeleteId = req.params.commentId;
    const deletedComment = await Comment.findByIdAndDelete(commentToDeleteId);

    if (!deletedComment) {
      //* If comment not found, send a 404 response
      return res.status(404).json({
        status: 'fail',
        data: `User with id: ${commentToDeleteId} not found`
      });
    }
    //! ------- Remove the `comment` reference from the `USERS` collection -------
    await User.updateMany(
      { "comments.commentId": commentToDeleteId },
      { $pull: { comments: { commentId: commentToDeleteId } } }
    );
    //! -----------------------------------------------------------------------

    res.status(204).json({
      status: "success",
      data: "Comment Deleted!"
    });
    console.log('Comment deleted: ', deletedComment);
  } catch (error) {
    // Handle unexpected errors
    console.error('Error deleting comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
}


exports.editComment = async (req, res, next) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, req.body, { new: true, runValidators: true });
  
    if (!updatedComment) {
      throw new Error('Comment with that id not found');
    }      
  
    res.status(200).json({
      status: 'success',
      data: { updatedComment },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }  
} 


//* for admin (role: full) -->  ❌(role: limited)
exports.getAllComments = async (req, res, next) => {
  const features = new ApiFeatures(Comment.find(), req.query).filter().sort().limitFields().paginate();
  let comments = await features.query
  res.status(200).json({
    status: 'success',
    count: comments.length,
    data: {
      comments
    }
  })
}