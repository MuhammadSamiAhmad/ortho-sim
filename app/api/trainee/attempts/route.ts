import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get trainee profile
    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!traineeProfile) {
      return NextResponse.json(
        { error: "Trainee profile not found" },
        { status: 404 }
      );
    }

    // Get all surgery attempts for this trainee
    const attempts = await prisma.surgeryAttempt.findMany({
      where: { traineeProfileId: traineeProfile.id },
      include: {
        feedbacks: {
          include: {
            mentor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: { attemptDate: "desc" },
    });

    // Format the attempts data
    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      attemptDate: attempt.attemptDate.toISOString(),
      totalTime: attempt.totalTime,
      score: attempt.score,
      isCompleted: attempt.isCompleted,
      xrayImagePath: attempt.xrayImagePath,

      // Detailed metrics
      reductionDuration: attempt.reductionDuration,
      reductionNeededBoneLength: attempt.reductionNeededBoneLength,
      reductionActualBoneLength: attempt.reductionActualBoneLength,
      reductionAccuracy: attempt.reductionAccuracy,
      reductionBeforeXrayImg: attempt.reductionBeforeXrayImg,
      reductionAfterXrayImg: attempt.reductionAfterXrayImg,

      entrySiteDuration: attempt.entrySiteDuration,
      cuttingScreenshotImg: attempt.cuttingScreenshotImg,
      cuttingAccuracy: attempt.cuttingAccuracy,
      neededThandleDepth: attempt.neededThandleDepth,
      actualThandleDepth: attempt.actualThandleDepth,
      tHandleAccuracy: attempt.tHandleAccuracy,

      nailInsertionDuration: attempt.nailInsertionDuration,
      guideWireXrayImg: attempt.guideWireXrayImg,
      nailXrayImg: attempt.nailXrayImg,
      neededWireDepth: attempt.neededWireDepth,
      actualWireDepth: attempt.actualWireDepth,
      wirePositionAccuracy: attempt.wirePositionAccuracy,
      neededNailDepth: attempt.neededNailDepth,
      actualNailDepth: attempt.actualNailDepth,
      nailPositionAccuracy: attempt.nailPositionAccuracy,

      lockingClosureDuration: attempt.lockingClosureDuration,
      stepsAccuracy: attempt.stepsAccuracy,

      toolUsageOrder: attempt.toolUsageOrder,
      stepToolAccuracy: attempt.stepToolAccuracy,
      nailLockingSteps: attempt.nailLockingSteps,

      firstProximalScrewAccuracy: attempt.firstProximalScrewAccuracy,
      secondProximalScrewAccuracy: attempt.secondProximalScrewAccuracy,
      distalScrewAccuracy: attempt.distalScrewAccuracy,

      firstProximalLockingXray: attempt.firstProximalLockingXray,
      secondProximalLockingXray: attempt.secondProximalLockingXray,
      distalLockingXrayTopView: attempt.distalLockingXrayTopView,
      distalLockingXraySideView: attempt.distalLockingXraySideView,

      performanceDetail: attempt.performanceDetail,

      feedbacks: attempt.feedbacks.map((feedback) => ({
        id: feedback.id,
        comment: feedback.comment,
        rating: feedback.rating,
        createdAt: feedback.createdAt.toISOString(),
        mentor: {
          user: {
            name: feedback.mentor.user.name,
          },
        },
      })),
    }));

    return NextResponse.json(formattedAttempts);
  } catch (error) {
    console.error("Trainee attempts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch surgery attempts" },
      { status: 500 }
    );
  }
}
