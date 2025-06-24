import { prisma } from "@/lib/prisma";

async function debugTraineeMentor() {
  try {
    console.log("=== DEBUGGING TRAINEE-MENTOR RELATIONSHIP ===\n");

    // First, let's see all users and their types
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
      },
    });

    console.log("All Users:");
    allUsers.forEach((user) => {
      console.log(
        `  ${user.userType}: ${user.name} (${user.email}) - ID: ${user.id}`
      );
    });

    console.log("\n" + "=".repeat(50) + "\n");

    // Get all trainee profiles with their mentor info
    const traineeProfiles = await prisma.traineeProfile.findMany({
      include: {
        user: true,
        mentor: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("Trainee Profiles:");
    for (const trainee of traineeProfiles) {
      console.log(`\nTrainee: ${trainee.user.name}`);
      console.log(`  Trainee Profile ID: ${trainee.id}`);
      console.log(`  User ID: ${trainee.userId}`);
      console.log(`  Mentor ID: ${trainee.mentorId}`);

      if (trainee.mentor) {
        console.log(`  ✅ Mentor Found: ${trainee.mentor.user.name}`);
        console.log(`  Mentor Profile ID: ${trainee.mentor.id}`);
        console.log(`  Mentor User ID: ${trainee.mentor.userId}`);
        console.log(
          `  Mentor Specialization: ${
            trainee.mentor.specialization || "Not set"
          }`
        );
      } else {
        console.log(
          `  ❌ No mentor found despite mentorId: ${trainee.mentorId}`
        );

        // Let's check if the mentor profile exists
        if (trainee.mentorId) {
          const mentorExists = await prisma.mentorProfile.findUnique({
            where: { id: trainee.mentorId },
            include: { user: true },
          });

          if (mentorExists) {
            console.log(
              `  🔍 Mentor profile exists: ${mentorExists.user.name}`
            );
          } else {
            console.log(
              `  💥 Mentor profile with ID ${trainee.mentorId} does NOT exist`
            );
          }
        }
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Get all mentor profiles
    const mentorProfiles = await prisma.mentorProfile.findMany({
      include: {
        user: true,
        trainees: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("Mentor Profiles:");
    for (const mentor of mentorProfiles) {
      console.log(`\nMentor: ${mentor.user.name}`);
      console.log(`  Mentor Profile ID: ${mentor.id}`);
      console.log(`  User ID: ${mentor.userId}`);
      console.log(`  Specialization: ${mentor.specialization || "Not set"}`);
      console.log(`  Number of trainees: ${mentor.trainees.length}`);

      mentor.trainees.forEach((trainee) => {
        console.log(`    - ${trainee.user.name}`);
      });
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Let's also test the exact query used in the API
    console.log("Testing API Query:");
    const testUserId = traineeProfiles[0]?.userId; // Get first trainee's user ID

    if (testUserId) {
      console.log(`Testing with user ID: ${testUserId}`);

      const apiTestResult = await prisma.user.findUnique({
        where: { id: testUserId },
        include: {
          traineeProfile: {
            include: {
              mentor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      console.log("API Test Result:");
      console.log(JSON.stringify(apiTestResult, null, 2));
    }
  } catch (error) {
    console.error("Debug error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTraineeMentor();
