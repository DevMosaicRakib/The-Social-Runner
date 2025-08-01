// Script to test event comments functionality
import { db } from '../server/db.js';
import { eventComments, users } from '../shared/schema.js';

async function testComments() {
  try {
    console.log('Testing event comments...');
    
    // Get first user for testing
    const [testUser] = await db.select().from(users).limit(1);
    if (!testUser) {
      console.log('No users found. Please create a user first.');
      return;
    }
    
    console.log(`Using test user: ${testUser.firstName} ${testUser.lastName}`);
    
    // Add a test comment to event 4 (St Peters parkrun)
    const testComment = await db.insert(eventComments).values({
      eventId: 4,
      userId: testUser.id,
      content: "Looking forward to this Saturday morning run! 🏃‍♂️",
      isQuickComment: false
    }).returning();
    
    console.log('Added test comment:', testComment[0]);
    
    // Add a quick comment
    const quickComment = await db.insert(eventComments).values({
      eventId: 4,
      userId: testUser.id,
      content: "I'll be there! 💪",
      isQuickComment: true
    }).returning();
    
    console.log('Added quick comment:', quickComment[0]);
    
    // Fetch all comments for event 4
    const allComments = await db.select({
      id: eventComments.id,
      content: eventComments.content,
      isQuickComment: eventComments.isQuickComment,
      createdAt: eventComments.createdAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl
      }
    })
    .from(eventComments)
    .innerJoin(users, db.eq(eventComments.userId, users.id))
    .where(db.eq(eventComments.eventId, 4))
    .orderBy(db.desc(eventComments.createdAt));
    
    console.log(`Found ${allComments.length} comments for event 4:`);
    allComments.forEach(comment => {
      console.log(`- ${comment.user.firstName}: "${comment.content}" ${comment.isQuickComment ? '(Quick)' : ''}`);
    });
    
    console.log('Event comments test completed successfully!');
    
  } catch (error) {
    console.error('Error testing comments:', error);
  }
  
  process.exit(0);
}

testComments();