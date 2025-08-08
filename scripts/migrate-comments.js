// Migration script to update existing comments to new schema
// Run this in Sanity Studio's Vision tool or as a Node.js script

// This query will help you see what needs to be migrated:
/*
*[_type == "comment" && !defined(author)] {
  _id,
  name,
  email,
  comment,
  createdAt,
  approved,
  parentComment
}
*/

// Migration transactions - run these in Sanity Studio Vision:

// 1. First, get all comments that need migration:
const commentsToMigrate = `
*[_type == "comment" && !defined(author)] {
  _id,
  name,
  email,
  comment,
  createdAt,
  approved,
  parentComment,
  post
}
`;

// 2. For each comment, create a patch to update it:
/*
const commentId = "your-comment-id-here";

sanityClient.patch(commentId)
  .set({
    author: {
      name: "existing-name",
      email: "existing-email"
    },
    content: "existing-comment-text", 
    status: "approved", // or based on existing approved field
    thread: {
      depth: 0, // calculate based on parentComment
      path: "" // generate new path
    },
    reactions: {
      likes: 0,
      dislikes: 0
    },
    metadata: {
      isEdited: false
    },
    updatedAt: new Date().toISOString()
  })
  .unset(['name', 'email', 'comment', 'approved']) // remove old fields
  .commit()
*/

// 3. Helper function to calculate depth:
function calculateDepthFromParent(parentId, allComments) {
  if (!parentId) return 0;
  
  const parent = allComments.find(c => c._id === parentId);
  if (!parent) return 0;
  
  return 1 + calculateDepthFromParent(parent.parentComment?._ref, allComments);
}

console.log(`
To migrate your existing comments:

1. Run this query in Sanity Studio Vision to see what needs migration:
${commentsToMigrate}

2. For each comment, run a patch operation to update the schema
3. Test with a few comments first before doing bulk migration
4. Consider backing up your data first

The new schema provides:
- Better organization with author object
- Thread depth and path for efficient querying
- Status management (pending/approved/rejected/spam)
- Reactions support
- Edit tracking
- Metadata for spam protection
`);